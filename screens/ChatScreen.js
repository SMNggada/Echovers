import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Modal
} from 'react-native';
import Ionicons from'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const ChatScreen = ({ route, navigation }) => {
  const { conversationId, username, avatar } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAudioPreview, setShowAudioPreview] = useState(false);
  const flatListRef = useRef(null);
  
  // Mock user data - would come from auth context in real app
  const currentUser = {
    id: 'current-user',
    name: 'You',
    avatar: 'https://api.a0.dev/assets/image?text=ME&aspect=1:1&seed=999'
  };

  // Generate mock messages
  useEffect(() => {
    // In a real app, fetch messages from Firestore
    setTimeout(() => {
      const mockMessages = [
        {
          id: '1',
          text: 'Hi there! Loved your recent audiobook upload.',
          sender: username,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          avatar: avatar,
          read: true,
        },
        {
          id: '2',
          text: 'Thanks! I really enjoyed narrating that one.',
          sender: currentUser.name,
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          avatar: currentUser.avatar,
          read: true,
        },
        {
          id: '3',
          text: 'The sound quality was excellent! What microphone do you use?',
          sender: username,
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          avatar: avatar,
          read: true,
        },
        {
          id: '4',
          text: "I'm using a Blue Yeti with some acoustic panels. Makes a huge difference!",
          sender: currentUser.name,
          timestamp: new Date(Date.now() - 2800000).toISOString(),
          avatar: currentUser.avatar,
          read: true,
        },
        {
          id: '5',
          audioUrl: 'audio-message-sample.mp3',
          audioDuration: '0:34',
          sender: username,
          timestamp: new Date(Date.now() - 2000000).toISOString(),
          avatar: avatar,
          read: true,
          isAudio: true,
        },
        {
          id: '6',
          text: "That sounds great! I'll check out that setup.",
          sender: currentUser.name,
          timestamp: new Date(Date.now() - 1000000).toISOString(),
          avatar: currentUser.avatar,
          read: true,
        },
      ];
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);

    // Real implementation would use Firebase:
    // const unsubscribe = firestore()
    //   .collection('conversations')
    //   .doc(conversationId)
    //   .collection('messages')
    //   .orderBy('timestamp', 'asc')
    //   .onSnapshot(snapshot => {
    //     const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //     setMessages(msgs);
    //     setLoading(false);
    //     if (flatListRef.current && msgs.length > 0) {
    //       flatListRef.current.scrollToEnd({ animated: true });
    //     }
    //   });
    // return unsubscribe;
  }, [conversationId]);

  // Send message function
  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: currentUser.name,
      timestamp: new Date().toISOString(),
      avatar: currentUser.avatar,
      read: false,
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Scroll to bottom
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
    
    // In a real app, save to Firestore:
    // firestore()
    //   .collection('conversations')
    //   .doc(conversationId)
    //   .collection('messages')
    //   .add({
    //     text: inputText,
    //     senderId: user.uid,
    //     senderName: user.displayName,
    //     timestamp: firestore.FieldValue.serverTimestamp(),
    //     read: false,
    //   });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Toggle audio recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setRecordingTime(0);
      setShowAudioPreview(true);
    } else {
      // Start recording
      setIsRecording(true);
      // Start timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Clean up interval on stop recording
      return () => clearInterval(interval);
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Send audio message
  const sendAudioMessage = () => {
    const newAudioMessage = {
      id: Date.now().toString(),
      audioDuration: formatRecordingTime(recordingTime),
      sender: currentUser.name,
      timestamp: new Date().toISOString(),
      avatar: currentUser.avatar,
      isAudio: true,
      read: false,
    };
    
    setMessages([...messages, newAudioMessage]);
    setShowAudioPreview(false);
    
    // Scroll to bottom
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  // Render each message
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender === currentUser.name;
    
    return (
      <View style={[
        styles.messageContainer, 
        isCurrentUser ? styles.sentMessage : styles.receivedMessage
      ]}>
        {!isCurrentUser && (
          <Image source={{ uri: item.avatar }} style={styles.messageAvatar} />
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.sentBubble : styles.receivedBubble
        ]}>
          {item.isAudio ? (
            // Audio message
            <View style={styles.audioMessageContainer}>
              <TouchableOpacity style={styles.audioPlayButton}>
                <Ionicons name="play" size={24} color={isCurrentUser ? "#fff" : "#6200ee"} />
              </TouchableOpacity>
              <View style={styles.audioWaveform}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.waveformBar, 
                      { 
                        height: 5 + Math.random() * 15,
                        backgroundColor: isCurrentUser ? "#fff" : "#6200ee" 
                      }
                    ]} 
                  />
                ))}
              </View>
              <Text style={[
                styles.audioDuration,
                { color: isCurrentUser ? "#fff" : "#6200ee" }
              ]}>
                {item.audioDuration}
              </Text>
            </View>
          ) : (
            // Text message
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.sentText : styles.receivedText
            ]}>
              {item.text}
            </Text>
          )}
          
          <Text style={[
            styles.timestampText,
            isCurrentUser ? styles.sentTimestamp : styles.receivedTimestamp
          ]}>
            {formatTime(item.timestamp)}
            {isCurrentUser && (
              <Text> {item.read ? " ✓✓" : " ✓"}</Text>
            )}
          </Text>
        </View>
        
        {isCurrentUser && (
          <Image source={{ uri: item.avatar }} style={styles.messageAvatar} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Image source={{ uri: avatar }} style={styles.headerAvatar} />
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{username}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        
        <TouchableOpacity style={styles.audioCallButton} onPress={() => navigation.navigate('AudioCall', { username, avatar })}>
          <Ionicons name="call" size={22} color="#6200ee" />
        </TouchableOpacity>
      </View>
      
      {/* Messages List */}
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#6200ee" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onLayout={() => {
            if (flatListRef.current && messages.length > 0) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }}
        />
      )}
      
      {/* Recording UI */}
      {isRecording && (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingIndicator}>
            <Ionicons name="mic" size={24} color="#FF3B30" />
            <Text style={styles.recordingTime}>{formatRecordingTime(recordingTime)}</Text>
          </View>
          <Text style={styles.recordingHint}>Release to send, swipe up to cancel</Text>
        </View>
      )}
      
      {/* Audio Preview Modal */}
      <Modal
        visible={showAudioPreview}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAudioPreview(false)}
      >
        <View style={styles.audioPreviewContainer}>
          <View style={styles.audioPreviewContent}>
            <Text style={styles.audioPreviewTitle}>Audio Preview</Text>
            
            <View style={styles.audioPreviewWaveform}>
              {Array.from({ length: 30 }).map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.previewWaveformBar, 
                    { height: 5 + Math.random() * 25 }
                  ]} 
                />
              ))}
            </View>
            
            <View style={styles.audioControls}>
              <TouchableOpacity style={styles.audioControlButton}>
                <Ionicons name="play" size={28} color="#6200ee" />
              </TouchableOpacity>
              <Text style={styles.previewDuration}>{formatRecordingTime(recordingTime)}</Text>
            </View>
            
            <View style={styles.audioPreviewActions}>
              <TouchableOpacity 
                style={[styles.previewActionButton, styles.cancelButton]}
                onPress={() => setShowAudioPreview(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.previewActionButton, styles.sendButton]}
                onPress={sendAudioMessage}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={24} color="#6200ee" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          
          {inputText.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Ionicons name="send" size={24} color="#6200ee" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.micButton}
              onPress={toggleRecording}
              onLongPress={toggleRecording}
            >
              <Ionicons name="mic" size={24} color="#6200ee" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  audioCallButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6200ee',
    marginRight: 5,
  },
  messagesList: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  sentBubble: {
    backgroundColor: '#6200ee',
    borderBottomRightRadius: 5,
  },
  receivedBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#333',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'right',
  },
  sentTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTimestamp: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    padding: 8,
  },
  micButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Audio message styles
  audioMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  audioPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  waveformBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 3,
  },
  audioDuration: {
    fontSize: 12,
    marginLeft: 5,
  },
  // Recording styles
  recordingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginLeft: 10,
  },
  recordingHint: {
    color: '#999',
    marginTop: 8,
    fontSize: 12,
  },
  // Audio preview modal styles
  audioPreviewContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  audioPreviewContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  audioPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  audioPreviewWaveform: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  previewWaveformBar: {
    width: 3,
    backgroundColor: '#6200ee',
    borderRadius: 3,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  audioControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  previewDuration: {
    fontSize: 16,
    color: '#6200ee',
  },
  audioPreviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  sendButton: {
    backgroundColor: '#6200ee',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ChatScreen;