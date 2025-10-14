// src/navigation/Navigation.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { useAuth, AuthProvider } from './context/AuthContext';

// Screens
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import DiscoverScreen from './screens/DiscoveryScreen';
import LoginScreen from './screens/LoginScreen';
import BecomeCreatorScreen from './screens/BecomeCreatorScreen';
import CreateAudioContentScreen from './screens/CreateAudioContentScreen';
import ContentDetailsScreen from './screens/ContentDetailsScreen';
import SearchScreen from './screens/SearchScreen';
import NotificationScreen from './screens/NotificationScreen';
import HistoryScreen from './screens/HistoryScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import SubscriptionsScreen from './screens/SubscriptionsScreen';
import AdminScreen from './screens/AdminScreen';
import SettingsScreen from './screens/SettingsScreen';
import ManageContentScreen from './screens/ManageContentScreen';
import EditContentScreen from './screens/EditContentScreen';
import MiniPlayer from './components/MiniPlayer';
import DownloadsScreen from './screens/DownloadsScreen'
import PlaylistScreen from './screens/PlaylistScreen';
// Lucide Icons
import { Home, Compass, User } from 'lucide-react-native';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.3,
          borderTopColor: '#ccc',
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Home color={color} size={size} />;
            case 'Discover':
              return <Compass color={color} size={size} />;
            case 'Profile':
              return <User color={color} size={size} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainTabsWithMiniPlayer() {
  return (
    <View style={{ flex: 1 }}>
      <MainTabs />
      <MiniPlayer />
    </View>
  );
}

function AppNavigator() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabsWithMiniPlayer} />
          <Stack.Screen name="BecomeCreator" component={BecomeCreatorScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="CreateAudioContentScreen" component={CreateAudioContentScreen} />
          <Stack.Screen name="ContentDetails" component={ContentDetailsScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
          <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ManageContentScreen" component={ManageContentScreen} />
          <Stack.Screen name="EditContentScreen" component={EditContentScreen} />
          <Stack.Screen name="Downloads" component={DownloadsScreen} />
          <Stack.Screen name="Playlist" component={PlaylistScreen} />
        </>
      ) : (
        <Stack.Screen name="SignIn" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
