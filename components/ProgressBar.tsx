import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

const ProgressBar = ({
  progress,
  height = 8,
  backgroundColor = '#E0E0E0',
  progressColor = '#4CAF50',
  borderRadius = 4,
}: ProgressBarProps) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[
      styles.container,
      { height, backgroundColor, borderRadius }
    ]}>
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: progressColor,
            borderRadius,
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});

export default ProgressBar;