import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'sonner-native';
import { uploadAudioContent } from '../services/Api';
import ReactNativeBlobUtil from 'react-native-blob-util';

// Categories for audio upload
const categories = [
  { id: 'podcast', name: 'Podcast' },
  { id: 'audiobook', name: 'Audiobook' },
  { id: 'narration', name: 'Narration' },
  { id: 'motivation', name: 'Motivation' },
  { id: 'education', name: 'Education' },
];

const CreateAudioContentScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [coverImage, setCoverImage] = useState(null); // Store cover image URI
  const [imageDimensions, setImageDimensions] = useState({ width: 200, height: 200 }); // Store original image dimensions
  const [audioFile, setAudioFile] = useState(null); // Store audio file object
  const [uploading, setUploading] = useState(false);

  // Request permissions for storage or photo library
  const requestPermissions = async (type) => {
    try {
      if (Platform.OS === 'android') {
        const permissions = [
          type === 'image' ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE : null,
          type === 'image' ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE : null,
          type === 'audio' ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE : null,
          type === 'audio' ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE : null,
        ].filter(Boolean);

        for (const permission of permissions) {
          const status = await check(permission);
          console.log(`Checking ${permission}: ${status}`);
          if (status !== RESULTS.GRANTED) {
            const result = await request(permission);
            console.log(`Requesting ${permission}: ${result}`);
            if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
              toast.error(
                `${type === 'image' ? 'Storage' : 'Storage'} permission is required to select ${type === 'image' ? 'images' : 'audio files'}. Please enable it in settings.`,
                {
                  action: {
                    label: 'Open Settings',
                    onPress: () => openSettings().catch(() => toast.error('Failed to open settings')),
                  },
                }
              );
              return false;
            }
          }
        }
      } else if (Platform.OS === 'ios') {
        const permission = type === 'image' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.IOS.MEDIA_LIBRARY;
        const status = await check(permission);
        console.log(`Checking ${permission}: ${status}`);
        if (status !== RESULTS.GRANTED) {
          const result = await request(permission);
          console.log(`Requesting ${permission}: ${result}`);
          if (result !== RESULTS.GRANTED) {
            toast.error(
              `${type === 'image' ? 'Photo library' : 'Media library'} permission is required. Please enable it in settings.`,
              {
                action: {
                  label: 'Open Settings',
                  onPress: () => openSettings().catch(() => toast.error('Failed to open settings')),
                },
              }
            );
            return false;
          }
        }
      }
      return true;
    } catch (e) {
      console.warn(`Permission check error (${type}):`, JSON.stringify(e, null, 2));
      toast.error('Failed to check permissions.');
      return false;
    }
  };

  // Handle category selection
  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle cover image upload
  const handleUploadCover = async () => {
    const hasPermission = await requestPermissions('image');
    if (!hasPermission) {
      console.log('Image picker blocked due to missing permissions');
      return;
    }

    try {
      console.log('Opening image picker...');
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1, // Use full quality to avoid compression
        includeBase64: false,
        selectionLimit: 1,
      });

      console.log('Image picker result:', JSON.stringify(result, null, 2));

      if (result.didCancel) {
        console.log('Image picker cancelled by user');
        toast.info('Image selection cancelled.');
        return;
      }

      if (result.errorCode) {
        console.warn('Image picker error:', result.errorCode, result.errorMessage);
        toast.error(`Failed to pick image: ${result.errorMessage || 'Unknown error'}`);
        return;
      }

      const image = result.assets?.[0];
      if (image?.uri) {
        console.log('Selected image URI:', image.uri);
        setCoverImage(image.uri);

        // Get image dimensions
        if (image.width && image.height) {
          // Calculate scaled dimensions to fit within a reasonable max width (e.g., screen width)
          const maxWidth = Dimensions.get('window').width - 32; // Account for padding
          const aspectRatio = image.width / image.height;
          const scaledWidth = Math.min(image.width, maxWidth);
          const scaledHeight = scaledWidth / aspectRatio;
          setImageDimensions({ width: scaledWidth, height: scaledHeight });
          console.log('Image dimensions:', { width: image.width, height: image.height, scaledWidth, scaledHeight });
        } else {
          // Fallback: Use Image.getSize to fetch dimensions if not provided
          Image.getSize(
            image.uri,
            (width, height) => {
              const maxWidth = Dimensions.get('window').width - 32;
              const aspectRatio = width / height;
              const scaledWidth = Math.min(width, maxWidth);
              const scaledHeight = scaledWidth / aspectRatio;
              setImageDimensions({ width: scaledWidth, height: scaledHeight });
              console.log('Fetched image dimensions:', { width, height, scaledWidth, scaledHeight });
            },
            (error) => {
              console.warn('Error getting image size:', error);
              setImageDimensions({ width: 200, height: 200 }); // Fallback to default
            }
          );
        }
        toast.success('Cover image selected successfully!');
      } else {
        console.warn('No valid image URI found in result');
        toast.error('No image selected.');
      }
    } catch (e) {
      console.warn('Image picker error:', JSON.stringify(e, null, 2));
      toast.error(`Failed to pick cover image: ${e.message || 'Unknown error'}`);
    }
  };

  // Handle audio file upload using @react-native-documents/picker
  const handleUploadAudio = async () => {
    const hasPermission = await requestPermissions('audio');
    if (!hasPermission) return;

    try {
      console.log('Opening audio picker...');
      const result = await pick({
        type: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/*'],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
      });

      console.log('Audio picker result:', JSON.stringify(result, null, 2));

      const file = result[0];
      if (file?.uri) {
        const stat = await ReactNativeBlobUtil.fs.stat(file.uri);
        console.log('[CreateAudioContentScreen] Selected audio file:', {
          uri: file.uri,
          name: file.name,
          type: file.type,
          size: stat?.size || 'unknown',
          path: stat?.path || 'unknown',
        });
        setAudioFile({
          uri: file.uri,
          name: file.name || `audio_${Date.now()}.mp3`,
          type: file.type || 'audio/mpeg',
        });
        toast.success('Audio file selected successfully!');
      } else {
        console.warn('No valid audio file URI found in result');
        toast.error('No audio file selected.');
      }
    } catch (e) {
      console.warn('Audio picker error:', JSON.stringify(e, null, 2));
      toast.error(`Failed to pick audio file: ${e.message || 'Unknown error'}`);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log('Submit button pressed. Current state:', {
      title,
      selectedCategory,
      audioFile,
      coverImage,
      uploading,
      userId: user?.uid,
    });

    if (!user) {
      toast.error('Please sign in to upload content.');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title.');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category.');
      return;
    }

    if (!audioFile) {
      toast.error('Please upload an audio file.');
      return;
    }

    try {
      setUploading(true);
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        coverImage: coverImage || '',
        isPublished: true,
      };
      console.log('Submitting with data:', {
        audioFile,
        metadata,
        userId: user.uid,
        contentType: selectedCategory,
      });

      await uploadAudioContent(audioFile, metadata, user.uid, selectedCategory);

      toast.success('Content uploaded successfully!');
      navigation.goBack();
    } catch (e) {
      console.error('Upload error:', {
        message: e.message,
        code: e.code,
        stack: e.stack,
        details: JSON.stringify(e, null, 2),
      });
      let errorMessage = 'Failed to upload content. Please try again.';
      if (e.message.includes('User must have creator role')) {
        errorMessage = 'You need creator status to upload content. Please apply for creator access.';
      } else if (e.message.includes('Invalid audio file object')) {
        errorMessage = 'Invalid audio file. Please select a valid audio file.';
      } else if (e.message.includes('Invalid cover image URI')) {
        errorMessage = 'Invalid cover image. Please select a valid image.';
      } else if (e.message.includes('AccessDenied')) {
        errorMessage = 'S3 access denied. Please check AWS configuration.';
      } else if (e.message.includes('InvalidAccessKeyId')) {
        errorMessage = 'Invalid AWS credentials. Please check your setup.';
      }
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Sign in to upload audio content.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Content</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image Upload */}
        <View style={styles.coverImageSection}>
          <Text style={styles.sectionTitle}>Cover Image</Text>
          <TouchableOpacity
            style={[styles.coverImageContainer, { width: imageDimensions.width, height: imageDimensions.height }]}
            onPress={handleUploadCover}
          >
            <Image
              source={{
                uri: coverImage || 'https://api.a0.dev/assets/image?text=Upload%20Cover&aspect=1:1',
              }}
              style={[styles.coverImage, { width: imageDimensions.width, height: imageDimensions.height }]}
              resizeMode="contain" // Preserve original aspect ratio
            />
            <View style={styles.coverImageOverlay}>
              <Text style={styles.coverImageText}>Tap to Change</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter a title for your audio"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Describe your audio content"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Category */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategoryButton,
                ]}
                onPress={() => handleSelectCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.selectedCategoryButtonText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Audio File Upload */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Audio File</Text>
          <TouchableOpacity
            style={styles.audioUploadButton}
            onPress={handleUploadAudio}
          >
            <Text
              style={[
                styles.audioUploadText,
                audioFile && { color: '#1db954' },
              ]}
            >
              {audioFile ? `${audioFile.name} ✓` : 'Select Audio File'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.audioHelpText}>
            Supported formats: mp3, wav, m4a
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!title || !selectedCategory || !audioFile || uploading) &&
              styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Upload Content</Text>
          )}
        </TouchableOpacity>

        <View style={styles.playerSpaceFiller} />
      </ScrollView>
      <Toaster position="top" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  formSection: {
    padding: 16,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  coverImageSection: {
    padding: 16,
    alignItems: 'center',
  },
  coverImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    resizeMode: 'contain', // Ensure image is not cropped
  },
  coverImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryButton: {
    backgroundColor: '#1db954',
    borderColor: '#1db954',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#555',
  },
  selectedCategoryButtonText: {
    color: '#fff',
  },
  audioUploadButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  audioUploadText: {
    fontSize: 16,
    color: '#555',
  },
  audioHelpText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#1db954',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  playerSpaceFiller: {
    height: 70,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default CreateAudioContentScreen;