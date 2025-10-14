import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import Ionicons from'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const NewMessageScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  
  // Generate mock contacts
  useEffect(() => {
    // Generate recent contacts
    const mockRecentContacts = [
      {
        id: '1',
        name: 'AudioExpert',
        username: '@audioexpert',
        avatar: `https://api.a0.dev/assets/image?text=AE&aspect=1:1&seed=123`,
        lastInteraction: 'Today',
      },
      {
        id: '2',
        name: 'PodcastPro',
        username: '@podcastpro',
        avatar: `https://api.a0.dev/assets/image?text=PP&aspect=1:1&seed=456`,
        lastInteraction: 'Yesterday',
      },
      {
        id: '3',
        name: 'SoundDesigner',
        username: '@sounddesigner',
        avatar: `https://api.a0.dev/assets/image?text=SD&aspect=1:1&seed=789`,
        lastInteraction: '3 days ago',
      },
    ];
    
    setRecentContacts(mockRecentContacts);
  }, []);
  
  // Search users
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      // Mock search results
      const mockResults = [
        {
          id: '4',
          name: 'Audio Creator',
          username: '@audiocreator',
          avatar: `https://api.a0.dev/assets/image?text=AC&aspect=1:1&seed=111`,
          bio: 'Creating amazing audio content for IQspace',
        },
        {
          id: '5',
          name: 'Audio Engineer',
          username: '@audioengineer',
          avatar: `https://api.a0.dev/assets/image?text=AE&aspect=1:1&seed=222`,
          bio: 'Professional sound engineer and audio producer',
        },
        {
          id: '6',
          name: 'Audio Narrator',
          username: '@audionarrator',
          avatar: `https://api.a0.dev/assets/image?text=AN&aspect=1:1&seed=333`,
          bio: 'Voice actor and audiobook narrator',
        },
        {
          id: '7',
          name: 'Sound Technician',
          username: '@soundtech',
          avatar: `https://api.a0.dev/assets/image?text=ST&aspect=1:1&seed=444`,
          bio: 'Audio equipment specialist',
        },
      ].filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Toggle contact selection
  const toggleContactSelection = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id);
      
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };
  
  // Start conversation
  const startConversation = () => {
    if (selectedContacts.length === 0) return;
    
    if (selectedContacts.length === 1) {
      // Navigate to individual chat
      navigation.navigate('Chat', {
        conversationId: `new-${selectedContacts[0].id}`,
        username: selectedContacts[0].name,
        avatar: selectedContacts[0].avatar,
      });
    } else {
      // In a real app, would create a group chat
      // For now, just navigate to the first selected contact
      navigation.navigate('Chat', {
        conversationId: `new-group`,
        username: `Group (${selectedContacts.length})`,
        avatar: selectedContacts[0].avatar,
      });
    }
  };

  // Render recent contact item
  const renderRecentContact = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentContactItem}
      onPress={() => navigation.navigate('Chat', {
        conversationId: `recent-${item.id}`,
        username: item.name,
        avatar: item.avatar,
      })}
    >
      <Image source={{ uri: item.avatar }} style={styles.recentAvatar} />
      <View style={styles.recentContactInfo}>
        <Text style={styles.recentContactName}>{item.name}</Text>
        <Text style={styles.recentContactTime}>{item.lastInteraction}</Text>
      </View>
    </TouchableOpacity>
  );
  
  // Render search result item
  const renderSearchResult = ({ item }) => {
    const isSelected = selectedContacts.some(c => c.id === item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.searchResultItem, isSelected && styles.selectedItem]}
        onPress={() => toggleContactSelection(item)}
      >
        <TouchableOpacity 
          style={[styles.selectCircle, isSelected && styles.selectedCircle]}
          onPress={() => toggleContactSelection(item)}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </TouchableOpacity>
        
        <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userHandle}>{item.username}</Text>
          {item.bio && <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>}
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render selected contacts
  const renderSelectedContactChips = () => (
    <View style={styles.selectedContactsContainer}>
      <FlatList
        data={selectedContacts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.selectedContactChip}>
            <Image source={{ uri: item.avatar }} style={styles.chipAvatar} />
            <Text style={styles.chipName}>{item.name}</Text>
            <TouchableOpacity 
              style={styles.removeChipButton}
              onPress={() => toggleContactSelection(item)}
            >
              <Ionicons name="close-circle" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />
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
        
        <Text style={styles.headerTitle}>New Message</Text>
        
        {selectedContacts.length > 0 && (
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={startConversation}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for people"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>
      
      {/* Selected Contacts */}
      {selectedContacts.length > 0 && renderSelectedContactChips()}
      
      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#6200ee" />
        ) : searchQuery.trim() !== '' ? (
          // Search Results
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchResult}
            contentContainerStyle={styles.resultsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            }
          />
        ) : (
          // Recent Contacts
          <View>
            <Text style={styles.sectionTitle}>Recent</Text>
            <FlatList
              data={recentContacts}
              keyExtractor={(item) => item.id}
              renderItem={renderRecentContact}
              contentContainerStyle={styles.recentList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No recent contacts</Text>
              }
            />
          </View>
        )}
      </View>
      
      {/* Unique Feature: Voice Message to New Contact */}
      <View style={styles.voiceIntroContainer}>
        <View style={styles.voiceIntroCard}>
          <View style={styles.voiceIntroIconContainer}>
            <Ionicons name="mic" size={28} color="#fff" />
          </View>
          <View style={styles.voiceIntroTextContainer}>
            <Text style={styles.voiceIntroTitle}>Voice Introduction</Text>
            <Text style={styles.voiceIntroDescription}>
              Record a voice intro to break the ice when messaging someone new
            </Text>
          </View>
          <TouchableOpacity style={styles.tryItButton}>
            <Text style={styles.tryItButtonText}>Try it</Text>
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  recentList: {
    paddingBottom: 16,
  },
  recentContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
  },
  recentContactInfo: {
    marginLeft: 12,
  },
  recentContactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentContactTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  resultsList: {
    paddingTop: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  selectedItem: {
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
  },
  selectCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userHandle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 12,
    color: '#999',
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  selectedContactsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedContactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
    marginHorizontal: 6,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  chipName: {
    color: '#fff',
    marginLeft: 8,
    marginRight: 4,
    fontSize: 14,
  },
  removeChipButton: {
    marginLeft: 4,
  },
  // Voice Introduction feature styles
  voiceIntroContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  voiceIntroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f5ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  voiceIntroIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIntroTextContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  voiceIntroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  voiceIntroDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  tryItButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  tryItButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default NewMessageScreen;