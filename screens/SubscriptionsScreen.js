import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Radio, Play, MoreVertical, Bell, BellOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/formatters';

const { width } = Dimensions.get('window');

const SubscriptionsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { podcasts } = useData();
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be fetched from Firestore
        // For now, we'll simulate with mock data
        const mockSubscriptions = podcasts.slice(0, 12).map(podcast => ({
          id: `subscription-${podcast.id}`,
          podcastId: podcast.id,
          subscribedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          notificationsEnabled: Math.random() > 0.3, // 70% have notifications enabled
          lastEpisodeDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        // Sort by most recently updated
        mockSubscriptions.sort((a, b) => new Date(b.lastEpisodeDate) - new Date(a.lastEpisodeDate));
        
        setSubscriptions(mockSubscriptions);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, []);
  
  // Get podcast details
  const getPodcastDetails = (subscription) => {
    return podcasts.find(podcast => podcast.id === subscription.podcastId);
  };
  
  // Handle subscription press
  const handleSubscriptionPress = (subscription) => {
    const podcast = getPodcastDetails(subscription);
    if (!podcast) return;
    
    navigation.navigate('ContentDetails', {
      id: podcast.id,
      type: 'podcast'
    });
  };
  
  // Toggle notifications
  const toggleNotifications = (subscription) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === subscription.id 
          ? { ...sub, notificationsEnabled: !sub.notificationsEnabled } 
          : sub
      )
    );
  };
  
  // Handle options
  const handleOptions = (subscription) => {
    // Show bottom sheet with options
    console.log('Show options for subscription:', subscription.id);
  };
  
  // Render subscription item
  const renderSubscriptionItem = ({ item }) => {
    const subscription = item;
    const podcast = getPodcastDetails(subscription);
    
    if (!podcast) return null;
    
    return (
      <TouchableOpacity
        style={[
          styles.subscriptionItem,
          { borderBottomColor: theme.border }
        ]}
        onPress={() => handleSubscriptionPress(subscription)}
      >
        <Image
          source={{ uri: podcast.coverImage }}
          style={styles.subscriptionImage}
        />
        
        <View style={styles.subscriptionContent}>
          <Text
            style={[styles.subscriptionTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {podcast.title}
          </Text>
          
          <Text
            style={[styles.subscriptionAuthor, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {podcast.authorName}
          </Text>
          
          <Text style={[styles.subscriptionUpdate, { color: theme.textMuted }]}>
            Updated {formatRelativeTime(subscription.lastEpisodeDate)}
          </Text>
        </View>
        
        <View style={styles.subscriptionActions}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => toggleNotifications(subscription)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {subscription.notificationsEnabled ? (
              <Bell size={20} color={theme.primary} />
            ) : (
              <BellOff size={20} color={theme.textMuted} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => handleOptions(subscription)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={20} color={theme.icon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={theme.icon} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Subscriptions
        </Text>
        
        <View style={styles.headerRight} />
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : subscriptions.length > 0 ? (
        <FlatList
          data={subscriptions}
          renderItem={renderSubscriptionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.subscriptionsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Radio size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No subscriptions yet
          </Text>
          <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
            Subscribe to podcasts to get notified when new episodes are released
          </Text>
          <TouchableOpacity
            style={[styles.discoverButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Discover')}
          >
            <Text style={styles.discoverButtonText}>
              Discover Podcasts
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionsList: {
    paddingBottom: 20,
  },
  subscriptionItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  subscriptionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  subscriptionContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  subscriptionAuthor: {
    fontSize: 14,
    marginBottom: 4,
  },
  subscriptionUpdate: {
    fontSize: 12,
  },
  subscriptionActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
  },
  notificationButton: {
    padding: 4,
    marginBottom: 16,
  },
  optionsButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: width * 0.7,
    marginBottom: 24,
  },
  discoverButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SubscriptionsScreen;