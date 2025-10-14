import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getUserContent, deleteContent } from '../services/Api';
import { Edit, Trash2 } from 'lucide-react-native';

const ManageContentScreen = () => {
  const navigation = useNavigation();
  const { user, userRole } = useAuth();
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && userRole === 'creator') {
      fetchUserContent();
    }
  }, [user, userRole]);

  const fetchUserContent = async () => {
    try {
      setIsLoading(true);
      const userContent = await getUserContent(user.uid);
      setContent(userContent);
      setIsLoading(false);
      console.log('[ManageContentScreen] Fetched user content:', userContent);
    } catch (e) {
      setError('Failed to load content');
      setIsLoading(false);
      console.error('[ManageContentScreen] Error fetching content:', e);
    }
  };

  const handleDeleteContent = async (contentId, type) => {
    Alert.alert(
      'Delete Content',
      'Are you sure you want to delete this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContent(contentId, type);
              setContent(content.filter(item => item.id !== contentId));
              console.log(`[ManageContentScreen] Deleted ${type} with ID: ${contentId}`);
            } catch (e) {
              Alert.alert('Error', 'Failed to delete content');
              console.error('[ManageContentScreen] Delete error:', e);
            }
          },
        },
      ]
    );
  };

  const handleEditContent = (item) => {
    navigation.navigate('EditContentScreen', { content: item });
  };

  const renderContentItem = ({ item }) => (
    <View style={styles.contentItem}>
      <Image
        source={{ uri: item.coverImage || 'https://api.a0.dev/assets/image?text=Content&aspect=1:1' }}
        style={styles.contentImage}
      />
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.contentType}>{item.type}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditContent(item)}
          >
            <Edit size={20} color="#1DB954" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteContent(item.id, item.type)}
          >
            <Trash2 size={20} color="#FF3B30" />
            <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (userRole !== 'creator') {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Only creators can manage content.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Your Content</Text>
      </View>
      {content.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No content uploaded yet.</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('CreateAudioContentScreen')}
          >
            <Text style={styles.uploadText}>Upload Content</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={content}
          renderItem={renderContentItem}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.contentList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#666', textAlign: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 16 },
  uploadButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  uploadText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  contentList: { padding: 16 },
  contentItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  contentImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  contentInfo: { flex: 1 },
  contentTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  contentType: { fontSize: 14, color: '#666', marginTop: 4 },
  actionButtons: { flexDirection: 'row', marginTop: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionText: { fontSize: 14, marginLeft: 4, fontWeight: '600' },
});

export default ManageContentScreen;