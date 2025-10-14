import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Play } from 'lucide-react-native';
import { StyleProp, ViewStyle } from 'react-native';

interface PlaylistItem {
  id: string;
  title: string;
  description: string;
  image?: string; // make optional
  // Allow fallback for different data shapes
  coverImage?: string;
}

interface PlaylistCardProps {
  item: PlaylistItem;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ item, onPress, style }) => {
  const imageUri = item.image || item.coverImage || 'https://api.a0.dev/assets/image?text=Playlist&aspect=1:1';
  return (
    <TouchableOpacity style={[styles.playlistCard, style]} onPress={onPress}>
      <ImageBackground 
        source={{ uri: imageUri }} 
        style={styles.playlistImage} 
        imageStyle={{ borderRadius: 8 }}
      >
        <View style={styles.playlistOverlay}>
          <View style={styles.playlistInfo}>
            <Text style={styles.playlistTitle}>{item.title}</Text>
            {!!item.description && (
              <Text style={styles.playlistDescription} numberOfLines={2}>{item.description}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.playlistPlayButton}>
            <Play size={20} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playlistCard: {
    width: '100%',
    height: 120,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  playlistImage: {
    width: '100%',
    height: '100%',
  },
  playlistOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  playlistInfo: {
    padding: 16,
    flex: 1,
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  playlistDescription: {
    fontSize: 14,
    color: '#f0f0f0',
    marginTop: 4,
  },
  playlistPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
});

export default PlaylistCard;