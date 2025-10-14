import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';

/**
 * @param {{ level: number, currentPoints: number, nextLevelPoints: number }} props
 */
const LevelProgress = ({ level, currentPoints, nextLevelPoints }) => {
  const progress = currentPoints / nextLevelPoints;
  const pointsToNextLevel = nextLevelPoints - currentPoints;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <Text style={styles.title}>Level {level}</Text>
        <Text style={styles.points}>{currentPoints} / {nextLevelPoints} points</Text>
      </View>
      <ProgressBar 
        progress={progress} 
        height={10} 
        progressColor="#8E44AD" 
        backgroundColor="#E0E0E0" 
        borderRadius={5}
      />
      <Text style={styles.nextLevel}>
        {pointsToNextLevel} points to Level {level + 1}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8E44AD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  points: {
    fontSize: 14,
    color: '#666',
  },
  nextLevel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'right',
  },
});

export default LevelProgress;