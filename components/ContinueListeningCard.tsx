import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Play } from 'lucide-react-native';
import { StyleProp, ViewStyle } from 'react-native';

interface AudioItem {
  id: string;
  title: string;
  author: string;
  progress: number;
  image: string;
}

interface ContinueListeningCardProps {
  item: AudioItem;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const ContinueListeningCard: React.FC<ContinueListeningCardProps> = ({ item, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.continueListeningCard, style]} onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.continueListeningImage} />
      <View style={styles.playButtonOverlay}>
        <TouchableOpacity style={styles.playButton}>
          <Play size={20} color="#fff" fill="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.continueListeningInfo}>
        <Text style={styles.continueListeningTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.continueListeningAuthor} numberOfLines={1}>{item.author}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  continueListeningCard: {
    width: width * 0.7,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueListeningImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 120 - 20,
    right: 12,
    zIndex: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954', // Spotify green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  continueListeningInfo: {
    padding: 12,
  },
  continueListeningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  continueListeningAuthor: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1DB954', // Spotify green
  },
});

export default ContinueListeningCard;