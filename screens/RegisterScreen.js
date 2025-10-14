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
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  
  const { register, isLoading, googleSignIn, facebookSignIn } = useAuth();
  const navigation = useNavigation();

  const validateForm = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return false;
    }
    
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      await register(email, password, name);
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
      );
    } catch (error) {
      // Error is handled in AuthContext
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={goToLogin}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <Image
              source={{ uri: 'https://api.a0.dev/assets/image?text=IQspace&aspect=1:1' }}
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join the IQspace audio community</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  isNameFocused && styles.inputFocused
                ]}
                placeholder="Your full name"
                value={name}
                onChangeText={setName}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  isEmailFocused && styles.inputFocused
                ]}
                placeholder="Your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  isPasswordFocused && styles.inputFocused
                ]}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <Text style={styles.passwordHint}>
                Must be at least 8 characters
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  isConfirmPasswordFocused && styles.inputFocused
                ]}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => setIsConfirmPasswordFocused(false)}
              />
            </View>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={googleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.socialButtonText}>Sign up with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.facebookButton]} 
              onPress={facebookSignIn}
              disabled={isLoading}
            >
              <Text style={[styles.socialButtonText, styles.facebookButtonText]}>
                Sign up with Facebook
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={styles.loginButton}>Sign In</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.termsText}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4361ee',
    fontWeight: '600',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
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
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
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
    marginBottom: 16,
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
  passwordHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  registerButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 10,
  },
  socialButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  socialButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  facebookButtonText: {
    color: '#fff',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginButton: {
    color: '#4361ee',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  }
});

export default RegisterScreen;