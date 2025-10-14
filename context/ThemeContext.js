import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define color schemes using color psychology principles
// Green: Growth, harmony, freshness (primary brand color)
// Purple: Creativity, wisdom, quality (secondary accent)
// Blue: Trust, peace, loyalty (tertiary accent)
// Orange: Energy, enthusiasm (call to action)

const lightTheme = {
  mode: 'light',
  // Primary colors
  primary: '#1DB954', // Spotify green - energetic, fresh
  primaryDark: '#14833b',
  primaryLight: '#3dd771',
  
  // Secondary colors
  secondary: '#7b68ee', // Slate blue - creative, calming
  secondaryDark: '#5a4bbf',
  secondaryLight: '#9c8df2',
  
  // Accent colors
  accent: '#ff7f50', // Coral - energetic, engaging
  
  // Background colors
  background: '#ffffff',
  card: '#f8f8f8',
  cardElevated: '#ffffff',
  
  // Text colors
  text: '#121212',
  textSecondary: '#555555',
  textMuted: '#888888',
  
  // UI elements
  border: '#e0e0e0',
  divider: '#f0f0f0',
  icon: '#555555',
  iconActive: '#1DB954',
  
  // Status colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Player colors
  playerBackground: '#ffffff',
  playerText: '#121212',
  playerControls: '#1DB954',
  
  // Navigation
  tabBar: '#ffffff',
  tabBarBorder: '#f0f0f0',
  tabBarActive: '#1DB954',
  tabBarInactive: '#888888',
};

const darkTheme = {
  mode: 'dark',
  // Primary colors
  primary: '#1DB954', // Keep brand green consistent
  primaryDark: '#14833b',
  primaryLight: '#3dd771',
  
  // Secondary colors
  secondary: '#9370DB', // Medium purple - slightly lighter for dark mode
  secondaryDark: '#7d5fd6',
  secondaryLight: '#b08fe3',
  
  // Accent colors
  accent: '#ff7f50', // Coral - energetic, engaging
  
  // Background colors
  background: '#121212', // Spotify dark
  card: '#1e1e1e',
  cardElevated: '#282828',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  textMuted: '#808080',
  
  // UI elements
  border: '#333333',
  divider: '#2a2a2a',
  icon: '#b3b3b3',
  iconActive: '#1DB954',
  
  // Status colors
  success: '#81c784',
  warning: '#ffb74d',
  error: '#e57373',
  info: '#64b5f6',
  
  // Player colors
  playerBackground: '#282828',
  playerText: '#ffffff',
  playerControls: '#1DB954',
  
  // Navigation
  tabBar: '#121212',
  tabBarBorder: '#333333',
  tabBarActive: '#1DB954',
  tabBarInactive: '#b3b3b3',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference or use system default
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme === 'dark' ? darkTheme : lightTheme);
        } else {
          // Use system preference as default
          const colorScheme = Appearance.getColorScheme();
          setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only change if user hasn't explicitly set a preference
      AsyncStorage.getItem('theme').then(savedTheme => {
        if (!savedTheme) {
          setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
        }
      });
    });

    return () => subscription.remove();
  }, []);

  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = theme.mode === 'light' ? darkTheme : lightTheme;
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme.mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Set specific theme
  const setThemeMode = async (mode) => {
    const newTheme = mode === 'dark' ? darkTheme : lightTheme;
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};