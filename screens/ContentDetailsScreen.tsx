import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Heart,
  Share2,
  Download,
  Play,
  Pause,
  Plus,
  Clock,
  Calendar,
  Headphones,
  Star,
  MoreVertical,
  ChevronRight,
  Bookmark
} from 'lucide-react-native';
import RootStackParamList from '../App';
import { useData } from '../context/DataContext';
import { usePlayer } from '../context/PlayerContext';
import { Tag } from '../components';

// Simple ActionIcon component
type ActionIconProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

const ActionIcon: React.FC<ActionIconProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.iconButton} onPress={onPress}>
    {icon}
    <Text style={{ fontSize: 12, color: '#333', marginTop: 4, textAlign: 'center' }}>{label}</Text>
  </TouchableOpacity>
);

const { width } = Dimensions.get('window');

type ContentDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ContentDetails'>;
type ContentDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ContentDetailsScreen: React.FC = () => {
  const navigation = useNavigation<ContentDetailsScreenNavigationProp>();
  const route = useRoute<ContentDetailsScreenRouteProp>();
  const { id, type } = route.params;
  
  const { podcasts, audiobooks, isLoading, toggleBookmark, downloadContent, downloadedContent, addToPlaylistQuick, toggleSubscription, subscriptions, bookmarks } = useData();
  const { isPlaying, currentTrack, play, pause, resume } = usePlayer();
  
  const [content, setContent] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isContentPlaying, setIsContentPlaying] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

  // Sync isDownloaded when content or downloadedContent changes
  useEffect(() => {
    if (content && downloadedContent) {
      setIsDownloaded(downloadedContent.some((item: any) => item.id === content.id));
    } else {
      setIsDownloaded(false);
    }
  }, [content, downloadedContent]);
  
  // Fetch content details
  useEffect(() => {
    const fetchContent = async () => {
      let contentData = null;
      let episodesData: any[] = [];
      
      if (type === 'podcast') {
        contentData = podcasts.find(podcast => podcast.id === id);
        // In a real app, we would fetch episodes for this podcast
        episodesData = contentData?.episodes || [];
      } else if (type === 'audiobook') {
        contentData = audiobooks.find(audiobook => audiobook.id === id);
      } else if (type === 'episode') {
        // Find the episode and its parent podcast
        for (const podcast of podcasts) {
          if (podcast.episodes) {
            const episode = podcast.episodes.find((ep: any) => ep.id === id);
            if (episode) {
              contentData = episode;
              contentData.podcast = podcast;
              break;
            }
          }
        }
      }
      
      setContent(contentData);
      setEpisodes(episodesData);
      // sync flags from context
      if (contentData) {
        const bookmarked = bookmarks.some(b => b.id === (type === 'episode' ? contentData.id : contentData.id));
        setIsBookmarked(bookmarked);
      }
      if (type === 'podcast' && contentData) {
        setIsSubscribed(subscriptions.includes(contentData.id));
      }
    };
    
    fetchContent();
  }, [id, type, podcasts, audiobooks]);
  
  // Check if this content is currently playing
  useEffect(() => {
    setIsContentPlaying(currentTrack?.id === content?.id);
    if (type === 'podcast' && content?.id) {
      setIsSubscribed(!!subscriptions?.includes(content.id));
    }
  }, [currentTrack, content, subscriptions, type]);

  // Handle play button press
  const handlePlay = () => {
    if (isContentPlaying) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else if (content) {
      play(content);
    }
  };

  // actions
  const onToggleBookmark = async () => {
    if (!content) return;
    await toggleBookmark(content.id, (type as any) === 'episode' ? 'episode' : (type as any), !isBookmarked);
    setIsBookmarked(v => !v);
  };

  const onToggleSubscription = async () => {
    if (type !== 'podcast' || !content) return;
    await toggleSubscription(content.id, !isSubscribed);
    setIsSubscribed(v => !v);
  };

  const handleDownload = useCallback(async () => {
    if (!id || !content) return;
    try {
      await downloadContent(content);
      setIsDownloaded(true);
      console.log('Download completed for:', content.title);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Error', 'Failed to download the content. Please try again.');
    }
  }, [id, content, downloadContent]);

  const handleAddToPlaylist = useCallback(async () => {
    if (!content) return;
    try {
      await addToPlaylistQuick(content);
      Alert.alert('Added', 'Content added to your playlist.');
    } catch (e: any) {
      Alert.alert('Playlist Error', e?.message || 'Failed to add to playlist');
    }
  }, [content, addToPlaylistQuick]);

  const handleSubscribe = useCallback(async () => {
    if (type !== 'podcast' || !content?.id) return;
    try {
      const next = !isSubscribed;
      await toggleSubscription(content.id, next);
      setIsSubscribed(next);
    } catch (e: any) {
      Alert.alert('Subscription Error', e?.message || 'Failed to update subscription');
    }
  }, [content, isSubscribed, toggleSubscription, type]);

  // Format duration (seconds to HH:MM:SS)
  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Render episode item
  const renderEpisodeItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity 
      style={styles.episodeItem}
      onPress={() => {
        navigation.navigate('ContentDetails', {
          id: item.id,
          type: 'episode'
        });
      }}
    >
      <View style={styles.episodeNumber}>
        <Text style={styles.episodeNumberText}>{index + 1}</Text>
      </View>
      
      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.episodeInfo}>
          <View style={styles.episodeInfoItem}>
            <Calendar size={12} color="#666" />
            <Text style={styles.episodeInfoText}>
              {formatDate(item.publishedAt)}
            </Text>
          </View>
          
          <View style={styles.episodeInfoItem}>
            <Clock size={12} color="#666" />
            <Text style={styles.episodeInfoText}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.episodePlayButton}
        onPress={() => play(item)}
      >
        <Play size={20} color="#1DB954" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  if (isLoading || !content) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {type === 'episode' ? 'Episode' : type === 'podcast' ? 'Podcast' : 'Audiobook'}
        </Text>
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: content.coverImage || 'https://api.a0.dev/assets/image?text=Echovers&aspect=1:1' }} 
            style={styles.coverImage} 
          />
        </View>
        
        <View style={styles.contentInfo}>
          <Text style={styles.title}>{content.title}</Text>
          
          <Text style={styles.author}>
            {content.authorName || content.author || 'Unknown'}
          </Text>
          
          {type === 'episode' && content.podcast && (
            <TouchableOpacity 
              style={styles.podcastLink}
              onPress={() => {
                navigation.navigate('ContentDetails', {
                  id: content.podcast.id,
                  type: 'podcast'
                });
              }}
            >
              <Text style={styles.podcastLinkText}>
                {content.podcast.title}
              </Text>
              <ChevronRight size={16} color="#1DB954" />
            </TouchableOpacity>
          )}
          
          <View style={styles.statsContainer}>
            {content.rating && (
              <View style={styles.statItem}>
                <Star size={16} color="#FFD700" />
                <Text style={styles.statText}>{content.rating}</Text>
              </View>
            )}
            
            {content.listens && (
              <View style={styles.statItem}>
                <Headphones size={16} color="#666" />
                <Text style={styles.statText}>
                  {content.listens > 1000 
                    ? `${(content.listens / 1000).toFixed(1)}K` 
                    : content.listens}
                </Text>
              </View>
            )}
            
            {content.duration && (
              <View style={styles.statItem}>
                <Clock size={16} color="#666" />
                <Text style={styles.statText}>
                  {formatDuration(content.duration)}
                </Text>
              </View>
            )}
            
            {content.publishedAt && (
              <View style={styles.statItem}>
                <Calendar size={16} color="#666" />
                <Text style={styles.statText}>
                  {formatDate(content.publishedAt)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionRows}>
            <ActionIcon
              icon={<Heart size={20} color="#2C3E50" />}
              label="Like"
              onPress={() => console.log('Like not implemented')}
            />
            <ActionIcon
              icon={<Download size={20} color={isDownloaded ? '#27AE60' : '#2C3E50'} />}
              label={isDownloaded ? 'Downloaded' : 'Download'}
              onPress={handleDownload}
            />
            <ActionIcon
              icon={<Plus size={20} color="#2C3E50" />}
              label="Playlist"
              onPress={handleAddToPlaylist}
            />
          </View>
          
          <View style={styles.actionRows}>
            <ActionIcon
              icon={<Bookmark size={20} color={isBookmarked ? '#F1C40F' : '#2C3E50'} />}
              label={isBookmarked ? 'Bookmarked' : 'Bookmark'}
              onPress={onToggleBookmark}
            />
            <ActionIcon
              icon={<Star size={20} color="#2C3E50" />}
              label={type === 'podcast' ? (isSubscribed ? 'Subscribed' : 'Subscribe') : 'Subscribe'}
              onPress={handleSubscribe}
            />
            <ActionIcon
              icon={<Share2 size={20} color="#2C3E50" />}
              label="Share"
              onPress={() => console.log('Share not implemented')}
            />
          </View>
          
          {content.tags && content.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {content.tags.map((tag: string, index: number) => (
                <Tag key={`tag-${index}`} label={tag} />
              ))}
            </View>
          )}
          
          {content.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{content.description}</Text>
            </View>
          )}
          
          {type === 'podcast' && episodes.length > 0 && (
            <View style={styles.episodesContainer}>
              <Text style={styles.sectionTitle}>Episodes</Text>
              <FlatList
                data={episodes}
                renderItem={renderEpisodeItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
          
          {type === 'podcast' && content.authorName && (
            <View style={styles.aboutCreatorContainer}>
              <Text style={styles.sectionTitle}>About {content.authorName}</Text>
              <Text style={styles.aboutCreatorText}>
                {content.authorBio || `${content.authorName} is a creator on Echovers.`}
              </Text>
              
              <View style={{ marginBottom: 16 }}>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isSubscribed ? '#7f8c8d' : '#1DB954' }]} onPress={onToggleSubscription}>
                  <Text style={styles.primaryButtonText}>{isSubscribed ? 'Unsubscribe' : 'Subscribe'}</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  moreButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#f9f9f9',
  },
  coverImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  contentInfo: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  podcastLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  podcastLinkText: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '600',
    marginRight: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  actionRows: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#1DB954',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    padding: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  episodesContainer: {
    marginBottom: 24,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  episodeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  episodeNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  episodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  episodeInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  episodePlayButton: {
    padding: 8,
  },
  aboutCreatorContainer: {
    marginBottom: 24,
  },
  aboutCreatorText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  followButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },

});

export default ContentDetailsScreen;

