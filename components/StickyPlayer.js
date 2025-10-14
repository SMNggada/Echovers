import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useNavigation } from '@react-navigation/native';

const StickyPlayer = () => {
  const navigation = useNavigation();
  const {
    currentAudio,
    isPlaying,
    progress,
    pauseAudio,
    resumeAudio,
    formatDuration,
  } = useAudioPlayer();

  // Don't render if no audio is playing
  if (!currentAudio) {
    return null;
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const handlePress = () => {
    navigation.navigate('AudioPlayer', { audio: currentAudio });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <Image
        source={{ uri: currentAudio.image || 'https://via.placeholder.com/50' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentAudio.title || 'Unknown Title'}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {currentAudio.author || 'Unknown Author'}
        </Text>
        <Text style={styles.progressText}>
          {formatDuration(progress.position)} / {formatDuration(progress.duration)}
        </Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
        <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 60,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
  },
  playButton: {
    padding: 8,
    backgroundColor: '#1db954',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  playButtonText: {
    fontSize: 20,
    color: '#fff',
  },
});

export default StickyPlayer;