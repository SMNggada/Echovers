import Navigation from './Navigation';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';

import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { PlayerProvider } from './context/PlayerContext';
import { MiniPlayer } from './components';
import { useState } from 'react';
import Player from './components/Player';
import { usePlayer } from './context/PlayerContext';
import {ThemeProvider} from './context/ThemeContext';
// Wrapper component to handle player state
function AppContent() {
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const { currentTrack } = usePlayer();
  
  return (
    <>
      <Navigation />
      
      {/* Mini Player */}
      {currentTrack && (
        <TouchableOpacity 
          style={styles.miniPlayerContainer}
          activeOpacity={1}
        >
          <MiniPlayer onPress={() => setShowFullPlayer(true)} />
        </TouchableOpacity>
      )}
      
      {/* Full-screen Player */}
      <Player 
        visible={showFullPlayer} 
        onClose={() => setShowFullPlayer(false)} 
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <SafeAreaProvider style={styles.container}>
      <AuthProvider>
        <DataProvider>
          <PlayerProvider>
            <Toaster />
            
            <AppContent />
          </PlayerProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  }
});