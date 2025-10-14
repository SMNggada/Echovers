import { db, createDocument, updateDocument, getDocuments, getDocument } from '../config/firebase';
import { serverTimestamp, collection, doc, runTransaction } from '@react-native-firebase/firestore';
import AWS from 'aws-sdk';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Buffer } from 'buffer';

if (__DEV__) {
  console.log('API Firebase imports:', { createDocument, getDocuments, updateDocument, getDocument });
}

// Initialize AWS S3
const s3 = new AWS.S3({
  accessKeyId: 'AKIAXWMA6SRA44EUF6TO',
  secretAccessKey: '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',
  region: 'eu-north-1',
  signatureVersion: 'v4',
});

const BUCKET_NAME = 'iqspace'; 

export const getAudioUrl = async (key) => {
  try {
    console.log('[Api] Getting signed URL for:', { key });
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 3600,
    };
    const url = await s3.getSignedUrlPromise('getObject', params);
    console.log('[Api] Signed URL:', url);
    return url;
  } catch (error) {
    console.error('[Api] Error getting signed URL:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to get audio URL: ${error.message}`);
  }
};

export const submitCreatorApplication = async (userId, data) => {
  try {
    console.log('[Api] Submitting creator application:', { data, userId });
    if (!data.bio || typeof data.bio !== 'string' || data.bio.length === 0 || data.bio.length > 1000) {
      throw new Error('Bio is required and must be a string between 1 and 1000 characters');
    }
    let userDoc = await getDocument('users', userId);
    if (!userDoc) {
      console.log('[Api] User document not found, creating:', userId);
      userDoc = {
        userId,
        role: 'listener',
        hasAppliedForCreator: false,
        createdAt: serverTimestamp(),
        email: data.email || '',
        name: data.name || 'Anonymous',
      };
    }
    if (userDoc.hasAppliedForCreator) {
      throw new Error('User has already applied for creator status');
    }

    let applicationId;
    await runTransaction(db, async (transaction) => {
      const applicationRef = doc(collection(db, 'creator_applications'));
      const userRef = doc(db, 'users', userId);

      console.log('[Api] Creating creator application in transaction:', applicationRef.id);
      transaction.set(applicationRef, {
        ...data,
        userId,
        status: 'pending',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        email: data.email || '',
      });

      console.log('[Api] Updating users document in transaction:', userId);
      transaction.set(userRef, {
        ...userDoc,
        hasAppliedForCreator: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      applicationId = applicationRef.id;
    });

    console.log('[Api] Created application:', applicationId);
    console.log('[Api] Updated user document for:', userId);
    return { id: applicationId };
  } catch (error) {
    console.error('[Api] Error submitting creator application:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    if (error.code === 'firestore/permission-denied') {
      throw new Error(`Permission denied for userId ${userId}. Ensure the user document has a valid userId field and Firestore rules are configured correctly.`);
    }
    throw new Error(`Failed to submit creator application: ${error.message}`);
  }
};

export const getCreatorApplicationStatus = async (userId) => {
  try {
    console.log('[Api] Fetching application status for:', userId);
    const applications = await getDocuments(
      'creator_applications',
      [['userId', '==', userId]],
      'submittedAt',
      'desc',
      1
    );
    console.log('[Api] Fetched applications:', applications);
    return applications.length > 0 ? applications[0] : null;
  } catch (error) {
    console.error('[Api] Error getting creator application status:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to get creator application status: ${error.message}`);
  }
};

export const uploadAudioContent = async (audioFile, metadata, userId, contentType) => {
  try {
    console.log('[Api] Starting audio content upload:', { audioFile, metadata, userId, contentType });

    // Validate inputs
    if (!userId) throw new Error('User ID is required');
    if (!audioFile?.uri || !audioFile?.name || !audioFile?.type) {
      throw new Error('Invalid audio file object: missing uri, name, or type');
    }
    if (metadata.coverImage && !metadata.coverImage.startsWith('file://') && !metadata.coverImage.startsWith('content://')) {
      throw new Error('Invalid cover image URI');
    }

    // Verify user role
    const userDoc = await getDocument('users', userId);
    if (!userDoc || userDoc.role !== 'creator') {
      throw new Error('User must have creator role to upload content');
    }

    // Sanitize file name
    const sanitizedFileName = audioFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const audioKey = `${contentType}/${userId}/${timestamp}-${sanitizedFileName}`;
    const imageKey = metadata.coverImage ? `images/${userId}/${timestamp}-cover.jpg` : null;

    // Check file existence
    const audioExists = await ReactNativeBlobUtil.fs.exists(audioFile.uri);
    if (!audioExists) {
      throw new Error(`Audio file not found at URI: ${audioFile.uri}`);
    }
    console.log('[Api] Audio file exists:', audioFile.uri);

    // Read audio file
    console.log('[Api] Reading audio file:', audioFile.uri);
    const fileContent = await ReactNativeBlobUtil.fs.readFile(audioFile.uri, 'base64');
    const audioBuffer = Buffer.from(fileContent, 'base64');

    // Upload audio to S3
    console.log('[Api] Uploading audio to S3:', { bucket: BUCKET_NAME, key: audioKey });
    const audioParams = {
      Bucket: BUCKET_NAME,
      Key: audioKey,
      Body: audioBuffer,
      ContentType: audioFile.type,
    };
    const audioData = await s3.upload(audioParams).promise();
    console.log('[Api] Audio uploaded successfully:', audioData.Location);

    // Handle cover image if provided
    let coverImageUrl = metadata.coverImage || '';
    if (metadata.coverImage) {
      console.log('[Api] Reading cover image:', metadata.coverImage);
      const imageContent = await ReactNativeBlobUtil.fs.readFile(metadata.coverImage, 'base64');
      const imageBuffer = Buffer.from(imageContent, 'base64');

      console.log('[Api] Uploading cover image to S3:', { bucket: BUCKET_NAME, key: imageKey });
      const imageParams = {
        Bucket: BUCKET_NAME,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      };
      const imageData = await s3.upload(imageParams).promise();
      coverImageUrl = imageData.Location;
      console.log('[Api] Cover image uploaded successfully:', coverImageUrl);
    }

    // Determine Firestore collection
    let collectionName;
    switch (contentType) {
      case 'podcast':
        collectionName = 'podcasts';
        break;
      case 'episode':
        collectionName = 'episodes';
        break;
      case 'audiobook':
        collectionName = 'audiobooks';
        break;
      default:
        throw new Error(`Invalid content type: ${contentType}`);
    }

    // Store metadata in Firestore
    const contentData = {
      ...metadata,
      creatorId: userId,
      audioKey,
      audioUrl: audioData.Location,
      coverImage: coverImageUrl,
      isPublished: metadata.isPublished || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    console.log('[Api] Creating Firestore document:', contentData);
    const content = await createDocument(collectionName, contentData);
    console.log('[Api] Uploaded content:', content);
    return content;
  } catch (error) {
    console.error('[Api] Error uploading audio content:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to upload audio content: ${error.message}`);
  }
};

export const getUserContent = async (userId) => {
  try {
    console.log('[Api] Fetching user content for:', userId);
    const collections = ['podcasts', 'episodes', 'audiobooks'];
    const contentPromises = collections.map(async (collectionName) => {
      const content = await getDocuments(
        collectionName,
        [['creatorId', '==', userId]],
        'createdAt',
        'desc'
      );
      return content.map(item => ({
        ...item,
        type: collectionName.slice(0, -1), // Remove 's' to get singular type (e.g., 'podcast')
      }));
    });

    const [podcasts, episodes, audiobooks] = await Promise.all(contentPromises);
    const userContent = [...podcasts, ...episodes, ...audiobooks];
    console.log('[Api] Fetched user content:', userContent);
    return userContent;
  } catch (error) {
    console.error('[Api] Error fetching user content:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to fetch user content: ${error.message}`);
  }
};

export const deleteContent = async (contentId, contentType) => {
  try {
    console.log('[Api] Deleting content:', { contentId, contentType });

    // Validate inputs
    if (!contentId || !contentType) {
      throw new Error('Content ID and type are required');
    }

    // Determine Firestore collection
    let collectionName;
    switch (contentType) {
      case 'podcast':
        collectionName = 'podcasts';
        break;
      case 'episode':
        collectionName = 'episodes';
        break;
      case 'audiobook':
        collectionName = 'audiobooks';
        break;
      default:
        throw new Error(`Invalid content type: ${contentType}`);
    }

    // Fetch content to get audioKey and coverImage
    const content = await getDocument(collectionName, contentId);
    if (!content) {
      throw new Error(`Content not found: ${contentId}`);
    }

    // Delete audio file from S3
    if (content.audioKey) {
      console.log('[Api] Deleting audio from S3:', { bucket: BUCKET_NAME, key: content.audioKey });
      await s3.deleteObject({ Bucket: BUCKET_NAME, Key: content.audioKey }).promise();
      console.log('[Api] Audio deleted from S3:', content.audioKey);
    }

    // Delete cover image from S3 if exists
    if (content.coverImage) {
      const imageKey = content.coverImage.split('/').slice(-2).join('/'); // Extract key from URL
      console.log('[Api] Deleting cover image from S3:', { bucket: BUCKET_NAME, key: imageKey });
      await s3.deleteObject({ Bucket: BUCKET_NAME, Key: imageKey }).promise();
      console.log('[Api] Cover image deleted from S3:', imageKey);
    }

    // Delete content metadata from Firestore
    await runTransaction(db, async (transaction) => {
      const contentRef = doc(db, collectionName, contentId);
      console.log('[Api] Deleting Firestore document:', contentId);
      transaction.delete(contentRef);
    });

    console.log('[Api] Content deleted successfully:', { contentId, contentType });
    return { success: true };
  } catch (error) {
    console.error('[Api] Error deleting content:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to delete content: ${error.message}`);
  }
};

export const updateContent = async (contentId, contentType, updatedData) => {
  try {
    console.log('[Api] Updating content:', { contentId, contentType, updatedData });

    // Validate inputs
    if (!contentId || !contentType) {
      throw new Error('Content ID and type are required');
    }
    if (!updatedData.title || typeof updatedData.title !== 'string' || updatedData.title.length === 0) {
      throw new Error('Title is required and must be a non-empty string');
    }

    // Determine Firestore collection
    let collectionName;
    switch (contentType) {
      case 'podcast':
        collectionName = 'podcasts';
        break;
      case 'episode':
        collectionName = 'episodes';
        break;
      case 'audiobook':
        collectionName = 'audiobooks';
        break;
      default:
        throw new Error(`Invalid content type: ${contentType}`);
    }

    // Handle cover image update if provided
    let coverImageUrl = updatedData.coverImage || '';
    if (updatedData.coverImage && (updatedData.coverImage.startsWith('file://') || updatedData.coverImage.startsWith('content://'))) {
      console.log('[Api] Reading new cover image:', updatedData.coverImage);
      const imageContent = await ReactNativeBlobUtil.fs.readFile(updatedData.coverImage, 'base64');
      const imageBuffer = Buffer.from(imageContent, 'base64');
      const timestamp = Date.now();
      const imageKey = `images/${updatedData.creatorId}/${timestamp}-cover.jpg`;

      console.log('[Api] Uploading new cover image to S3:', { bucket: BUCKET_NAME, key: imageKey });
      const imageParams = {
        Bucket: BUCKET_NAME,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
      };
      const imageData = await s3.upload(imageParams).promise();
      coverImageUrl = imageData.Location;
      console.log('[Api] New cover image uploaded successfully:', coverImageUrl);

      // Delete old cover image if it exists
      const oldContent = await getDocument(collectionName, contentId);
      if (oldContent && oldContent.coverImage) {
        const oldImageKey = oldContent.coverImage.split('/').slice(-2).join('/');
        console.log('[Api] Deleting old cover image from S3:', { bucket: BUCKET_NAME, key: oldImageKey });
        await s3.deleteObject({ Bucket: BUCKET_NAME, Key: oldImageKey }).promise();
        console.log('[Api] Old cover image deleted from S3:', oldImageKey);
      }
    }

    // Update metadata in Firestore
    const contentData = {
      ...updatedData,
      coverImage: coverImageUrl,
      updatedAt: serverTimestamp(),
    };
    console.log('[Api] Updating Firestore document:', contentData);
    await updateDocument(collectionName, contentId, contentData);
    console.log('[Api] Content updated successfully:', { contentId, contentType });
    return { success: true, content: { id: contentId, ...contentData } };
  } catch (error) {
    console.error('[Api] Error updating content:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to update content: ${error.message}`);
  }
};

export const createPlaylist = async (data, userId) => {
  try {
    console.log('[Api] Creating playlist:', { data, userId });
    const playlist = await createDocument('playlists', {
      ...data,
      userId,
      isPublic: data.isPublic || false,
      items: data.items || [],
      createdAt: serverTimestamp(),
    });
    console.log('[Api] Created playlist:', playlist);
    return playlist;
  } catch (error) {
    console.error('[Api] Error creating playlist:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to create playlist: ${error.message}`);
  }
};

export const addToPlaylist = async (playlistId, item) => {
  try {
    console.log('[Api] Adding to playlist:', { playlistId, item });
    const playlist = await getDocument('playlists', playlistId);
    if (!playlist) {
      throw new Error(`Playlist not found: ${playlistId}`);
    }
    const updatedItems = [...(playlist.items || []), item];
    await updateDocument('playlists', playlistId, {
      items: updatedItems,
      updatedAt: serverTimestamp(),
    });
    console.log('[Api] Updated playlist:', playlistId);
    return {
      ...playlist,
      items: updatedItems,
    };
  } catch (error) {
    console.error('[Api] Error adding to playlist:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to add to playlist: ${error.message}`);
  }
};

export const updateListeningProgress = async (userId, contentId, contentType, progress, duration) => {
  try {
    console.log('[Api] Updating listening progress:', { userId, contentId, contentType, progress, duration });
    const progressId = `${userId}_${contentId}`;
    const progressData = {
      userId,
      contentId,
      contentType,
      progress,
      duration,
      lastListened: serverTimestamp(),
    };
    await createDocument('user_progress', progressData, progressId);
    console.log('[Api] Updated listening progress:', progressId);
    return progressData;
  } catch (error) {
    console.error('[Api] Error updating listening progress:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to update listening progress: ${error.message}`);
  }
};

export const getListeningHistory = async (userId, limit = 10) => {
  try {
    console.log('[Api] Fetching listening history:', { userId, limit });
    const progress = await getDocuments(
      'user_progress',
      [['userId', '==', userId]],
      'lastListened',
      'desc',
      limit
    );
    console.log('[Api] Fetched listening history:', progress);
    return progress;
  } catch (error) {
    console.error('[Api] Error getting listening history:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to get listening history: ${error.message}`);
  }
};

export const approveCreatorApplication = async (applicationId, applicantUserId, adminUserId) => {
  try {
    console.log('[Api] Approving creator application:', { applicationId, applicantUserId, adminUserId });
    if (applicantUserId === adminUserId) {
      throw new Error('Cannot approve your own creator application');
    }
    let adminDoc = await getDocument('users', adminUserId);
    if (!adminDoc) {
      throw new Error(`Admin user document not found for userId: ${adminUserId}`);
    }
    if (adminDoc.role !== 'admin') {
      throw new Error('Only admins can approve creator applications');
    }
    let applicantDoc = await getDocument('users', applicantUserId);
    if (!applicantDoc) {
      console.log('[Api] Applicant user document not found, creating:', applicantUserId);
      applicantDoc = {
        userId: applicantUserId,
        role: 'listener',
        hasAppliedForCreator: true,
        createdAt: serverTimestamp(),
        email: '',
        name: 'Anonymous',
      };
    }

    await runTransaction(db, async (transaction) => {
      const applicationRef = doc(db, 'creator_applications', applicationId);
      const userRef = doc(db, 'users', applicantUserId);

      console.log('[Api] Updating creator_applications in transaction:', applicationId);
      transaction.update(applicationRef, {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });

      console.log('[Api] Updating users document in transaction:', applicantUserId);
      transaction.set(userRef, {
        ...applicantDoc,
        userId: applicantUserId,
        role: 'creator',
        hasAppliedForCreator: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    });

    console.log(`[Api] Creator application ${applicationId} approved for user ${applicantUserId} by admin ${adminUserId}`);
    return { success: true };
  } catch (error) {
    console.error('[Api] Error approving creator application:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    if (error.code === 'firestore/permission-denied') {
      throw new Error(`Permission denied for admin ${adminUserId}. Ensure the admin has role 'admin' and Firestore rules allow updates.`);
    }
    throw new Error(`Failed to approve creator application: ${error.message}`);
  }
};

export const updateCreatorApplication = async (applicationId, data, adminUserId) => {
  try {
    console.log('[Api] Updating creator application:', { applicationId, data, adminUserId });
    let adminDoc = await getDocument('users', adminUserId);
    if (!adminDoc) {
      throw new Error(`Admin user document not found for userId: ${adminUserId}`);
    }
    if (adminDoc.role !== 'admin') {
      throw new Error('Only admins can update creator applications');
    }
    await updateDocument('creator_applications', applicationId, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    console.log(`[Api] Updated creator application ${applicationId} by admin ${adminUserId}`);
    return { success: true };
  } catch (error) {
    console.error('[Api] Error updating creator application:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    if (error.code === 'firestore/permission-denied') {
      throw new Error(`Permission denied for admin ${adminUserId}. Ensure the admin has role 'admin' and Firestore rules allow updates.`);
    }
    throw new Error(`Failed to update creator application: ${error.message}`);
  }
};

export const getCreatorApplications = async () => {
  try {
    console.log('[Api] Fetching creator applications');
    const applications = await getDocuments('creator_applications', [['status', '==', 'pending']]);
    console.log('[Api] Fetched creator applications:', applications);
    return applications;
  } catch (error) {
    console.error('[Api] Error fetching creator applications:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    throw new Error(`Failed to fetch creator applications: ${error.message}`);
  }
};

export const CreatorRequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const requestCreatorAccess = submitCreatorApplication;
export const getCreatorRequestStatus = getCreatorApplicationStatus;