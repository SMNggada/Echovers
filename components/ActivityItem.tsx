import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Icons from 'lucide-react-native';

interface ActivityItemProps {
  type: 'badge_earned' | 'episode_completed' | 'reward_claimed' | 'streak_milestone';
  name: string;
  date: string;
  points: number;
}

const ActivityItem = ({ type, name, date, points }: ActivityItemProps) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'badge_earned':
        return { icon: 'Award', color: '#FFD700' };
      case 'episode_completed':
        return { icon: 'CheckCircle', color: '#4CAF50' };
      case 'reward_claimed':
        return { icon: 'Gift', color: '#9C27B0' };
      case 'streak_milestone':
        return { icon: 'Flame', color: '#FF5722' };
      default:
        return { icon: 'Activity', color: '#2196F3' };
    }
  };

  const { icon, color } = getIconAndColor();
  const IconComponent = ((Icons as unknown) as Record<string, React.ComponentType<any>>)[icon] ?? Icons.Activity;
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <IconComponent color="#FFFFFF" size={16} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <View style={styles.pointsContainer}>
        <Text style={[
          styles.points, 
          { color: points >= 0 ? '#4CAF50' : '#F44336' }
        ]}>
          {points >= 0 ? `+${points}` : points}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  pointsContainer: {
    marginLeft: 8,
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ActivityItem;
