import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  ScrollView,
  TextInput
} from 'react-native';
import Ionicons from'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const AudioRoomScreen = ({ route, navigation }) => {
  const { roomName } = route.params;
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [participants, setParticipants] = useState([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  
  // Animation values
  const speakingAnimation = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);

  // Icons for different room types
  const roomIcons = {
    'Music Production': 'musical-notes',
    'Book Club': 'book',
    'Meditation': 'leaf',
    'Language Learning': 'language',
  };

  // Generate mock participants and messages
  useEffect(() => {
    // Generate participants
    const mockParticipants = [
      {
        id: 'host-1',
        name: 'RoomHost',
        avatar: `https://api.a0.dev/assets/image?text=RH&aspect=1:1&seed=111`,
        isSpeaker: true,
        isHost: true,
        isMuted: false,
      },
      {
        id: 'speaker-1',
        name: 'AudioExpert',
        avatar: `https://api.a0.dev/assets/image?text=AE&aspect=1:1&seed=222`,
        isSpeaker: true,
        isHost: false,
        isMuted: false,
      },
      {
        id: 'speaker-2',
        name: 'ContentCreator',
        avatar: `https://api.a0.dev/assets/image?text=CC&aspect=1:1&seed=333`,
        isSpeaker: true,
        isHost: false,
        isMuted: true,
      },
      // Current user
      {
        id: 'current-user',
        name: 'You',
        avatar: `https://api.a0.dev/assets/image?text=ME&aspect=1:1&seed=444`,
        isSpeaker: false,
        isHost: false,
        isMuted: true,
      },
    ];
    
    // Add listeners
    for (let i = 1; i <= 12; i++) {
      mockParticipants.push({
        id: `listener-${i}`,
        name: `User${i}`,
        avatar: `https://api.a0.dev/assets/image?text=${i}&aspect=1:1&seed=${i*100}`,
        isSpeaker: false,
        isHost: false,
        isMuted: true,
      });
    }
    
    setParticipants(mockParticipants);
    
    // Generate chat messages
    const mockMessages = [
      {
        id: '1',
        sender: 'RoomHost',
        message: `Welcome to the ${roomName} room! Let's have a great discussion.`,
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        avatar: `https://api.a0.dev/assets/image?text=RH&aspect=1:1&seed=111`,
      },
      {
        id: '2',
        sender: 'AudioExpert',
        message: 'Excited to share some insights on this topic today.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        avatar: `https://api.a0.dev/assets/image?text=AE&aspect=1:1&seed=222`,
      },
      {
        id: '3',
        sender: 'User5',
        message: 'This is my first time joining. Looking forward to learning!',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        avatar: `https://api.a0.dev/assets/image?text=5&aspect=1:1&seed=500`,
      },
      {
        id: '4',
        sender: 'ContentCreator',
        message: 'Has anyone tried the new audio recording feature in the app?',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        avatar: `https://api.a0.dev/assets/image?text=CC&aspect=1:1&seed=333`,
      },
    ];
    
    setChatMessages(mockMessages);
    
    // Simulate active speaker
    const speakerInterval = setInterval(() => {
      // Randomly choose a speaker
      const speakers = mockParticipants.filter(p => p.isSpeaker && !p.isMuted);
      if (speakers.length > 0) {
        const randomSpeaker = speakers[Math.floor(Math.random() * speakers.length)];
        setActiveSpeakerId(prevId => {
          if (prevId !== randomSpeaker.id) {
            // Reset and start new animation
            speakingAnimation.setValue(1);
            Animated.loop(
              Animated.sequence([
                Animated.timing(speakingAnimation, {
                  toValue: 1.2,
                  duration: 500,
                  useNativeDriver: true,
                }),
                Animated.timing(speakingAnimation, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
                }),
              ])
            ).start();
          }
          return randomSpeaker.id;
        });
      } else {
        setActiveSpeakerId(null);
      }
    }, 5000);
    
    return () => {
      clearInterval(speakerInterval);
    };
  }, [roomName]);

  // Function to toggle mute status
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Update current user in participants list
    setParticipants(prev => 
      prev.map(p => 
        p.id === 'current-user' ? {...p, isMuted: !isMuted} : p
      )
    );
  };
  
  // Function to raise/lower hand
  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    
    // In a real app, notify the host about hand raise
  };

  // Send a chat message
  const sendMessage = () => {
    if (messageInput.trim() === '') return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: messageInput,
      timestamp: new Date().toISOString(),
      avatar: `https://api.a0.dev/assets/image?text=ME&aspect=1:1&seed=444`,
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setMessageInput('');
    
    // Scroll to bottom of chat
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  // Format timestamp for chat
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render participants
  const renderParticipantItem = ({ item }) => {
    const isActiveSpeaker = item.id === activeSpeakerId;
    
    return (
      <View style={styles.participantItem}>
        <Animated.View 
          style={[
            styles.avatarContainer,
            isActiveSpeaker && { 
              transform: [{ scale: speakingAnimation }],
              borderColor: '#6200ee',
              borderWidth: 2,
            }
          ]}
        >
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.isMuted && (
            <View style={styles.mutedIndicator}>
              <Ionicons name="mic-off" size={12} color="#fff" />
            </View>
          )}
          {item.isHost && (
            <View style={styles.hostBadge}>
              <Ionicons name="star" size={12} color="#fff" />
            </View>
          )}
        </Animated.View>
        <Text style={styles.participantName} numberOfLines={1}>
          {item.name === 'You' ? 'You' : item.name}
        </Text>
        {item.isSpeaker && (
          <View style={styles.speakerBadge}>
            <Text style={styles.speakerText}>Speaker</Text>
          </View>
        )}
      </View>
    );
  };

  // Render chat messages
  const renderChatMessage = ({ item }) => (
    <View style={styles.chatMessageContainer}>
      <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatSender}>{item.sender}</Text>
          <Text style={styles.chatTime}>{formatMessageTime(item.timestamp)}</Text>
        </View>
        <Text style={styles.chatMessage}>{item.message}</Text>
      </View>
    </View>
  );

  // Unique feature: Collaborative playlist
  const renderPlaylist = () => (
    <View style={styles.playlistContainer}>
      <View style={styles.playlistHeader}>
        <Text style={styles.playlistTitle}>Room Playlist</Text>
        <TouchableOpacity style={styles.addToPlaylistButton}>
          <Ionicons name="add" size={18} color="#6200ee" />
          <Text style={styles.addToPlaylistText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.currentlyPlaying}>
        <Image 
          source={{ uri: 'https://api.a0.dev/assets/image?text=Audio&aspect=1:1&seed=789' }} 
          style={styles.trackImage} 
        />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>Ambient Study Music</Text>
          <Text style={styles.trackCreator}>AudioCreator</Text>
        </View>
        <TouchableOpacity style={styles.trackControlButton}>
          <Ionicons name="pause" size={24} color="#6200ee" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.upNextText}>Up Next:</Text>
      
      <View style={styles.queuedTrack}>
        <Image 
          source={{ uri: 'https://api.a0.dev/assets/image?text=Next&aspect=1:1&seed=101' }} 
          style={styles.queuedTrackImage} 
        />
        <View style={styles.queuedTrackInfo}>
          <Text style={styles.queuedTrackTitle}>Classical Piano</Text>
          <Text style={styles.queuedTrackCreator}>MusicProducer</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.roomInfo}>
          <View style={styles.roomIconContainer}>
            <Ionicons 
              name={roomIcons[roomName] || 'mic'} 
              size={20} 
              color="#fff" 
            />
          </View>
          <Text style={styles.roomName}>{roomName}</Text>
          <Text style={styles.listenerCount}>
            {participants.length} Participants
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={() => {/* Share functionality */}}
        >
          <Ionicons name="share-outline" size={24} color="#6200ee" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Speakers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Speakers</Text>
          <FlatList
            data={participants.filter(p => p.isSpeaker)}
            renderItem={renderParticipantItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.speakersContainer}
          />
        </View>
        
        {/* Room features - collaborative playlist */}
        {renderPlaylist()}
      
        {/* Listeners Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listeners</Text>
          <FlatList
            data={participants.filter(p => !p.isSpeaker)}
            renderItem={renderParticipantItem}
            keyExtractor={item => item.id}
            numColumns={4}
            contentContainerStyle={styles.listenersContainer}
          />
        </View>
        
        {/* Chat Section */}
        <View style={styles.chatSection}>
          <Text style={styles.sectionTitle}>Chat</Text>
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={renderChatMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chatList}
          />
        </View>
        
        {/* Extra padding at bottom */}
        <View style={{ height: 80 }} />
      </ScrollView>
      
      {/* Bottom Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type a message..."
            value={messageInput}
            onChangeText={setMessageInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.audioControls}>
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              isMuted ? styles.controlButtonInactive : styles.controlButtonActive
            ]}
            onPress={toggleMute}
          >
            <Ionicons name={isMuted ? "mic-off" : "mic"} size={22} color={isMuted ? "#666" : "#fff"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton,
              isHandRaised ? styles.handRaisedButton : styles.controlButtonInactive
            ]}
            onPress={toggleHandRaise}
          >
            <Ionicons name="hand-right" size={22} color={isHandRaised ? "#fff" : "#666"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              styles.leaveButton
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="exit-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  roomInfo: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 10,
  },
  roomIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listenerCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  shareButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  speakersContainer: {
    paddingRight: 16,
  },
  listenersContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  participantItem: {
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 16,
    width: 70,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  mutedIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  hostBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFB300',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  participantName: {
    fontSize: 12,
    textAlign: 'center',
    width: 70,
  },
  speakerBadge: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  speakerText: {
    fontSize: 10,
    color: '#6200ee',
  },
  controlsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  controlButtonActive: {
    backgroundColor: '#6200ee',
  },
  controlButtonInactive: {
    backgroundColor: '#f0f0f0',
  },
  handRaisedButton: {
    backgroundColor: '#FFB300',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
  },
  chatSection: {
    padding: 16,
  },
  chatList: {
    paddingBottom: 16,
  },
  chatMessageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  chatContent: {
    marginLeft: 8,
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatSender: {
    fontWeight: '600',
    fontSize: 14,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatMessage: {
    fontSize: 14,
  },
  // Playlist styles
  playlistContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f9f5ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  addToPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addToPlaylistText: {
    color: '#6200ee',
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 12,
  },
  currentlyPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  trackCreator: {
    fontSize: 12,
    color: '#666',
  },
  trackControlButton: {
    padding: 8,
  },
  upNextText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  queuedTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 8,
    borderRadius: 8,
  },
  queuedTrackImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  queuedTrackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  queuedTrackTitle: {
    fontWeight: '500',
    fontSize: 13,
  },
  queuedTrackCreator: {
    fontSize: 11,
    color: '#666',
  },
});

export default AudioRoomScreen;