import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getCreatorApplicationStatus } from '../services/Api';
import {
  Bookmark,
  User as UserIcon,
  Clock,
  Settings as SettingsIcon,
  LogOut,
  Star,
  Upload,
  Download as DownloadIcon,
  Plus as PlaylistIcon,
} from 'lucide-react-native';
import { useData } from '../context/DataContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, userRole, userProfile, syncUserProfile, initializing, logout } = useAuth();
  const { podcasts, audiobooks, bookmarks } = useData();
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getCreatorApplicationStatus(user.uid)
        .then((application) => {
          setApplicationStatus(application ? application.status : null);
          syncUserProfile(user);
        })
        .catch((error) => console.error('[ProfileScreen] Error fetching creator application status:', error));
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
    } catch (e) {
      console.error('[ProfileScreen] Logout error:', e);
    }
  };

  const handleOptionPress = (screen: string) => navigation.navigate(screen);

  const options = [
    { id: 'bookmarks', title: 'Bookmarks', icon: Bookmark, screen: 'Bookmarks' },
    { id: 'downloads', title: 'Downloads', icon: DownloadIcon, screen: 'Downloads' },
    { id: 'playlist', title: 'Playlist', icon: PlaylistIcon, screen: 'Playlist' },
    { id: 'subscriptions', title: 'Subscriptions', icon: UserIcon, screen: 'Subscriptions' },
    { id: 'history', title: 'Listening History', icon: Clock, screen: 'History' },
    { id: 'settings', title: 'Settings', icon: SettingsIcon, screen: 'Settings' },
    ...(userRole === 'admin' ? [{ id: 'admin', title: 'Admin Panel', icon: UserIcon, screen: 'Admin' }] : []),
    ...(userRole === 'creator' ? [{ id: 'manage-content', title: 'Manage Content', icon: Upload, screen: 'ManageContentScreen' }] : []),
  ];

  if (initializing) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#1DB954" /></View>;
  }

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Please sign in to view your profile.</Text>
        <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.signInText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.profileInfo}>
          <Image source={{ uri: userProfile?.photo || user.photoURL || 'https://api.a0.dev/assets/image?text=User&aspect=1:1' }} style={styles.avatar} />
          <Text style={styles.name}>{userProfile?.name || user.displayName || 'Echovers User'}</Text>
          <Text style={styles.email}>{userProfile?.email || user.email || 'N/A'}</Text>
          <Text style={styles.role}>{userRole === 'admin' ? 'Admin' : userRole === 'creator' ? 'Creator' : 'Listener'}</Text>
          {userRole !== 'creator' && userRole !== 'admin' && (applicationStatus === 'pending' || userProfile?.hasAppliedForCreator) ? (
            <View style={styles.pendingContainer}><Text style={styles.pendingText}>Creator Application Pending</Text></View>
          ) : userRole !== 'creator' && userRole !== 'admin' ? (
            <TouchableOpacity style={styles.becomeCreatorButton} onPress={() => handleOptionPress('BecomeCreator')}>
              <Star size={24} color="#fff" /><Text style={styles.becomeCreatorText}>Become a Creator</Text>
            </TouchableOpacity>
          ) : userRole === 'creator' ? (
            <TouchableOpacity style={styles.uploadButton} onPress={() => handleOptionPress('CreateAudioContentScreen')}>
              <Upload size={24} color="#fff" /><Text style={styles.uploadText}>Upload Content</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.menu}>
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <TouchableOpacity key={opt.id} style={styles.menuItem} onPress={() => handleOptionPress(opt.screen)}>
                <Icon size={24} color="#333" />
                <Text style={styles.menuText}>{opt.title}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <LogOut size={24} color="#333" />
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </View>
        {bookmarks.length > 0 && (
          <View style={styles.bookmarkPreview}>
            <Text style={styles.previewTitle}>Recent Bookmarks</Text>
            {bookmarks.slice(0, 3).map((bookmark) => {
              const content = podcasts.find(p => p.id === bookmark.itemId) || audiobooks.find(a => a.id === bookmark.itemId);
              return <Text key={bookmark.id} style={styles.previewItem}>{content?.title || `Bookmark ${bookmark.id}`}</Text>;
            })}
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  profileInfo: { alignItems: 'center', paddingVertical: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 8 },
  role: { fontSize: 14, color: '#1DB954', fontWeight: '600', marginBottom: 16 },
  becomeCreatorButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1DB954', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 8 },
  becomeCreatorText: { fontSize: 16, color: '#fff', marginLeft: 8, fontWeight: '600' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1DB954', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 8 },
  uploadText: { fontSize: 16, color: '#fff', marginLeft: 8, fontWeight: '600' },
  pendingContainer: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, marginTop: 8 },
  pendingText: { fontSize: 16, color: '#666', fontWeight: '600' },
  menu: { marginTop: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  menuText: { fontSize: 16, color: '#333', marginLeft: 16 },
  errorText: { fontSize: 16, color: '#666' },
  signInButton: { backgroundColor: '#1DB954', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, marginTop: 16 },
  signInText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  bottomPadding: { height: 100 },
  bookmarkPreview: { padding: 16 },
  previewTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  previewItem: { fontSize: 14, color: '#666', marginBottom: 4 },
});