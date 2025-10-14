import React from 'react';
import { Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AudiobookCard = ({ audiobook, style }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, style]}
      onPress={() =>
        navigation.navigate('ContentDetails', {
          id: audiobook.id,
          type: 'audiobook',
        })
      }
    >
      <Image source={{ uri: audiobook.coverImage }} style={styles.image} />
      <Text style={styles.title} numberOfLines={1}>
        {audiobook.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {audiobook.authorName}
      </Text>
    </TouchableOpacity>
  );
};

const CARD_WIDTH = (width - 40) / 2;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  author: {
    fontSize: 12,
    color: '#666',
  },
});

export default AudiobookCard;