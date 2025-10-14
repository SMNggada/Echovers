import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getCreatorApplications, approveCreatorApplication, updateCreatorApplication } from '../services/Api';

const AdminScreen = ({ navigation }) => {
  const { user, userRole, initializing } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (user && userRole === 'admin') fetchApplications();
  }, [user, userRole]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const apps = await getCreatorApplications();
      console.log('[AdminScreen] Fetched applications:', apps);
      setApplications(apps);
    } catch (error) {
      Alert.alert('Error', 'Failed to load creator applications.');
      console.error('[AdminScreen] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

 const handleApprove = async (applicationId, applicantUserId) => {
  if (applicantUserId === user.uid) {
    Alert.alert('Error', 'Cannot approve your own application.');
    console.error('[AdminScreen] Attempted to approve own application:', user.uid);
    return;
  }
  try {
    setProcessingId(applicationId);
    await approveCreatorApplication(applicationId, applicantUserId, user.uid);
    if (applicantUserId === user.uid) {
      await syncUserProfile(user); // Force sync for the current user
    }
    Alert.alert('Success', 'Creator application approved!');
    setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    console.log(`[AdminScreen] Approved application ${applicationId} for user ${applicantUserId}`);
  } catch (error) {
    Alert.alert('Error', `Failed to approve creator application: ${error.message}`);
    console.error('[AdminScreen] Approve error:', error);
  } finally {
    setProcessingId(null);
  }
};

  const handleReject = async (applicationId, applicantUserId) => {
    if (applicantUserId === user.uid) {
      Alert.alert('Error', 'Cannot reject your own application.');
      console.error('[AdminScreen] Attempted to reject own application:', user.uid);
      return;
    }
    try {
      setProcessingId(applicationId);
      await updateCreatorApplication(applicationId, { status: 'rejected' }, user.uid);
      Alert.alert('Success', 'Creator application rejected.');
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
      console.log(`[AdminScreen] Rejected application ${applicationId} for user ${applicantUserId}`);
    } catch (error) {
      Alert.alert('Error', `Failed to reject creator application: ${error.message}`);
      console.error('[AdminScreen] Reject error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (initializing) return <View style={styles.centered}><ActivityIndicator size="large" color="#1DB954" /></View>;
  if (!user) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>Please sign in to access this page.</Text>
      <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.signInText}>Go to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
  if (userRole !== 'admin') return <View style={styles.centered}><Text style={styles.errorText}>Access restricted to admins only.</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin: Creator Applications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" />
      ) : applications.length === 0 ? (
        <Text style={styles.noAppsText}>No pending creator applications.</Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.applicationItem}>
              <Text style={styles.appText}>User ID: {item.userId}</Text>
              <Text style={styles.appText}>Email: {item.email || 'N/A'}</Text>
              <Text style={styles.appText}>Bio: {item.bio}</Text>
              <Text style={styles.appText}>Submitted: {item.submittedAt?.toDate().toLocaleString() || 'N/A'}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.approveButton]}
                  onPress={() => handleApprove(item.id, item.userId)}
                  disabled={processingId === item.id}
                >
                  {processingId === item.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Approve</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleReject(item.id, item.userId)}
                  disabled={processingId === item.id}
                >
                  {processingId === item.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reject</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  errorText: { fontSize: 16, color: '#666', marginBottom: 16 },
  noAppsText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  applicationItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 8 },
  appText: { fontSize: 14, color: '#333', marginBottom: 4 },
  buttonContainer: { flexDirection: 'row', marginTop: 8 },
  button: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  approveButton: { backgroundColor: '#1DB954' },
  rejectButton: { backgroundColor: '#FF3B30' },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  signInButton: { backgroundColor: '#1DB954', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' },
  signInText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});

export default AdminScreen;