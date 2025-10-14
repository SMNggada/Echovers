import React from 'react';
import { View, ScrollView, Image, Text, StyleSheet } from 'react-native';

interface ImageItem {
  uri: string;
  title?: string;
  subtitle?: string;
}

interface ImageCarouselProps {
  images: ImageItem[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
      {images.map((item, index) => (
        <View key={index} style={styles.item}>
          <Image source={{ uri: item.uri }} style={styles.image} />
          {item.title && <Text style={styles.title}>{item.title}</Text>}
          {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  carousel: {
    flexDirection: 'row',
  },
  item: {
    marginRight: 12,
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
});

export default ImageCarousel;
