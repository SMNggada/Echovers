import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading } = useAuth();
  const navigation = useNavigation();

  const handleResetPassword = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={goToLogin}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContainer}>
            <Image
              source={{ uri: 'https://api.a0.dev/assets/image?text=Reset&aspect=1:1&seed=789' }}
              style={styles.image}
            />
            <Text style={styles.headerTitle}>Reset Password</Text>
            <Text style={styles.headerSubtitle}>
              {isSubmitted 
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive password reset instructions'}
            </Text>
          </View>

          {!isSubmitted ? (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[
                    styles.input,
                    isEmailFocused && styles.inputFocused
                  ]}
                  placeholder="Your registered email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>

              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                We've sent password reset instructions to {email}. Check your inbox and follow the link to reset your password.
              </Text>
              <TouchableOpacity 
                style={styles.returnButton} 
                onPress={goToLogin}
              >
                <Text style={styles.returnButtonText}>Return to Login</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>Didn't receive the email?</Text>
            <TouchableOpacity onPress={handleResetPassword} disabled={isLoading}>
              <Text style={styles.resendButton}>Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4361ee',
    fontWeight: '600',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  inputFocused: {
    borderColor: '#4361ee',
    backgroundColor: '#fff',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  helpText: {
    color: '#666',
    fontSize: 16,
  },
  resendButton: {
    color: '#4361ee',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  returnButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  returnButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;