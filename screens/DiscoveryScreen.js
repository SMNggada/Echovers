import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, Filter, X, TrendingUp, Headphones, BookOpen, PlaySquare, Users } from 'lucide-react-native';
import { useData } from '../context/DataContext';
import { PodcastCard, AudiobookCard, PlaylistCard, CreatorCard, Tag, SectionTitle } from '../components';
const { width } = Dimensions.get('window');

// Categories for audio content
const CATEGORIES = [
  { id: 'trending', name: 'Trending', icon: TrendingUp },
  { id: 'podcasts', name: 'Podcasts', icon: Headphones },
  { id: 'audiobooks', name: 'Audiobooks', icon: BookOpen },
  { id: 'playlists', name: 'Playlists', icon: PlaySquare },
  { id: 'creators', name: 'Creators', icon: Users },
];

// Tags for filtering
const TAGS = [
  'All',
  'Comedy',
  'True Crime',
  'News',
  'Fiction',
  'Business',
  'Health',
  'Science',
  'Technology',
  'Politics',
  'Sports',
  'Education',
  'History',
  'Arts',
  'Music',
  'Society',
  'Culture'
];

const DiscoveryScreen = () => {
  const navigation = useNavigation();
  const { podcasts, audiobooks, playlists, isLoading } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [activeTag, setActiveTag] = useState('All');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [creators, setCreators] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Extract unique creators from podcasts and audiobooks
  useEffect(() => {
    const uniqueCreators = new Map();
    
    podcasts.forEach(podcast => {
      if (!uniqueCreators.has(podcast.author)) {
        uniqueCreators.set(podcast.author, {
          id: podcast.author,
          name: podcast.name,
          imageUrl: podcast.nmage,
          contentCount: 1,
          type: 'podcast'
        });
      } else {
        const creator = uniqueCreators.get(podcast.author);
        uniqueCreators.set(podcast.author, {
          ...creator,
          contentCount: creator.contentCount + 1
        });
      }
    });
    
    audiobooks.forEach(audiobook => {
      if (!uniqueCreators.has(audiobook.author)) {
        uniqueCreators.set(audiobook.author, {
          id: audiobook.author,
          name: audiobook.name,
          imageUrl: audiobook.namemage,
          contentCount: 1,
          type: 'audiobook'
        });
      } else {
        const creator = uniqueCreators.get(audiobook.author);
        uniqueCreators.set(audiobook.author, {
          ...creator,
          contentCount: creator.contentCount + 1,
          type: creator.type === 'podcast' ? 'both' : 'audiobook'
        });
      }
    });
    
    setCreators(Array.from(uniqueCreators.values()));
  }, [podcasts, audiobooks]);
  
  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    const query = searchQuery.toLowerCase();
    const results = [];
    
    // Search podcasts
    podcasts.forEach(podcast => {
      if (
        podcast.title.toLowerCase().includes(query) ||
        podcast.description.toLowerCase().includes(query) ||
        podcast.authorName.toLowerCase().includes(query) ||
        podcast.categories.some(cat => cat.toLowerCase().includes(query)) ||
        podcast.tags.some(tag => tag.toLowerCase().includes(query))
      ) {
        results.push({
          ...podcast,
          type: 'podcast'
        });
      }
    });
    
    // Search audiobooks
    audiobooks.forEach(audiobook => {
      if (
        audiobook.title.toLowerCase().includes(query) ||
        audiobook.description.toLowerCase().includes(query) ||
        audiobook.authorName.toLowerCase().includes(query) ||
        audiobook.narrator.toLowerCase().includes(query) ||
        audiobook.categories.some(cat => cat.toLowerCase().includes(query)) ||
        audiobook.tags.some(tag => tag.toLowerCase().includes(query))
      ) {
        results.push({
          ...audiobook,
          type: 'audiobook'
        });
      }
    });
    
    // Search playlists
    playlists.forEach(playlist => {
      if (
        playlist.title.toLowerCase().includes(query) ||
        playlist.description.toLowerCase().includes(query)
      ) {
        results.push({
          ...playlist,
          type: 'playlist'
        });
      }
    });
    
    // Search creators
    creators.forEach(creator => {
      if (creator.name.toLowerCase().includes(query)) {
        results.push({
          ...creator,
          type: 'creator'
        });
      }
    });
    
    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery, podcasts, audiobooks, playlists, creators]);
  
  // Filter content by tag
  const getFilteredContent = () => {
    if (activeTag === 'All') {
      switch (activeCategory) {
        case 'podcasts':
          return podcasts;
        case 'audiobooks':
          return audiobooks;
        case 'playlists':
          return playlists;
        case 'creators':
          return creators;
        case 'trending':
        default:
          // For trending, mix all content types and sort by some criteria (e.g., popularity)
          const allContent = [
            ...podcasts.map(item => ({ ...item, type: 'podcast' })),
            ...audiobooks.map(item => ({ ...item, type: 'audiobook' })),
            ...playlists.map(item => ({ ...item, type: 'playlist' }))
          ];
          // Sort by a trending factor (mock implementation - would use actual metrics in production)
          return allContent.sort(() => Math.random() - 0.5);
      }
    } else {
      // Filter by tag
      switch (activeCategory) {
        case 'podcasts':
          return podcasts.filter(podcast => 
            podcast.categories.includes(activeTag) || podcast.tags.includes(activeTag)
          );
        case 'audiobooks':
          return audiobooks.filter(audiobook => 
            audiobook.categories.includes(activeTag) || audiobook.tags.includes(activeTag)
          );
        case 'playlists':
          // Playlists might not have tags, so this is a simplified filter
          return playlists;
        case 'creators':
          // Creators don't have direct tags, so return all
          return creators;
        case 'trending':
        default:
          const filteredContent = [
            ...podcasts.filter(podcast => 
              podcast.categories.includes(activeTag) || podcast.tags.includes(activeTag)
            ).map(item => ({ ...item, type: 'podcast' })),
            ...audiobooks.filter(audiobook => 
              audiobook.categories.includes(activeTag) || audiobook.tags.includes(activeTag)
            ).map(item => ({ ...item, type: 'audiobook' })),
            ...playlists.map(item => ({ ...item, type: 'playlist' }))
          ];
          return filteredContent.sort(() => Math.random() - 0.5);
      }
    }
  };
  
  // Render content item based on type
const renderContentItem = ({ item }) => {
    switch (item.type) {
      case 'podcast':
        return (
          <PodcastCard
            key={`podcast-${item.id}`}
            item={{
              id: item.id,
              title: item.title,
              author: item.authorName || item.author || '',
              image: item.coverImage || item.image
            }}
            style={styles.contentCard}
            onPress={() => navigation.navigate('ContentDetails', { id: item.id, type: 'podcast' })}
          />
        );
      case 'audiobook':
        return (
          <AudiobookCard
            key={`audiobook-${item.id}`}
            audiobook={item}
            style={styles.contentCard}
          />
        );
      case 'playlist':
        return (
          <PlaylistCard
            key={`playlist-${item.id}`}
            item={{
              id: item.id,
              title: item.title,
              description: item.description || '',
              image: item.coverImage || item.image
            }}
            style={styles.contentCard}
            onPress={() => navigation.navigate('ContentDetails', { id: item.id, type: 'playlist' })}
          />
        );
      case 'creator':
        return (
          <CreatorCard
            key={`creator-${item.id}`}
            name={item.name}
            avatar={item.imageUrl || item.avatar || ''}
            followers={item.contentCount || item.followers || 0}
            category={item.type}
            onPress={() => {}}
            onFollow={() => {}}
          />
        );
      default:
        return null;
    }
  };
  
  
  // Render search results
  const renderSearchResults = () => {
    if (searchQuery.trim() === '') return null;
    
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      );
    }
    
    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyResultsContainer}>
          <Text style={styles.emptyResultsText}>No results found for "{searchQuery}"</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.searchResultsContainer}>
        <Text style={styles.searchResultsTitle}>Search Results</Text>
        <FlatList
          data={searchResults}
          renderItem={renderContentItem}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.searchResultsColumns}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  
  // Render category icons
  const renderCategoryIcon = (category) => {
    const Icon = category.icon;
    const isActive = activeCategory === category.id;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryButton, isActive && styles.activeCategoryButton]}
        onPress={() => setActiveCategory(category.id)}
      >
        <Icon size={24} color={isActive ? '#fff' : '#333'} />
        <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {showSearchBar ? (
          <View style={styles.searchBarContainer}>
            <Search size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search podcasts, audiobooks, playlists..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setShowSearchBar(false);
            }}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.headerTitle}>Discover</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowSearchBar(true)}
              >
                <Search size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Filter size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      
      {searchQuery.trim() !== '' ? (
        renderSearchResults()
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map(renderCategoryIcon)}
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScrollView}
            contentContainerStyle={styles.tagsContainer}
          >
            {TAGS.map(tag => (
              <Tag 
                key={tag} 
                label={tag} 
                isActive={activeTag === tag}
                onPress={() => setActiveTag(tag)}
              />
            ))}
          </ScrollView>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1DB954" />
            </View>
          ) : (
            <>
              <SectionTitle title={activeCategory === 'trending' ? 'Trending Now' : CATEGORIES.find(c => c.id === activeCategory)?.name || ''} />
              
              <FlatList
                data={getFilteredContent()}
                renderItem={renderContentItem}
                keyExtractor={(item) => `${item.type || activeCategory}-${item.id}`}
                numColumns={2}
                columnWrapperStyle={styles.contentColumns}
                scrollEnabled={false}
              />
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    width: (width - 48) / 5,
  },
  activeCategoryButton: {
    backgroundColor: '#1DB954',
  },
  categoryText: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
    textAlign: 'center',
  },
  activeCategoryText: {
    color: '#fff',
  },
  tagsScrollView: {
    maxHeight: 50,
  },
  tagsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentColumns: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  contentCard: {
    width: (width - 40) / 2,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  searchResultsContainer: {
    flex: 1,
    padding: 16,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchResultsColumns: {
    justifyContent: 'space-between',
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 80,
  },
});

export default DiscoveryScreen;