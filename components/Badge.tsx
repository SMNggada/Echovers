import React from 'react';
import { View, Text, StyleSheet,ViewStyle, TouchableOpacity } from 'react-native';
import * as Icons from 'lucide-react-native';
import { LucideIcon } from 'lucide-react-native'; // 👈 Import this

interface BadgeProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

const Badge = ({ name, description, icon, color, earned, onPress }: BadgeProps) => {
  const MaybeIcon = Icons[icon as keyof typeof Icons];
  const IconComponent = (MaybeIcon as LucideIcon) || Icons.Award;

  return (
    <TouchableOpacity 
      style={[styles.container, { opacity: earned ? 1 : 0.5 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <IconComponent color="#FFFFFF" size={24} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      </View>
      {earned && (
        <View style={styles.earnedBadge}>
          <Icons.Check size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  earnedBadge: {
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default Badge;
