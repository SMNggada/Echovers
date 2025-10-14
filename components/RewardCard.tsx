import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as Icons from 'lucide-react-native';

interface RewardCardProps {
  name: string;
  description: string;
  points: number;
  claimed: boolean;
  image: string;
  onPress?: () => void;
}

const RewardCard = ({ name, description, points, claimed, image, onPress }: RewardCardProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { opacity: claimed ? 0.7 : 1 }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={claimed}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
          <View style={styles.pointsContainer}>
            <Icons.Star size={14} color="#FFD700" />
            <Text style={styles.points}>{points} points</Text>
          </View>
        </View>
        {claimed ? (
          <View style={styles.claimedBadge}>
            <Text style={styles.claimedText}>Claimed</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.claimButton} onPress={onPress}>
            <Text style={styles.claimText}>Claim</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    height: 220,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  claimText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  claimedBadge: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  claimedText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default RewardCard;
