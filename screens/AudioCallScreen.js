import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated,
  Easing
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AudioCallScreen = ({ route, navigation }) => {
  const { username, avatar } = route.params;
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ongoing, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  // Animation values
  const pulseAnim = new Animated.Value(1);
  
  // Start pulse animation
  useEffect(() => {
    if (callStatus === 'connecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callStatus]);
  
  // Connect call after delay
  useEffect(() => {
    if (callStatus === 'connecting') {
      const timer = setTimeout(() => {
        setCallStatus('ongoing');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [callStatus]);
  
  // Update call duration
  useEffect(() => {
    let interval;
    if (callStatus === 'ongoing') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);
  
  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle call end
  const endCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Toggle speaker
  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
  };
  
  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      {/* Call Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.minimizeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.callTypeContainer}>
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.callTypeText}>Audio Call</Text>
        </View>
      </View>
      
      {/* Caller Info */}
      <View style={styles.callerInfo}>
        <Animated.View 
          style={[
            styles.avatarContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Image source={{ uri: avatar }} style={styles.callerAvatar} />
        </Animated.View>
        
        <Text style={styles.callerName}>{username}</Text>
        
        <Text style={styles.callStatus}>
          {callStatus === 'connecting' ? 'Connecting...' : 
           callStatus === 'ongoing' ? formatDuration(callDuration) : 'Call ended'}
        </Text>
      </View>
      
      {/* Call Content */}
      <View style={styles.callContent}>
        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <Ionicons name="radio-button-on" size={12} color="#FF3B30" />
              <Text style={styles.recordingText}>Recording</Text>
            </View>
          </View>
        )}
        
        {/* Waveform Visualization */}
        <View style={styles.waveformContainer}>
          {/* This would be replaced with an actual audio visualization in a real app */}
          {callStatus === 'ongoing' && Array.from({ length: 30 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.waveformBar, 
                { 
                  height: 10 + Math.random() * 40,
                  opacity: isMuted ? 0.3 : 0.8
                }
              ]} 
            />
          ))}
        </View>
      </View>
      
      {/* Call Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, isMuted && styles.activeActionButton]} 
            onPress={toggleMute}
          >
            <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#fff" />
            <Text style={styles.actionText}>{isMuted ? "Unmute" : "Mute"}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, isSpeaker && styles.activeActionButton]} 
            onPress={toggleSpeaker}
          >
            <Ionicons name={isSpeaker ? "volume-high" : "volume-medium"} size={24} color="#fff" />
            <Text style={styles.actionText}>{isSpeaker ? "Speaker" : "Earpiece"}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, isRecording && styles.recordingActionButton]} 
            onPress={toggleRecording}
          >
            <Ionicons name="recording" size={24} color="#fff" />
            <Text style={styles.actionText}>{isRecording ? "Stop" : "Record"}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
          <Ionicons name="call" size={32} color="#fff" style={styles.rotatedIcon} />
        </TouchableOpacity>
      </View>
      
      {/* Audio feature highlight */}
      <View style={styles.featureContainer}>
        <View style={styles.featureCard}>
          <Ionicons name="analytics" size={24} color="#6200ee" />
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Voice Enhancement</Text>
            <Text style={styles.featureDescription}>
              AI-powered noise reduction and clarity enhancement active
            </Text>
          </View>
          <TouchableOpacity style={styles.featureToggle}>
            <View style={styles.toggleCircle} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  minimizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  callTypeText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatarContainer: {
    padding: 3,
    borderRadius: 75,
    backgroundColor: 'rgba(98, 0, 238, 0.3)',
    marginBottom: 20,
  },
  callerAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: '#ccc',
  },
  callContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  recordingContainer: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  recordingText: {
    color: '#FF3B30',
    marginLeft: 6,
    fontWeight: '600',
  },
  waveformContainer: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#6200ee',
    borderRadius: 3,
    marginHorizontal: 2,
  },
  actionsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    width: 80,
    opacity: 0.8,
  },
  activeActionButton: {
    opacity: 1,
  },
  recordingActionButton: {
    opacity: 1,
  },
  actionText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotatedIcon: {
    transform: [{ rotate: '135deg' }],
  },
  featureContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  featureDescription: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
  },
  featureToggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    padding: 2,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
});

export default AudioCallScreen;