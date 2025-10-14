import React, { useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useData } from '../context/DataContext';
import { usePlayer } from '../context/PlayerContext';
import { Play } from 'lucide-react-native';
import type { RootStackParamList } from '../Navigation'; // Adjust the import path

// Types
interface DownloadItem {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  fileSize: string;
  progress: number; // 0-100
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error';
  localPath?: string; // Add if using local file paths from downloadedContent
}

type DownloadsScreenRouteProp = RouteProp<RootStackParamList, 'Downloads'>;
type DownloadsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DownloadsScreen = () => {
  const navigation = useNavigation<DownloadsScreenNavigationProp>();
  const { downloadedContent, downloadContent } = useData();
  const { play } = usePlayer();
  const route = useRoute<DownloadsScreenRouteProp>();

  // Map downloadedContent to match DownloadItem structure
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  useEffect(() => {
    // Transform downloadedContent into the DownloadItem format
    const mappedDownloads = downloadedContent.map(item => ({
      id: item.id,
      title: item.title || 'Untitled',
      artist: item.authorName || 'Unknown Author',
      imageUrl: item.coverImage || `https://api.a0.dev/assets/image?text=${encodeURIComponent(item.title || 'Cover')}&aspect=1:1`,
      fileSize: item.fileSize || 'Unknown', // Add fileSize if available in your data
      progress: item.progress || 100, // Assume 100% if completed, adjust based on your data
      status: item.localPath ? 'completed' : 'queued', // Simplified status logic
      localPath: item.localPath,
    }));
    setDownloads(mappedDownloads);
  }, [downloadedContent]);

  // Get total space used (mocked for now, replace with actual calculation)
  const getTotalSpaceUsed = (): string => {
    // In a real app, calculate from file sizes (e.g., using ReactNativeBlobUtil.fs.stat)
    return `${downloadedContent.length * 30} MB`; // Placeholder calculation
  };

  // Handle play action
  const handlePlay = useCallback((item: DownloadItem) => {
    if (item.status !== 'completed') {
      Alert.alert('Not Downloaded', 'This audio is not fully downloaded yet.');
      return;
    }
    if (play && item.localPath) {
      play({ ...item, audioUrl: item.localPath }); // Use localPath for playback
    } else {
      Alert.alert('Error', 'Unable to play the file.');
    }
  }, [play]);

  // Handle pause/resume download (simplified, to be enhanced)
  const toggleDownload = useCallback((item: DownloadItem) => {
    setDownloads(prevDownloads =>
      prevDownloads.map(download => {
        if (download.id === item.id) {
          if (download.status === 'downloading') {
            return { ...download, status: 'paused' };
          } else if (download.status === 'paused' || download.status === 'queued') {
            // Simulate download progress (replace with actual download logic)
            if (download.progress < 100) {
              downloadContent(item); // Trigger real download
              return { ...download, status: 'downloading', progress: download.progress + 10 }; // Mock progress
            }
            return { ...download, status: 'completed', progress: 100 };
          }
        }
        return download;
      })
    );
  }, [downloadContent]);

  // Handle delete download
  const handleDelete = useCallback((item: DownloadItem) => {
    Alert.alert(
      'Delete Download',
      'Are you sure you want to delete this download?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDownloads(prevDownloads =>
              prevDownloads.filter(download => download.id !== item.id)
            );
            // In a real app, delete the file from storage and update Firestore
            // Example: ReactNativeBlobUtil.fs.unlink(item.localPath).then(() => console.log('Deleted'));
          },
        },
      ]
    );
  }, []);

  // Render individual download item
  const renderDownloadItem = useCallback(({ item }: { item: DownloadItem }) => {
    return (
      <View style={styles.downloadItem}>
        <TouchableOpacity
          style={styles.downloadContent}
          onPress={() => handlePlay(item)}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
          <View style={styles.downloadInfo}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
            <View style={styles.downloadStatus}>
              {item.status === 'downloading' && (
                <>
                  <ActivityIndicator size="small" color="#4361ee" />
                  <Text style={styles.statusText}>
                    Downloading {item.progress}%
                  </Text>
                </>
              )}
              {item.status === 'paused' && (
                <Text style={styles.statusText}>
                  Paused {item.progress}%
                </Text>
              )}
              {item.status === 'queued' && (
                <Text style={styles.statusText}>Queued</Text>
              )}
              {item.status === 'completed' && (
                <>
                  <View style={styles.completedDot} />
                  <Text style={[styles.statusText, styles.completedText]}>
                    Downloaded {item.fileSize}
                  </Text>
                </>
              )}
              {item.status === 'error' && (
                <Text style={[styles.statusText, styles.errorText]}>
                  Error - Try Again
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          {(item.status === 'downloading' || item.status === 'paused' || item.status === 'queued') && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleDownload(item)}
            >
              <Text style={styles.actionButtonText}>
                {item.status === 'downloading' ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        {item.progress > 0 && item.progress < 100 && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${item.progress}%` },
              ]}
            />
          </View>
        )}
      </View>
    );
  }, [handlePlay, toggleDownload, handleDelete]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Downloads</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>Done</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statsItem}>
          <Text style={styles.statsValue}>
            {downloads.filter(d => d.status === 'completed').length}
          </Text>
          <Text style={styles.statsLabel}>Files</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsValue}>{getTotalSpaceUsed()}</Text>
          <Text style={styles.statsLabel}>Used</Text>
        </View>
      </View>
      <View style={styles.storageInfoContainer}>
        <View style={styles.storageBarContainer}>
          <View style={styles.storageBar}>
            <View style={styles.storageUsedBar} />
          </View>
        </View>
        <Text style={styles.storageText}>
          {getTotalSpaceUsed()} of 1.0 GB Used
        </Text>
      </View>
      <FlatList
        data={downloads}
        renderItem={renderDownloadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.downloadsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No downloads yet</Text>
            <Text style={styles.emptySubText}>
              Audio you download will appear here for offline listening
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Discover')}
            >
              <Text style={styles.browseButtonText}>
                Browse Audio
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    color: '#4361ee',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsItem: {
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  storageInfoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storageBarContainer: {
    marginBottom: 8,
  },
  storageBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
  },
  storageUsedBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 6,
    width: '15%', // Adjust based on actual usage
    backgroundColor: '#4361ee',
    borderRadius: 3,
  },
  storageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  downloadsList: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  downloadItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  downloadContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  downloadInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  downloadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
  completedText: {
    color: '#05c46b',
  },
  errorText: {
    color: '#ff3b30',
  },
  completedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#05c46b',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4361ee',
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4361ee',
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#ff3b30',
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: '#f0f0f0',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#4361ee',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DownloadsScreen;