import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Platform,
  useWindowDimensions
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  List,
  Heart,
  Share2,
  Download,
  ChevronDown,
  Clock,
  Volume2,
  Repeat,
  Shuffle
} from 'lucide-react-native';
import { usePlayer } from '../context/PlayerContext';

const AudioPlayerScreen = ({ visible, onClose }) => {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    isLoading,
    playbackSpeed,
    volume,
    pause,
    resume,
    seekTo,
    setPlaybackSpeed,
    setVolume,
    skipForward,
    skipBackward
  } = usePlayer();

  // Use window dimensions for responsive layout
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 768;

  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  // Calculate responsive dimensions
  const coverSize = isTablet 
    ? Math.min(width, height) * 0.4 
    : isLandscape 
      ? height * 0.5 
      : width - 80;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ChevronDown size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <TouchableOpacity style={styles.menuButton}>
            <List size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Responsive layout based on orientation and device size */}
        {isLandscape ? (
          <View style={styles.landscapeContainer}>
            <View style={styles.landscapeLeftContainer}>
              <View style={styles.coverContainer}>
                <Image
                  source={{ uri: currentTrack.coverImage || 'https://api.a0.dev/assets/image?text=Echovers&aspect=1:1' }}
                  style={[styles.coverImage, { width: coverSize, height: coverSize }]}
                />
              </View>
            </View>
            <View style={styles.landscapeRightContainer}>
              <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={2}>{currentTrack.title}</Text>
                <Text style={styles.author} numberOfLines={1}>
                  {currentTrack.authorName || currentTrack.author || 'Unknown'}
                </Text>
              </View>

              <View style={styles.progressContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={currentTime}
                  minimumTrackTintColor="#1DB954"
                  maximumTrackTintColor="#ddd"
                  thumbTintColor="#1DB954"
                  onSlidingComplete={seekTo}
                />
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>

              <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.secondaryControlButton}><Shuffle size={24} color="#666" /></TouchableOpacity>
                <TouchableOpacity onPress={() => skipBackward(30)} style={styles.controlButton}><SkipBack size={32} color="#333" /></TouchableOpacity>
                <TouchableOpacity
                  onPress={() => isPlaying ? pause() : resume()}
                  disabled={isLoading}
                  style={styles.playPauseButton}
                >
                  {isLoading
                    ? <ActivityIndicator size="large" color="#fff" />
                    : isPlaying
                      ? <Pause size={32} color="#fff" />
                      : <Play size={32} color="#fff" />
                  }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => skipForward(30)} style={styles.controlButton}><SkipForward size={32} color="#333" /></TouchableOpacity>
                <TouchableOpacity style={styles.secondaryControlButton}><Repeat size={24} color="#666" /></TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // Portrait layout
          <>
            <View style={styles.coverContainer}>
              <Image
                source={{ uri: currentTrack.coverImage || 'https://api.a0.dev/assets/image?text=Echovers&aspect=1:1' }}
                style={[styles.coverImage, { width: coverSize, height: coverSize }]}
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={2}>{currentTrack.title}</Text>
              <Text style={styles.author} numberOfLines={1}>
                {currentTrack.authorName || currentTrack.author || 'Unknown'}
              </Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}><Heart size={24} color="#666" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}><Download size={24} color="#666" /></TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}><Share2 size={24} color="#666" /></TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={currentTime}
                minimumTrackTintColor="#1DB954"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#1DB954"
                onSlidingComplete={seekTo}
              />
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.secondaryControlButton}><Shuffle size={24} color="#666" /></TouchableOpacity>
              <TouchableOpacity onPress={() => skipBackward(30)} style={styles.controlButton}><SkipBack size={32} color="#333" /></TouchableOpacity>
              <TouchableOpacity
                onPress={() => isPlaying ? pause() : resume()}
                disabled={isLoading}
                style={styles.playPauseButton}
              >
                {isLoading
                  ? <ActivityIndicator size="large" color="#fff" />
                  : isPlaying
                    ? <Pause size={32} color="#fff" />
                    : <Play size={32} color="#fff" />
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={() => skipForward(30)} style={styles.controlButton}><SkipForward size={32} color="#333" /></TouchableOpacity>
              <TouchableOpacity style={styles.secondaryControlButton}><Repeat size={24} color="#666" /></TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={() => setShowSpeedOptions(!showSpeedOptions)} style={styles.bottomButton}>
            <Clock size={20} color="#666" />
            <Text style={styles.bottomButtonText}>{playbackSpeed}x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowVolumeSlider(!showVolumeSlider)} style={styles.bottomButton}>
            <Volume2 size={20} color="#666" />
            <Text style={styles.bottomButtonText}>Volume</Text>
          </TouchableOpacity>
        </View>

        {showSpeedOptions && (
          <View style={styles.speedOptionsContainer}>
            <Text style={styles.speedTitle}>Playback Speed</Text>
            <View style={styles.speedOptions}>
              {speedOptions.map(speed => (
                <TouchableOpacity
                  key={`speed-${speed}`}
                  style={[styles.speedOption, playbackSpeed === speed && styles.activeSpeedOption]}
                  onPress={() => { setPlaybackSpeed(speed); setShowSpeedOptions(false); }}
                >
                  <Text style={[styles.speedOptionText, playbackSpeed === speed && styles.activeSpeedOptionText]}>{speed}x</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {showVolumeSlider && (
          <View style={styles.volumeContainer}>
            <Text style={styles.volumeTitle}>Volume</Text>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              minimumTrackTintColor="#1DB954"
              maximumTrackTintColor="#ddd"
              thumbTintColor="#1DB954"
              onSlidingComplete={setVolume}
            />
          </View>
        )}

        <TouchableOpacity style={styles.descriptionButton} onPress={() => setShowDescription(!showDescription)}>
          <Text style={styles.descriptionButtonText}>{showDescription ? 'Hide Description' : 'Show Description'}</Text>
        </TouchableOpacity>

        {showDescription && (
          <ScrollView style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              {currentTrack.description || 'No description available.'}
            </Text>
          </ScrollView>
        )}

      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16 
  },
  closeButton: { 
    padding: 8 
  },
  menuButton: { 
    padding: 8 
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333' 
  },
  // Landscape layout containers
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeLeftContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  landscapeRightContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  coverContainer: { 
    alignItems: 'center', 
    marginVertical: 24 
  },
  coverImage: { 
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  infoContainer: { 
    paddingHorizontal: 24, 
    alignItems: 'center', 
    marginBottom: 24 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  author: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center' 
  },
  actionsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 24 
  },
  actionButton: { 
    padding: 12, 
    marginHorizontal: 16 
  },
  progressContainer: { 
    paddingHorizontal: 24, 
    marginBottom: 24 
  },
  slider: { 
    width: '100%', 
    height: 40 
  },
  timeContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: -8 
  },
  timeText: { 
    fontSize: 12, 
    color: '#666' 
  },
  controlsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  secondaryControlButton: { 
    padding: 12 
  },
  controlButton: { 
    padding: 12, 
    marginHorizontal: 8 
  },
  playPauseButton: { 
    backgroundColor: '#1DB954', 
    borderRadius: 40, 
    width: 80, 
    height: 80, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginHorizontal: 16 
  },
  bottomContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingHorizontal: 24, 
    marginBottom: 24 
  },
  bottomButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12 
  },
  bottomButtonText: { 
    marginLeft: 8, 
    fontSize: 14, 
    color: '#666' 
  },
  speedOptionsContainer: { 
    backgroundColor: '#f9f9f9', 
    padding: 16, 
    borderRadius: 8, 
    marginHorizontal: 24, 
    marginBottom: 16 
  },
  speedTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 12 
  },
  speedOptions: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  speedOption: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    marginBottom: 8, 
    marginRight: 8 
  },
  activeSpeedOption: { 
    backgroundColor: '#1DB954', 
    borderColor: '#1DB954' 
  },
  speedOptionText: { 
    fontSize: 14, 
    color: '#333' 
  },
  activeSpeedOptionText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  volumeContainer: { 
    backgroundColor: '#f9f9f9', 
    padding: 16, 
    borderRadius: 8, 
    marginHorizontal: 24, 
    marginBottom: 16 
  },
  volumeTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 12 
  },
  volumeSlider: { 
    width: '100%', 
    height: 40 
  },
  descriptionButton: { 
    alignItems: 'center', 
    paddingVertical: 12 
  },
  descriptionButtonText: { 
    fontSize: 14, 
    color: '#1DB954', 
    fontWeight: '600' 
  },
  descriptionContainer: { 
    paddingHorizontal: 24, 
    paddingVertical: 16, 
    maxHeight: 200 
  },
  descriptionText: { 
    fontSize: 14, 
    color: '#666', 
    lineHeight: 20 
  }
});

export default AudioPlayerScreen;