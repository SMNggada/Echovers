import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Bookmark, Play, MoreVertical } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/formatters';

const { width } = Dimensions.get('window');

const BookmarksScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { bookmarks, podcasts, audiobooks, toggleBookmark } = useData(); // ✅ include toggleBookmark here
  const { playTrack } = usePlayer();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setIsLoading(false); // Data is already synced via DataContext
  }, [bookmarks]);

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (activeTab === 'all') return true;
    return bookmark.type === activeTab.slice(0, -1);
  });

  const getItemDetails = (bookmark) => {
    const { type, itemId } = bookmark;
    if (type === 'podcast') return podcasts.find(p => p.id === itemId);
    if (type === 'audiobook') return audiobooks.find(a => a.id === itemId);
    // Adjust for episodes if needed
    return null;
  };

  const handlePlay = (bookmark) => {
    const item = getItemDetails(bookmark);
    if (!item) return;

    if (bookmark.type === 'podcast') {
      navigation.navigate('ContentDetails', { id: item.id, type: 'podcast' });
    } else {
      playTrack({
        id: item.id,
        title: item.title,
        artist: item.authorName || 'Unknown',
        artwork: item.coverImage,
        url: item.audioUrl,
        type: bookmark.type,
      });
    }
  };

  const handleItemPress = (bookmark) => {
    const item = getItemDetails(bookmark);
    if (item) navigation.navigate('ContentDetails', { id: item.id, type: bookmark.type });
  };

 const handleOptions = (bookmark) => {
  Alert.alert(
    'Bookmark Options',
    'Choose an action',
    [
      {
        text: 'Remove Bookmark',
        onPress: async () => {
          try {
            await toggleBookmark(bookmark.itemId, bookmark.type, false);
          } catch (error) {
            console.error('Failed to remove bookmark', error);
          }
        },
        style: 'destructive',
      },
      { text: 'Cancel', style: 'cancel' },
    ],
    { cancelable: true }
  );
};

  const renderBookmarkItem = ({ item }) => {
    const bookmark = item;
    const content = getItemDetails(bookmark);
    if (!content) return null;

    return (
      <TouchableOpacity
        style={[styles.bookmarkItem, { borderBottomColor: theme.border }]}
        onPress={() => handleItemPress(bookmark)}
      >
        <Image source={{ uri: content.coverImage }} style={styles.bookmarkImage} />
        <View style={styles.bookmarkContent}>
          <Text style={[styles.bookmarkTitle, { color: theme.text }]} numberOfLines={1}>
            {content.title}
          </Text>
          <Text style={[styles.bookmarkSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {`${bookmark.type === 'podcast' ? 'Podcast' : 'Audiobook'} • ${content.authorName}`}
          </Text>
          {content.duration && (
            <Text style={[styles.bookmarkDuration, { color: theme.textMuted }]}>
              {formatDuration(content.duration)}
            </Text>
          )}
        </View>
        <View style={styles.bookmarkActions}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.primary }]}
            onPress={() => handlePlay(bookmark)}
          >
            <Play size={16} color="#fff" fill="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionsButton} onPress={() => handleOptions(bookmark)}>
            <MoreVertical size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Bookmarks</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        {['all', 'podcasts', 'audiobooks'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && [styles.activeTab, { borderBottomColor: theme.primary }]]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? theme.primary : theme.textSecondary }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredBookmarks.length > 0 ? (
        <FlatList
          data={filteredBookmarks}
          renderItem={renderBookmarkItem}
          keyExtractor={(item, index) => `${item.type}-${item.itemId}-${index}`}
          contentContainerStyle={styles.bookmarksList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Bookmark size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No bookmarks yet</Text>
          <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
            {activeTab === 'all'
              ? "You haven't bookmarked any content yet"
              : `You haven't bookmarked any ${activeTab} yet`}
          </Text>
          <TouchableOpacity
            style={[styles.discoverButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Discover')}
          >
            <Text style={styles.discoverButtonText}>Discover Content</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerRight: { width: 32 },
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2 },
  tabText: { fontSize: 14, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bookmarksList: { paddingBottom: 20 },
  bookmarkItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1 },
  bookmarkImage: { width: 60, height: 60, borderRadius: 8 },
  bookmarkContent: { flex: 1, marginLeft: 12, marginRight: 8, justifyContent: 'center' },
  bookmarkTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  bookmarkSubtitle: { fontSize: 14, marginBottom: 4 },
  bookmarkDuration: { fontSize: 12 },
  bookmarkActions: { justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8 },
  playButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  optionsButton: { padding: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyMessage: { fontSize: 14, textAlign: 'center', maxWidth: width * 0.7, marginBottom: 24 },
  discoverButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  discoverButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default BookmarksScreen;
