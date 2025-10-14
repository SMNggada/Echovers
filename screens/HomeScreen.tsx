import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, Bell, ChevronRight } from 'lucide-react-native';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  ImageCarousel,
  SectionTitle,
  ContinueListeningCard,
  PodcastCard,
  PlaylistCard,
  Tag
} from '../components';

const { width } = Dimensions.get('window');

// BBC Sounds-inspired accent color and shared hit slop
const ACCENT = '#E85C0D';
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const {
    podcasts,
    audiobooks,
    playlists,
    continueListening,
    categories,
    isLoading
  } = useData();
  
  const [featuredPodcasts, setFeaturedPodcasts] = useState<any[]>([]);
  const [recommendedAudiobooks, setRecommendedAudiobooks] = useState<any[]>([]);
  const [editorsPicks, setEditorsPicks] = useState<any[]>([]);
  const [latestPlaylists, setLatestPlaylists] = useState<any[]>([]);
  const [recommendedForYou, setRecommendedForYou] = useState<any[]>([]);
  
  // Prepare data for display
  useEffect(() => {
    if (podcasts.length > 0) {
      // Featured podcasts (first 5)
      setFeaturedPodcasts(podcasts.slice(0, 5));
      
      // Editor's picks (random selection of 6 podcasts)
      const shuffledPodcasts = [...podcasts].sort(() => Math.random() - 0.5);
      setEditorsPicks(shuffledPodcasts.slice(0, 6));
      
      // Recommended for you (based on categories - mock implementation)
      const recommendedContent = [
        ...podcasts.slice(0, 8).map(item => ({ ...item, type: 'podcast' })),
        ...audiobooks.slice(0, 8).map(item => ({ ...item, type: 'audiobook' }))
      ].sort(() => Math.random() - 0.5);
      setRecommendedForYou(recommendedContent);
    }
    
    // Recommended audiobooks
    setRecommendedAudiobooks(audiobooks.slice(0, 10));
    
    // Latest playlists
    setLatestPlaylists(playlists.slice(0, 5));
  }, [podcasts, audiobooks, playlists]);
  
  const renderRecommendedItem = (item: any) => {
    if (item.type === 'podcast') {
      return (
        <PodcastCard
          key={`podcast-${item.id}`}
          item={item}
          style={styles.recommendedItem}
          onPress={() => navigation.navigate('ContentDetails', { id: item.id, type: 'podcast' })}
        />
      );
    } else if (item.type === 'audiobook') {
      return (
        <TouchableOpacity
          key={`audiobook-${item.id}`}
          style={styles.recommendedItem}
          onPress={() => navigation.navigate('ContentDetails', { id: item.id, type: 'audiobook' })}
        >
          <Image source={{ uri: item.coverImage }} style={styles.recommendedImage} />
          <Text style={styles.recommendedTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.recommendedSubtitle} numberOfLines={1}>{item.authorName}</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Echovers</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            hitSlop={HIT_SLOP}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            hitSlop={HIT_SLOP}
            onPress={() => navigation.navigate('Search')}
          >
            <Search size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        {featuredPodcasts.length > 0 && (
          <View style={styles.carouselContainer}>
            <ImageCarousel
              images={featuredPodcasts.map(podcast => ({
                uri: podcast.coverImage,
                title: podcast.title,
                subtitle: podcast.authorName
              }))}
            />
          </View>
        )}
        
        {/* Continue Listening Section */}
        {continueListening.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <SectionTitle title="Continue Listening" />
              <TouchableOpacity style={styles.seeAllButton} hitSlop={HIT_SLOP}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.continueListeningContainer}
            >
              {continueListening.map((item) => (
                <ContinueListeningCard
                  key={item.id}
                  item={{
                    id: item.id,
                    title: item.title,
                    author: item.authorName || 'Unknown',
                    progress: item.progress,
                    image: item.coverImage
                  }}
                  style={styles.continueListeningCard}
                  onPress={() => navigation.navigate('ContentDetails', { id: item.id, type: 'episode' })}
                />
              ))}
            </ScrollView>
          </>
        )}
        
        {/* Discover Podcasts Section */}
        {podcasts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <SectionTitle title="Discover Podcasts" />
              <TouchableOpacity 
                style={styles.seeAllButton}
                hitSlop={HIT_SLOP}
                onPress={() => navigation.navigate('Discover', { initialCategory: 'podcasts' })}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.podcastsContainer}
            >
              {podcasts.slice(0, 10).map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  item={podcast}
                  style={styles.podcastCard}
                  onPress={() => navigation.navigate('ContentDetails', { id: podcast.id, type: 'podcast' })}
                />
              ))}
            </ScrollView>
          </>
        )}
        
        {/* Audiobooks Section */}
        {recommendedAudiobooks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <SectionTitle title="Audiobooks" />
              <TouchableOpacity 
                style={styles.seeAllButton}
                hitSlop={HIT_SLOP}
                onPress={() => navigation.navigate('Discover', { initialCategory: 'audiobooks' })}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.audiobooksContainer}
            >
              {recommendedAudiobooks.map((audiobook) => (
                <View key={audiobook.id} style={styles.audiobookCard}>
                  <Image source={{ uri: audiobook.coverImage }} style={styles.audiobookImage} />
                  <Text style={styles.audiobookTitle} numberOfLines={1}>{audiobook.title}</Text>
                  <Text style={styles.audiobookAuthor} numberOfLines={1}>{audiobook.authorName}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
        
        {/* Latest Playlists Section */}
        {latestPlaylists.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <SectionTitle title="Latest Playlists" />
              <TouchableOpacity 
                style={styles.seeAllButton}
                hitSlop={HIT_SLOP}
                onPress={() => navigation.navigate('Discover', { initialCategory: 'playlists' })}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
            
            {latestPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                item={{
                  id: playlist.id,
                  title: playlist.title,
                  description: playlist.description || '',
                  image: playlist.coverImage
                }}
                style={styles.playlistCard}
                onPress={() => navigation.navigate('ContentDetails', { id: playlist.id, type: 'playlist' })}
              />
            ))}
          </>
        )}
        
        {/* Editor's Pick Section */}
        {editorsPicks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <SectionTitle title="Editor's Pick" />
              <TouchableOpacity 
                style={styles.seeAllButton}
                hitSlop={HIT_SLOP}
                onPress={() => navigation.navigate('Discover', { initialCategory: 'podcasts' })}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.editorsPickContainer}
            >
              {editorsPicks.map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  item={podcast}
                  style={styles.editorPickCard}
                  onPress={() => navigation.navigate('ContentDetails', { id: podcast.id, type: 'podcast' })}
                />
              ))}
            </ScrollView>
          </>
        )}
        
        {/* Recommended For You Section */}
        {recommendedForYou.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <SectionTitle title="Recommended For You" />
              <TouchableOpacity 
                style={styles.seeAllButton}
                hitSlop={HIT_SLOP}
                onPress={() => navigation.navigate('Discover')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedContainer}
            >
              {recommendedForYou.map(item => renderRecommendedItem(item))}
            </ScrollView>
          </>
        )}
        
        {/* Collections Section */}
        <View style={styles.sectionHeader}>
          <SectionTitle title="Collections" />
          <TouchableOpacity style={styles.seeAllButton} hitSlop={HIT_SLOP}>
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight size={16} color={ACCENT} />
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionsContainer}
        >
          {['Popular', 'Trending', 'New Releases', 'Award Winners', 'Staff Picks', 'Hidden Gems'].map((collection) => (
            <TouchableOpacity key={collection} style={styles.collectionTag} hitSlop={HIT_SLOP}>
              <Text style={styles.collectionTagText}>{collection}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Categories Section */}
        {categories.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <SectionTitle title="Categories" />
              <TouchableOpacity style={styles.seeAllButton} hitSlop={HIT_SLOP}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.categoriesContainer}>
              {categories.slice(0, 12).map((category) => (
                <Tag
                  key={category.id}
                  label={category.name}
                  onPress={() => console.log('Category pressed:', category.name)}
                  style={styles.categoryTag}
                />
              ))}
            </View>
          </>
        )}
        
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  carouselContainer: {
    height: 200,
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: '700',
    marginRight: 4,
  },
  continueListeningContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  continueListeningCard: {
    width: 280,
    marginRight: 12,
  },
  podcastsContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  podcastCard: {
    width: 160,
    marginRight: 12,
  },
  audiobooksContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  audiobookCard: {
    width: 120,
    marginRight: 12,
  },
  audiobookImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  audiobookTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  audiobookAuthor: {
    fontSize: 12,
    color: '#555',
  },
  playlistCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  editorsPickContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  editorPickCard: {
    width: 140,
    marginRight: 12,
  },
  recommendedContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  recommendedItem: {
    width: 120,
    marginRight: 12,
  },
  recommendedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  recommendedSubtitle: {
    fontSize: 12,
    color: '#555',
  },
  collectionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  collectionTag: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  collectionTagText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryTag: {
    marginRight: 8,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 80,
  },
});

export default HomeScreen;