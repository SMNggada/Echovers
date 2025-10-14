import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

// Mock data for conversations - would be replaced with Firestore data
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    username: 'AudioLover92',
    avatar: 'https://api.a0.dev/assets/image?text=AL&aspect=1:1&seed=123',
    lastMessage: 'That podcast you recommended was amazing!',
    timestamp: '10:30 AM',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    username: 'PodcastCreator',
    avatar: 'https://api.a0.dev/assets/image?text=PC&aspect=1:1&seed=456',
    lastMessage: 'Would you like to collaborate on a new audio series?',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    username: 'BookNarrator',
    avatar: 'https://api.a0.dev/assets/image?text=BN&aspect=1:1&seed=789',
    lastMessage: 'I loved your narration sample! Can we discuss further?',
    timestamp: '2d ago',
    unread: 1,
    online: true,
  },
  {
    id: '4',
    username: 'SoundEngineer',
    avatar: 'https://api.a0.dev/assets/image?text=SE&aspect=1:1&seed=101',
    lastMessage: 'Here are some tips to improve your audio quality next time',
    timestamp: '1w ago',
    unread: 0,
    online: false,
  },
];

const MessagesScreen = () => {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const { user } = useAuth();

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(convo => 
    convo.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // In a real app, this would fetch conversations from Firestore
  useEffect(() => {
    // Mock loading conversations
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
    
    // Real implementation would use Firebase:
    // const unsubscribe = firestore()
    //   .collection('conversations')
    //   .where('participants', 'array-contains', user?.uid)
    //   .orderBy('lastMessageTimestamp', 'desc')
    //   .onSnapshot(snapshot => {
    //     const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //     setConversations(convos);
    //     setLoading(false);
    //   });
    // return unsubscribe;
  }, []);
  
  // Navigate to individual chat screen
  const handleOpenChat = (conversationId, username, avatar) => {
    navigation.navigate('Chat', { 
      conversationId,
      username,
      avatar
    });
  };

  // Render each conversation item
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => handleOpenChat(item.id, item.username, item.avatar)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineBadge} />}
      </View>
      
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
        <View style={styles.messagePreview}>
          <Text 
            style={[styles.previewText, item.unread > 0 && styles.unreadText]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Feature: Audio message preview button
  const NewMessageButton = () => (
    <TouchableOpacity 
      style={styles.newMessageButton}
      onPress={() => navigation.navigate('NewMessage')}
    >
      <Ionicons name="add" size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Unique Feature: Audio Chat Rooms */}
      <View style={styles.audioRoomsContainer}>
        <Text style={styles.sectionTitle}>Audio Chat Rooms</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.audioRoomsScroll}>
          {['Music Production', 'Book Club', 'Meditation', 'Language Learning'].map((room, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.audioRoomBadge}
              onPress={() => navigation.navigate('AudioRoom', { roomName: room })}
            >
              <Ionicons 
                name={['musical-notes', 'book', 'leaf', 'language'][index]} 
                size={18} 
                color="#fff" 
              />
              <Text style={styles.audioRoomText}>{room}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#6200ee" />
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <TouchableOpacity 
                style={styles.startChatButton}
                onPress={() => navigation.navigate('NewMessage')}
              >
                <Text style={styles.startChatText}>Start a conversation</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      <NewMessageButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
  },
  onlineBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    marginBottom: 16,
  },
  startChatButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startChatText: {
    color: '#fff',
    fontWeight: '600',
  },
  newMessageButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Audio Chat Rooms styling
  audioRoomsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  audioRoomsScroll: {
    paddingHorizontal: 16,
  },
  audioRoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  audioRoomText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default MessagesScreen;