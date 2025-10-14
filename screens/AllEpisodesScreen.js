import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Play, MoreVertical, Clock, Calendar, Download } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { usePlayer } from '../contexts/PlayerContext';
import { formatDuration, formatDate } from '../utils/formatters';

const { width } = Dimensions.get('window');

const AllEpisodesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { podcasts, episodes } = useData();
  const { playTrack } = usePlayer();
  
  const { podcastId } = route.params || {};
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'shortest', 'longest'
  
  // Get podcast details
  const podcast = podcasts.find(p => p.id === podcastId);
  
  // Get episodes for this podcast
  const podcastEpisodes = episodes.filter(episode => episode.podcastId === podcastId);
  
  // Sort episodes
  const sortedEpisodes = [...podcastEpisodes].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.releaseDate) - new Date(a.releaseDate);
    } else if (sortBy === 'oldest') {
      return new Date(a.releaseDate) - new Date(b.releaseDate);
    } else if (sortBy === 'shortest') {
      return a.duration - b.duration;
    } else if (sortBy === 'longest') {
      return b.duration - a.duration;
    }
    return 0;
  });
  
  // Handle episode play
  const handlePlayEpisode = (episode) => {
    playTrack({
      id: episode.id,
      title: episode.title,
      artist: podcast?.authorName || 'Unknown',
      artwork: episode.coverImage || podcast?.coverImage,
      url: episode.audioUrl,
      type: 'episode',
      podcastId: podcast?.id,
      podcastTitle: podcast?.title
    });
  };
  
  // Handle episode options
  const handleEpisodeOptions = (episode) => {
    // Show bottom sheet with options
    console.log('Show options for episode:', episode.id);
  };
  
  // Render episode item
  const renderEpisodeItem = ({ item }) => {
    const episode = item;
    
    return (
      <View 
        style={[
          styles.episodeItem, 
          { borderBottomColor: theme.border }
        ]}
      >
        <Image 
          source={{ uri: episode.coverImage || podcast?.coverImage }} 
          style={styles.episodeImage} 
        />
        
        <View style={styles.episodeContent}>
          <Text 
            style={[styles.episodeTitle, { color: theme.text }]}
            numberOfLines={2}
          >
            {episode.title}
          </Text>
          
          <Text 
            style={[styles.episodeDescription, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {episode.description}
          </Text>
          
          <View style={styles.episodeMeta}>
            <View style={styles.metaItem}>
              <Calendar size={14} color={theme.textMuted} style={styles.metaIcon} />
              <Text style={[styles.metaText, { color: theme.textMuted }]}>
                {formatDate(episode.releaseDate)}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Clock size={14} color={theme.textMuted} style={styles.metaIcon} />
              <Text style={[styles.metaText, { color: theme.textMuted }]}>
                {formatDuration(episode.duration)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.episodeActions}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.primary }]}
            onPress={() => handlePlayEpisode(episode)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Play size={16} color="#fff" fill="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => handleEpisodeOptions(episode)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={theme.icon} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          All Episodes
        </Text>
        
        <View style={styles.headerRight} />
      </View>
      
      {/* Podcast Info */}
      {podcast && (
        <View style={[styles.podcastInfo, { backgroundColor: theme.card }]}>
          <Image 
            source={{ uri: podcast.coverImage }} 
            style={styles.podcastImage} 
          />
          
          <View style={styles.podcastDetails}>
            <Text style={[styles.podcastTitle, { color: theme.text }]}>
              {podcast.title}
            </Text>
            
            <Text style={[styles.podcastAuthor, { color: theme.textSecondary }]}>
              {podcast.authorName}
            </Text>
            
            <Text style={[styles.episodeCount, { color: theme.textMuted }]}>
              {podcastEpisodes.length} {podcastEpisodes.length === 1 ? 'episode' : 'episodes'}
            </Text>
          </View>
        </View>
      )}
      
      {/* Sort Options */}
      <View style={[styles.sortContainer, { borderBottomColor: theme.border }]}>
        <Text style={[styles.sortLabel, { color: theme.textSecondary }]}>
          Sort by:
        </Text>
        
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === 'newest' && [styles.activeSortOption, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setSortBy('newest')}
        >
          <Text 
            style={[
              styles.sortText, 
              { color: sortBy === 'newest' ? theme.primary : theme.textSecondary }
            ]}
          >
            Newest
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === 'oldest' && [styles.activeSortOption, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setSortBy('oldest')}
        >
          <Text 
            style={[
              styles.sortText, 
              { color: sortBy === 'oldest' ? theme.primary : theme.textSecondary }
            ]}
          >
            Oldest
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === 'shortest' && [styles.activeSortOption, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setSortBy('shortest')}
        >
          <Text 
            style={[
              styles.sortText, 
              { color: sortBy === 'shortest' ? theme.primary : theme.textSecondary }
            ]}
          >
            Shortest
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === 'longest' && [styles.activeSortOption, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setSortBy('longest')}
        >
          <Text 
            style={[
              styles.sortText, 
              { color: sortBy === 'longest' ? theme.primary : theme.textSecondary }
            ]}
          >
            Longest
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Episodes List */}
      {sortedEpisodes.length > 0 ? (
        <FlatList
          data={sortedEpisodes}
          renderItem={renderEpisodeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.episodesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No episodes available
          </Text>
          <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
            This podcast doesn't have any episodes yet
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  podcastInfo: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  podcastImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  podcastDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  podcastAuthor: {
    fontSize: 14,
    marginBottom: 4,
  },
  episodeCount: {
    fontSize: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 12,
  },
  sortOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  activeSortOption: {
    borderBottomWidth: 2,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
  },
  episodesList: {
    paddingBottom: 20,
  },
  episodeItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  episodeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  episodeContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  episodeDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
  },
  episodeActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionsButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: width * 0.7,
  },
});

export default AllEpisodesScreen;