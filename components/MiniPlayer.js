import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';

const { width } = Dimensions.get('window');

const MiniPlayer = ({ onPress }) => {
  const { 
    isPlaying, 
    currentTrack, 
    currentTime, 
    duration, 
    pause, 
    resume, 
    skipForward 
  } = usePlayer();

  if (!currentTrack) return null;

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image 
        source={{ uri: currentTrack.coverImage || 'https://api.a0.dev/assets/image?text=Echovers&aspect=1:1' }} 
        style={styles.coverImage} 
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {currentTrack.authorName || currentTrack.author || 'Unknown'}
        </Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => isPlaying ? pause() : resume()}
        >
          {isPlaying ? (
            <Pause size={24} color="#333" />
          ) : (
            <Play size={24} color="#333" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => skipForward(30)}
        >
          <SkipForward size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progress}%` }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
  width: width,
  height: 50, // fixed height instead of '100%'
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: '#eee',
  position: 'absolute',
  bottom: 60,
  
},

  coverImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  author: {
    fontSize: 12,
    color: '#666'
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  controlButton: {
    padding: 8,
    marginLeft: 4
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#eee'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1DB954'
  }
});

export default MiniPlayer;