import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const EditProfileScreen = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const navigation = useNavigation();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(''); // In a real app, this would be fetched from user profile
  const [location, setLocation] = useState(''); // In a real app, this would be fetched from user profile
  const [website, setWebsite] = useState(''); // In a real app, this would be fetched from user profile
  
  const [avatar, setAvatar] = useState(user?.photoURL || '');
  const [newAvatarLoading, setNewAvatarLoading] = useState(false);
  
  // Input focus states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isBioFocused, setIsBioFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isWebsiteFocused, setIsWebsiteFocused] = useState(false);

  // Generate new profile picture
  const generateNewAvatar = async () => {
    try {
      setNewAvatarLoading(true);
      
      // Initials from name for avatar text
      const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
      
      // Random seed for unique avatar
      const seed = Math.floor(Math.random() * 10000);
      
      const newAvatarUrl = `https://api.a0.dev/assets/image?text=${initials || 'U'}&aspect=1:1&seed=${seed}`;
      setAvatar(newAvatarUrl);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      Alert.alert('Error', 'Could not generate new avatar');
    } finally {
      setNewAvatarLoading(false);
    }
  };

  // Save profile updates
  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }
    
    try {
      await updateProfile({
        displayName,
        photoURL: avatar,
        // In a real app, we would also save bio, location, website in a user's Firestore document
      });
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={isLoading}
            style={styles.saveButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.avatarContainer}>
            {newAvatarLoading ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="large" color="#4361ee" />
              </View>
            ) : (
              <Image
                source={{ uri: avatar }}
                style={styles.avatar}
              />
            )}
            <TouchableOpacity 
              style={styles.changeAvatarButton}
              onPress={generateNewAvatar}
              disabled={newAvatarLoading}
            >
              <Text style={styles.changeAvatarText}>Change Profile Picture</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={[
                  styles.input,
                  isNameFocused && styles.inputFocused
                ]}
                placeholder="Your display name"
                value={displayName}
                onChangeText={setDisplayName}
                maxLength={50}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[
                  styles.bioInput,
                  isBioFocused && styles.inputFocused
                ]}
                placeholder="Tell us about yourself"
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={160}
                numberOfLines={4}
                onFocus={() => setIsBioFocused(true)}
                onBlur={() => setIsBioFocused(false)}
              />
              <Text style={styles.charCount}>{bio.length}/160</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={[
                  styles.input,
                  isLocationFocused && styles.inputFocused
                ]}
                placeholder="Your location"
                value={location}
                onChangeText={setLocation}
                maxLength={50}
                onFocus={() => setIsLocationFocused(true)}
                onBlur={() => setIsLocationFocused(false)}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={[
                  styles.input,
                  isWebsiteFocused && styles.inputFocused
                ]}
                placeholder="Your website URL"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
                onFocus={() => setIsWebsiteFocused(true)}
                onBlur={() => setIsWebsiteFocused(false)}
              />
            </View>
          </View>
          
          <TouchableOpacity style={styles.premiumContainer}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
            <View>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumDescription}>
                Get unlimited uploads, offline listening, and more
              </Text>
            </View>
            <Text style={styles.premiumArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#4361ee',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  changeAvatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  changeAvatarText: {
    color: '#4361ee',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  bioInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: '#4361ee',
    backgroundColor: '#fff',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  premiumContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 15,
  },
  premiumBadge: {
    backgroundColor: '#ffb100',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  premiumBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  premiumTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  premiumDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  premiumArrow: {
    marginLeft: 'auto',
    fontSize: 24,
    fontWeight: '300',
    color: '#999',
  },
  dangerButton: {
    alignSelf: 'center',
    marginVertical: 30,
    padding: 15,
  },
  dangerButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default EditProfileScreen;