import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateContent } from '../services/Api';

type EditContentRouteParams = {
  content: {
    id: string;
    type: string;
    title?: string;
    description?: string;
    // Add other fields as needed
  };
};

const EditContentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { content } = (route.params as EditContentRouteParams);
  
  const [title, setTitle] = useState(content.title || '');
  const [description, setDescription] = useState(content.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateContent(content.id, content.type, {
        title,
        description,
        // Add other fields as needed (e.g., tags, categories)
      });
      Alert.alert('Success', 'Content updated successfully');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update content');
      console.error('[EditContentScreen] Update error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit {content.type}</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter content title"
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter content description"
            multiline
            numberOfLines={4}
          />
          {/* Add more fields as needed (e.g., tags, categories, cover image) */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Updating...' : 'Update Content'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  form: { padding: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#ccc' },
  submitText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});

export default EditContentScreen;