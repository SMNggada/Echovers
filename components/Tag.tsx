import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface TagProps {
  title: string;
  onPress?: () => void;
 style?: ViewStyle | ViewStyle[];
}

const Tag: React.FC<TagProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.tag} onPress={onPress}>
      <Text style={styles.tagText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
});

export default Tag;
