import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Play, Trash2, ChevronRight } from 'lucide-react-native';
import type { RootStackParamList } from '../Navigation';
import { useData } from '../context/DataContext';
import { usePlayer } from '../context/PlayerContext';

// Types
interface Playlist {
  id: string;
  title: string;
  items: any[]; // Array of content (podcasts, audiobooks, episodes)
  createdAt: string;
}

type PlaylistScreenRouteProp = RouteProp<RootStackParamList, 'Playlist'>;
type PlaylistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PlaylistScreen: React.FC = () => {
  const navigation = useNavigation<PlaylistScreenNavigationProp>();
  const route = useRoute<PlaylistScreenRouteProp>();
  const { playlists, createPlaylist, addToPlaylist, removeFromPlaylist } = useData();
  const { play } = usePlayer();

  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Handle creating a new playlist
  const handleCreatePlaylist = useCallback(() => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name.');
      return;
    }
    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
  }, [newPlaylistName, createPlaylist]);

  // Handle playing a playlist
  const handlePlayPlaylist = useCallback((playlist: Playlist) => {
    if (play && playlist.items.length > 0) {
      play(playlist.items[0]); // Play the first item, can be enhanced to play all
    } else {
      Alert.alert('Error', 'No items in playlist to play.');
    }
  }, [play]);

  // Handle deleting a playlist
  const handleDeletePlaylist = useCallback((playlistId: string) => {
    Alert.alert(
      'Delete Playlist',
      'Are you sure you want to delete this playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeFromPlaylist(playlistId),
        },
      ]
    );
  }, [removeFromPlaylist]);

  // Handle navigating to playlist details
  const handleViewPlaylist = useCallback((playlistId: string) => {
    navigation.navigate('PlaylistDetails', { playlistId }); // Assume a PlaylistDetails screen
  }, [navigation]);

  const renderPlaylistItem = useCallback(({ item }: { item: Playlist }) => (
    <View style={styles.playlistItem}>
      <TouchableOpacity
        style={styles.playlistContent}
        onPress={() => handleViewPlaylist(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.title} playlist`}
      >
        <Text style={styles.playlistTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.playlistInfo}>{item.items.length} items</Text>
      </TouchableOpacity>
      <View style={styles.playlistActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handlePlayPlaylist(item)}
          accessibilityRole="button"
          accessibilityLabel={`Play ${item.title}`}
        >
          <Play size={18} color="#3498DB" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeletePlaylist(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.title}`}
        >
          <Trash2 size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleViewPlaylist, handlePlayPlaylist, handleDeletePlaylist]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Playlists</Text>
      </View>
      <View style={styles.createPlaylist}>
        <TextInput
          style={styles.input}
          value={newPlaylistName}
          onChangeText={setNewPlaylistName}
          placeholder="New Playlist Name"
          placeholderTextColor="#7F8C8D"
          returnKeyType="done"
          onSubmitEditing={handleCreatePlaylist}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreatePlaylist}
          accessibilityRole="button"
          accessibilityLabel="Create Playlist"
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {playlists.length > 0 ? (
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No playlists yet</Text>
          <Text style={styles.emptySubText}>
            Create a playlist to save your favorite audio for offline listening
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  createPlaylist: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#2C3E50',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3498DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  list: { paddingBottom: 16 },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playlistContent: { flex: 1 },
  playlistTitle: { fontSize: 16, fontWeight: '500', color: '#2C3E50' },
  playlistInfo: { fontSize: 12, color: '#7F8C8D', marginTop: 4 },
  playlistActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { padding: 8 },
  separator: { height: 1, backgroundColor: '#eee' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center' },
  emptySubText: { fontSize: 14, color: '#7F8C8D', textAlign: 'center', marginTop: 8 },
});

export default PlaylistScreen;