import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StyleProp, ViewStyle } from 'react-native';

interface TagProps {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const Tag: React.FC<TagProps> = ({ label, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.tag, style]} onPress={onPress}>
      <Text style={styles.tagText}>{label}</Text>
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