import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getDocuments,
  subscribeToCollection,
  doc,
  updateDoc,
  db,
  arrayUnion,
  arrayRemove,
  setDoc,
  onSnapshot,
} from '../config/firebase';
import { getAudioUrl } from '../services/Api';
import { useAuth } from './AuthContext';
import ReactNativeBlobUtil from 'react-native-blob-util';

// Types
interface AudioContent {
  id: string;
  title: string;
  authorName: string;
  coverImage: string;
  type: 'podcast' | 'audiobook' | 'episode';
  audioKey?: string;
}

interface PodcastItem extends AudioContent {
  episodes: any[];
  description: string;
  audioKey: string;
  audioUrl: string;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  episodeCount?: number;
  rating?: number;
}

interface Playlist {
  id: string;
  title: string;
  items: AudioContent[];
  createdAt: string;
  isPublic?: boolean;
  userId?: string;
}

interface Bookmark {
  id: string;
  type: 'podcast' | 'episode' | 'audiobook';
  addedAt: string;
  itemId: string;
}

// ADD: Like type
interface Like {
  id: string;
  type: 'podcast' | 'episode' | 'audiobook';
  addedAt: string;
}

interface DownloadedContent extends AudioContent {
  localPath: string;
  downloadedAt: string;
}

interface DataContextType {
  podcasts: PodcastItem[];
  audiobooks: AudioContent[];
  playlists: Playlist[];
  continueListening: any[];
  categories: any[];
  creators: any[];
  bookmarks: Bookmark[];
  // ADD: likes in context type
  likes: Like[];
  downloadedContent: DownloadedContent[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getAudioContent: (key: string) => Promise<string>;
  toggleBookmark: (id: string, type: 'podcast' | 'episode' | 'audiobook', value: boolean) => Promise<void>;
  getBookmarks: () => Bookmark[];
  // ADD: like helpers
  toggleLike: (id: string, type: 'podcast' | 'episode' | 'audiobook', value: boolean) => Promise<void>;
  isLiked: (id: string) => boolean;
  downloadContent: (content: AudioContent) => Promise<void>;
  getDownloadedContent: () => DownloadedContent[];
  createPlaylist: (title: string) => Promise<void>;
  addToPlaylist: (playlistId: string, item: AudioContent) => Promise<void>;
  removeFromPlaylist: (playlistId: string, itemId?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  podcasts: [],
  audiobooks: [],
  playlists: [],
  continueListening: [],
  categories: [],
  creators: [],
  bookmarks: [],
  // ADD: likes default
  likes: [],
  downloadedContent: [],
  isLoading: true,
  refreshData: async () => {},
  getAudioContent: async () => '',
  toggleBookmark: async () => {},
  getBookmarks: () => [],
  // ADD: like defaults
  toggleLike: async () => {},
  isLiked: () => false,
  downloadContent: async () => {},
  getDownloadedContent: () => [],
  createPlaylist: async () => {},
  addToPlaylist: async () => {},
  removeFromPlaylist: async () => {},
});

const COLLECTIONS = {
  PODCASTS: 'podcasts',
  EPISODES: 'episodes',
  AUDIOBOOKS: 'audiobooks',
  PLAYLISTS: 'playlists',
  USER_PROGRESS: 'user_progress',
  CATEGORIES: 'categories',
  USERS: 'users',
} as const;

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState({
    podcasts: [] as PodcastItem[],
    audiobooks: [] as AudioContent[],
    playlists: [] as Playlist[],
    continueListening: [],
    categories: [],
    creators: [],
    bookmarks: [] as Bookmark[],
    // ADD: likes state
    likes: [] as Like[],
    downloadedContent: [] as DownloadedContent[],
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const [
        podcasts,
        audiobooks,
        playlists,
        categories,
        creators,
        continueListening,
      ] = await Promise.all([
        getDocuments(COLLECTIONS.PODCASTS, [['isPublished', '==', true]], 'createdAt', 'desc'),
        getDocuments(COLLECTIONS.AUDIOBOOKS, [['isPublished', '==', true]], 'createdAt', 'desc'),
        getDocuments(COLLECTIONS.PLAYLISTS, [['isPublic', '==', true]], 'createdAt', 'desc'),
        getDocuments(COLLECTIONS.CATEGORIES, undefined, 'name', 'asc'),
        getDocuments(COLLECTIONS.USERS, [['role', '==', 'creator']], 'displayName', 'asc'),
        user ? fetchContinueListening(user.uid) : Promise.resolve([]),
      ]);

      setState(prev => ({
        ...prev,
        podcasts,
        audiobooks,
        playlists,
        categories,
        creators,
        continueListening,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Data fetch error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  const fetchContinueListening = async (userId: string) => {
    try {
      const userProgress = await getDocuments(COLLECTIONS.USER_PROGRESS, [['userId', '==', userId]], 'lastListened', 'desc');
      return Promise.all(
        userProgress.map(async (progress) => {
          const collection = progress.contentType === 'episode' ? COLLECTIONS.EPISODES : COLLECTIONS.AUDIOBOOKS;
          const [content] = await getDocuments(collection, [['id', '==', progress.contentId]], undefined, undefined, 1);
          return content ? { ...content, progress: progress.progress } : null;
        })
      ).then(results => results.filter(Boolean));
    } catch (error) {
      console.error('Continue listening error:', error);
      return [];
    }
  };

  const getAudioContent = useCallback(async (key: string) => {
    try {
      return await getAudioUrl(key);
    } catch (error) {
      console.error('Audio URL error:', error);
      return '';
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setState(prev => ({
          ...prev,
          bookmarks: data.bookmarks || [],
          // ADD: hydrate likes and downloadedContent if present
          likes: data.likes || [],
          downloadedContent: data.downloadedContent || prev.downloadedContent,
        }));
      } else {
        setDoc(userRef, { bookmarks: [], likes: [] }, { merge: true });
      }
    }, (error) => {
      console.error('User metadata sync error:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const toggleBookmark = useCallback(
    async (id: string, type: 'podcast' | 'episode' | 'audiobook', value: boolean) => {
      if (!user?.uid) return;

      const userRef = doc(db, 'users', user.uid);
      const bookmarkData: Bookmark = { id, type, addedAt: new Date().toISOString(), itemId: id };

      try {
        if (value) {
          await updateDoc(userRef, { bookmarks: arrayUnion(bookmarkData) });
          setState(prev => ({ ...prev, bookmarks: [...prev.bookmarks, bookmarkData] }));
        } else {
          await updateDoc(userRef, { bookmarks: arrayRemove(bookmarkData) });
          setState(prev => ({
            ...prev,
            bookmarks: prev.bookmarks.filter(b => b.itemId !== id),
          }));
        }
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
    },
  [user?.uid]
  );

  // ADD: toggleLike helper
  const toggleLike = useCallback(
    async (id: string, type: 'podcast' | 'episode' | 'audiobook', value: boolean) => {
      if (!user?.uid) return;
      const userRef = doc(db, 'users', user.uid);
      const like: Like = { id, type, addedAt: new Date().toISOString() };
      try {
        if (value) {
          await updateDoc(userRef, { likes: arrayUnion(like) });
          setState(prev => ({ ...prev, likes: [...prev.likes, like] }));
        } else {
          await updateDoc(userRef, { likes: arrayRemove(like) });
          setState(prev => ({ ...prev, likes: prev.likes.filter(l => l.id !== id) }));
        }
      } catch (e) {
        console.error('Error toggling like:', e);
      }
    },
  [user?.uid]
  );

  // ADD: isLiked selector
  const isLiked = useCallback(
    (id: string) => state.likes.some(l => l.id === id),
    [state.likes]
  );

  const getBookmarks = () => state.bookmarks;

  const downloadContent = useCallback(async (content: AudioContent) => {
    if (!user?.uid) return;

    try {
      // fall back to audioUrl when audioKey is not present
      const url = content.audioKey ? await getAudioUrl(content.audioKey) : (content as any).audioUrl;
      if (!url) throw new Error('No audio URL available for download');

      const { uri } = await ReactNativeBlobUtil.config({
        fileCache: true,
        appendExt: 'mp3',
      }).fetch('GET', url);

      const localPath = uri;
      const downloadedContent: DownloadedContent = {
        ...content,
        localPath,
        downloadedAt: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        downloadedContent: [...prev.downloadedContent, downloadedContent],
      }));

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        downloadedContent: arrayUnion({ id: content.id, localPath, downloadedAt: downloadedContent.downloadedAt }),
      });
    } catch (error) {
      console.error('Download error:', error);
      throw new Error(`Failed to download content: ${(error as Error).message}`);
    }
  }, [user?.uid]);

  const getDownloadedContent = () => state.downloadedContent;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    unsubscribers.push(
      subscribeToCollection(COLLECTIONS.PODCASTS, (data) => setState(prev => ({ ...prev, podcasts: data.filter(p => p.isPublished) })),
        [['isPublished', '==', true]], 'createdAt', 'desc')
    );
    unsubscribers.push(
      subscribeToCollection(COLLECTIONS.AUDIOBOOKS, (data) => setState(prev => ({ ...prev, audiobooks: data.filter(a => a.isPublished) })),
        [['isPublished', '==', true]], 'createdAt', 'desc')
    );
    unsubscribers.push(
      subscribeToCollection(COLLECTIONS.PLAYLISTS, (data) => setState(prev => ({ ...prev, playlists: data.filter(p => p.isPublic) })),
        [['isPublic', '==', true]], 'createdAt', 'desc')
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  return (
    <DataContext.Provider
      value={{
        ...state,
        refreshData: fetchData,
        getAudioContent,
        toggleBookmark,
        getBookmarks,
        // expose like helpers
        toggleLike,
        isLiked,
        downloadContent,
        getDownloadedContent,
        // placeholders to keep type compatibility
        createPlaylist: async () => {},
        addToPlaylist: async () => {},
        removeFromPlaylist: async () => {},
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};