import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as Icons from 'lucide-react-native';

interface CreatorCardProps {
  name: string;
  avatar: string;
  followers: number;
  category: string;
  isFollowing?: boolean;
  onPress?: () => void;
  onFollow?: () => void;
}

const CreatorCard = ({
  name,
  avatar,
  followers,
  category,
  isFollowing = false,
  onPress,
  onFollow,
}: CreatorCardProps) => {
  const formattedFollowers = followers >= 1000000
    ? `${(followers / 1000000).toFixed(1)}M`
    : followers >= 1000
      ? `${(followers / 1000).toFixed(1)}K`
      : followers.toString();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.category}>{category}</Text>
        <View style={styles.followersContainer}>
          <Icons.Users size={12} color="#666" />
          <Text style={styles.followers}>{formattedFollowers} followers</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.followButton,
          isFollowing ? styles.followingButton : {}
        ]}
        onPress={onFollow}
      >
        <Text style={[
          styles.followButtonText,
          isFollowing ? styles.followingButtonText : {}
        ]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  followersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followers: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  followButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  followingButton: {
    backgroundColor: '#E0E0E0',
  },
  followingButtonText: {
    color: '#666',
  },
});

export default CreatorCard;