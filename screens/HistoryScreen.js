import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Clock, Play, MoreVertical } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration, formatRelativeTime } from '../utils/formatters';

const { width } = Dimensions.get('window');

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { podcasts, episodes, audiobooks } = useData();
  const { playTrack } = usePlayer();
  
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'today', 'week', 'month'
  
  // Fetch history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be fetched from Firestore
        // For now, we'll simulate with mock data
        
        // Generate random history entries
        const mockHistory = [];
        
        // Today's entries
        for (let i = 0; i < 5; i++) {
          const randomHours = Math.floor(Math.random() * 12);
          const timestamp = new Date(Date.now() - randomHours * 60 * 60 * 1000).toISOString();
          
          if (Math.random() > 0.5) {
            // Episode
            const randomEpisode = episodes[Math.floor(Math.random() * episodes.length)];
            mockHistory.push({
              id: `history-episode-${i}`,
              itemId: randomEpisode.id,
              type: 'episode',
              timestamp,
              progress: Math.random() * randomEpisode.duration,
              completed: Math.random() > 0.7
            });
          } else {
            // Audiobook
            const randomAudiobook = audiobooks[Math.floor(Math.random() * audiobooks.length)];
            mockHistory.push({
              id: `history-audiobook-${i}`,
              itemId: randomAudiobook.id,
              type: 'audiobook',
              timestamp,
              progress: Math.random() * randomAudiobook.duration,
              completed: Math.random() > 0.7
            });
          }
        }
        
        // This week's entries
        for (let i = 0; i < 10; i++) {
          const randomDays = Math.floor(Math.random() * 6) + 1; // 1-6 days ago
          const timestamp = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000).toISOString();
          
          if (Math.random() > 0.5) {
            // Episode
            const randomEpisode = episodes[Math.floor(Math.random() * episodes.length)];
            mockHistory.push({
              id: `history-episode-week-${i}`,
              itemId: randomEpisode.id,
              type: 'episode',
              timestamp,
              progress: Math.random() * randomEpisode.duration,
              completed: Math.random() > 0.5
            });
          } else {
            // Audiobook
            const randomAudiobook = audiobooks[Math.floor(Math.random() * audiobooks.length)];
            mockHistory.push({
              id: `history-audiobook-week-${i}`,
              itemId: randomAudiobook.id,
              type: 'audiobook',
              timestamp,
              progress: Math.random() * randomAudiobook.duration,
              completed: Math.random() > 0.5
            });
          }
        }
        
        // This month's entries
        for (let i = 0; i < 15; i++) {
          const randomDays = Math.floor(Math.random() * 23) + 7; // 7-29 days ago
          const timestamp = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000).toISOString();
          
          if (Math.random() > 0.5) {
            // Episode
            const randomEpisode = episodes[Math.floor(Math.random() * episodes.length)];
            mockHistory.push({
              id: `history-episode-month-${i}`,
              itemId: randomEpisode.id,
              type: 'episode',
              timestamp,
              progress: Math.random() * randomEpisode.duration,
              completed: Math.random() > 0.3
            });
          } else {
            // Audiobook
            const randomAudiobook = audiobooks[Math.floor(Math.random() * audiobooks.length)];
            mockHistory.push({
              id: `history-audiobook-month-${i}`,
              itemId: randomAudiobook.id,
              type: 'audiobook',
              timestamp,
              progress: Math.random() * randomAudiobook.duration,
              completed: Math.random() > 0.3
            });
          }
        }
        
        // Sort by most recent
        mockHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setHistory(mockHistory);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, []);
  
  // Filter history based on active tab
  const filteredHistory = history.filter(item => {
    const itemDate = new Date(item.timestamp);
    const now = new Date();
    
    if (activeTab === 'all') {
      return true;
    } else if (activeTab === 'today') {
      // Today: same day
      return itemDate.toDateString() === now.toDateString();
    } else if (activeTab === 'week') {
      // This week: last 7 days
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return itemDate >= weekAgo;
    } else if (activeTab === 'month') {
      // This month: last 30 days
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      return itemDate >= monthAgo;
    }
    
    return true;
  });
  
  // Get item details based on history entry
  const getItemDetails = (historyItem) => {
    const { type, itemId } = historyItem;
    
    if (type === 'episode') {
      const episode = episodes.find(ep => ep.id === itemId);
      if (!episode) return null;
      
      const podcast = podcasts.find(p => p.id === episode.podcastId);
      return {
        ...episode,
        podcastTitle: podcast?.title || 'Unknown Podcast',
        podcastImage: podcast?.coverImage
      };
    } else if (type === 'audiobook') {
      return audiobooks.find(ab => ab.id === itemId);
    }
    
    return null;
  };
  
  // Handle play
  const handlePlay = (historyItem) => {
    const item = getItemDetails(historyItem);
    if (!item) return;
    
    playTrack({
      id: item.id,
      title: item.title,
      artist: historyItem.type === 'episode' ? item.podcastTitle : item.authorName,
      artwork: item.coverImage || item.podcastImage,
      url: item.audioUrl,
      type: historyItem.type,
      initialPosition: historyItem.progress // Resume from where left off
    });
  };
  
  // Handle item press
  const handleItemPress = (historyItem) => {
    const item = getItemDetails(historyItem);
    if (!item) return;
    
    if (historyItem.type === 'episode') {
      navigation.navigate('ContentDetails', {
        id: item.podcastId,
        type: 'podcast'
      });
    } else {
      navigation.navigate('ContentDetails', {
        id: item.id,
        type: 'audiobook'
      });
    }
  };
  
  // Handle options
  const handleOptions = (historyItem) => {
    // Show bottom sheet with options
    console.log('Show options for history item:', historyItem.id);
  };
  
  // Calculate progress percentage
  const getProgressPercentage = (historyItem) => {
    const item = getItemDetails(historyItem);
    if (!item || !item.duration) return 0;
    
    return (historyItem.progress / item.duration) * 100;
  };
  
  // Render history item
  const renderHistoryItem = ({ item }) => {
    const historyItem = item;
    const content = getItemDetails(historyItem);
    
    if (!content) return null;
    
    const progressPercentage = getProgressPercentage(historyItem);
    
    return (
      <TouchableOpacity
        style={[
          styles.historyItem,
          { borderBottomColor: theme.border }
        ]}
        onPress={() => handleItemPress(historyItem)}
      >
        <Image
          source={{ uri: content.coverImage || content.podcastImage }}
          style={styles.historyImage}
        />
        
        <View style={styles.historyContent}>
          <Text
            style={[styles.historyTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {content.title}
          </Text>
          
          <Text
            style={[styles.historySubtitle, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {historyItem.type === 'episode'
              ? content.podcastTitle
              : content.authorName
            }
          </Text>
          
          <View style={styles.historyMeta}>
            <Text style={[styles.historyTime, { color: theme.textMuted }]}>
              {formatRelativeTime(historyItem.timestamp)}
            </Text>
            
            {historyItem.completed ? (
              <Text style={[styles.historyCompleted, { color: theme.success }]}>
                Completed
              </Text>
            ) : (
              <Text style={[styles.historyProgress, { color: theme.textMuted }]}>
                {Math.round(progressPercentage)}% • {formatDuration(historyItem.progress)} / {formatDuration(content.duration)}
              </Text>
            )}
          </View>
          
          {/* Progress bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: historyItem.completed ? theme.success : theme.primary
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.historyActions}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.primary }]}
            onPress={() => handlePlay(historyItem)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Play size={16} color="#fff" fill="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => handleOptions(historyItem)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
          Listening History
        </Text>
        
        <View style={styles.headerRight} />
      </View>
      
      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && [styles.activeTab, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'all' ? theme.primary : theme.textSecondary }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'today' && [styles.activeTab, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setActiveTab('today')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'today' ? theme.primary : theme.textSecondary }
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'week' && [styles.activeTab, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setActiveTab('week')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'week' ? theme.primary : theme.textSecondary }
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'month' && [styles.activeTab, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setActiveTab('month')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'month' ? theme.primary : theme.textSecondary }
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Clock size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No listening history
          </Text>
          <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
            {activeTab === 'all'
              ? "You haven't listened to any content yet"
              : activeTab === 'today'
                ? "You haven't listened to anything today"
                : activeTab === 'week'
                  ? "You haven't listened to anything this week"
                  : "You haven't listened to anything this month"
            }
          </Text>
          <TouchableOpacity
            style={[styles.discoverButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Discover')}
          >
            <Text style={styles.discoverButtonText}>
              Discover Content
            </Text>
          </TouchableOpacity>
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyList: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  historyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  historyContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyTime: {
    fontSize: 12,
  },
  historyProgress: {
    fontSize: 12,
  },
  historyCompleted: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  historyActions: {
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: width * 0.7,
    marginBottom: 24,
  },
  discoverButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HistoryScreen;