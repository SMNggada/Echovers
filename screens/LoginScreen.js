import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const { login, isAuthenticated, error: authError, initializing } = useAuth();
  const navigation = useNavigation();
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  }, [isAuthenticated, navigation]);

  const handleLogin = async () => {
    try {
      setLoginError(null);
      await login();
    } catch (err) {
      console.error('[LoginScreen] Login error:', err);
      setLoginError(err.message || 'Failed to sign in. Please try again.');
    }
  };

  if (initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Echovers</Text>
      {authError && <Text style={styles.error}>{authError}</Text>}
      {loginError && <Text style={styles.error}>{loginError}</Text>}
      <Button title="Sign In with Google" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default LoginScreen;