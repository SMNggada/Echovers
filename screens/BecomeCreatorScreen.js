import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { submitCreatorApplication, getCreatorApplicationStatus } from '../services/Api';

const BecomeCreatorScreen = ({ navigation }) => {
  const { user, initializing, userRole, userProfile } = useAuth();
  const [bio, setBio] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);

  useEffect(() => {
    if (user) {
      getCreatorApplicationStatus(user.uid)
        .then((app) => {
          if (app) {
            setRequestStatus(app.status);
            console.log('[BecomeCreatorScreen] Application status:', app.status);
          }
        })
        .catch((err) => console.error('[BecomeCreatorScreen] Error fetching status:', err));
    }
  }, [user]);

  const handleCreatorRequest = async () => {
    if (!user) return alert('Please sign in first.');
    if (!bio.trim()) return alert('Bio is required.');
    try {
      setIsLoading(true);
      const data = { bio: bio.trim(), portfolio: portfolio.trim(), email: user.email || 'unknown@example.com' };
      await submitCreatorApplication(user.uid, data);
      setRequestStatus('pending');
      alert('Creator request submitted successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('[BecomeCreatorScreen] Error submitting request:', error);
      alert(error.message || 'Failed to submit creator request');
    } finally {
      setIsLoading(false);
    }
  };

  if (initializing) return <View style={styles.centered}><ActivityIndicator size="large" color="#1DB954" /></View>;
  if (!user) return (
      <View style={styles.centered}>
      <Text style={styles.statusText}>Sign in to request creator access.</Text>
      <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.signInText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  if (userRole === 'creator') return (
      <View style={styles.centered}>
      <Text style={styles.statusText}>You are already a creator!</Text>
      <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.signInText}>Back to Profile</Text>
      </TouchableOpacity>
      </View>
    );
  if (requestStatus === 'pending' || userProfile?.hasAppliedForCreator) return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Your creator request is pending review.</Text>
      </View>
    );
  if (requestStatus === 'approved') return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Your creator request has been approved!</Text>
      <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.signInText}>Go to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  if (requestStatus === 'rejected') return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Your creator request was rejected.</Text>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => setRequestStatus(null)}>
        <Text style={styles.cancelText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Become a Creator</Text>
      <Text style={styles.subheader}>Submit your application to become a verified creator and start sharing your content.</Text>
      <Text style={styles.label}>Your Bio</Text>
      <TextInput
        style={[styles.text, styles.textArea]}
        multiline
        value={bio}
        onChangeText={setBio}
        placeholder="Tell us about yourself and your content"
      />
      <Text style={styles.label}>Portfolio Link (Optional)</Text>
      <TextInput
        style={styles.text}
        value={portfolio}
        onChangeText={setPortfolio}
        placeholder="Link to your portfolio or previous work"
      />
      <TouchableOpacity style={styles.button} onPress={handleCreatorRequest} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Request</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subheader: { fontSize: 16, color: '#666', marginBottom: 16 },
  label: { fontWeight: '600', marginTop: 16, color: '#333' },
  text: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginTop: 6, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { marginTop: 32, backgroundColor: '#1DB954', borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statusText: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 16 },
  signInButton: { backgroundColor: '#1DB954', borderRadius: 30, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#FF3B30', borderRadius: 30, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  signInText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default BecomeCreatorScreen;