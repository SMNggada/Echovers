import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../context/DataContext';
import { PodcastCard, PlaylistCard, CreatorCard } from '../components';

export default function SearchScreen() {
  const navigation = useNavigation();
  const { podcasts, audiobooks, playlists } = useData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (text) => {
    setQuery(text);
    if (text.trim() === '') {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const q = text.toLowerCase();
    const matches = [];
    podcasts.forEach((p) => {
      if (p.title.toLowerCase().includes(q)) matches.push({ ...p, type: 'podcast' });
    });
    playlists.forEach((pl) => {
      if (pl.title.toLowerCase().includes(q)) matches.push({ ...pl, type: 'playlist' });
    });
    const creatorsMap = {};
    podcasts.forEach((p) => {
      if (p.authorName.toLowerCase().includes(q)) {
        creatorsMap[p.author] = {
          id: p.author,
          name: p.authorName,
          imageUrl: p.coverImage,
          type: 'creator',
        };
      }
    });
    Object.values(creatorsMap).forEach((c) => matches.push(c));
    setResults(matches);
    setIsSearching(false);
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'podcast':
        return <PodcastCard podcast={item} style={styles.card} />;
      case 'playlist':
        return <PlaylistCard playlist={item} style={styles.card} />;
      case 'creator':
        return <CreatorCard creator={item} style={styles.card} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Search for podcasts, playlists, creators…"
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>
      {isSearching ? (
        <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columns}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { marginRight: 8, padding: 4 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  listContent: { padding: 16 },
  columns: { justifyContent: 'space-between' },
  card: { width: '48%', marginBottom: 16 },
});
