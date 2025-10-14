import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Play, Trash2, Plus } from 'lucide-react-native';
import type { RootStackParamList } from '../Navigation';
import { useData } from '../context/DataContext';
import { usePlayer } from '../context/PlayerContext';

type PlaylistDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PlaylistDetails'>;
type PlaylistDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PlaylistDetailsScreen: React.FC = () => {
  const navigation = useNavigation<PlaylistDetailsScreenNavigationProp>();
  const route = useRoute<PlaylistDetailsScreenRouteProp>();
  const { playlistId } = route.params;
  const { playlists, addToPlaylist, removeFromPlaylist } = useData();
  const { play } = usePlayer();

  const playlist = playlists.find((p) => p.id === playlistId);

  const handlePlayItem = useCallback((item: any) => {
    if (play) play(item);
  }, [play]);

  const handleRemoveItem = useCallback((itemId: string) => {
    if (playlist) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', onPress: () => removeFromPlaylist(playlistId, itemId) },
        ]
      );
    }
  }, [playlist, removeFromPlaylist, playlistId]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.item}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => handlePlayItem(item)}
        accessibilityRole="button"
        accessibilityLabel={`Play ${item.title}`}
      >
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.title}`}
      >
        <Trash2 size={18} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  ), [handlePlayItem, handleRemoveItem]);

  const handleAddItem = useCallback(() => {
    // Navigate to a screen to select content (e.g., DiscoverScreen) and pass callback
    navigation.navigate('Discover', { onSelect: (item: any) => addToPlaylist(playlistId, item) });
  }, [navigation, playlistId, addToPlaylist]);

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Playlist not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{playlist.title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddItem}
          accessibilityRole="button"
          accessibilityLabel="Add Item"
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {playlist.items.length > 0 ? (
        <FlatList
          data={playlist.items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in this playlist</Text>
          <Text style={styles.emptySubText}>Add items to start listening</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  addButton: { width: 40, height: 40, backgroundColor: '#3498DB', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  list: { paddingBottom: 16 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '500', color: '#2C3E50' },
  removeButton: { padding: 8 },
  separator: { height: 1, backgroundColor: '#eee' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center' },
  emptySubText: { fontSize: 14, color: '#7F8C8D', textAlign: 'center', marginTop: 8 },
  errorText: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', padding: 20 },
});

export default PlaylistDetailsScreen;