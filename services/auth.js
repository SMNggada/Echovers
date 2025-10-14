import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

GoogleSignin.configure({
  webClientId: '714622669418-5bgips4ncag7onkq6er4oanpcdonnfc9.apps.googleusercontent.com',
});

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.idToken;
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const auth = getAuth();
    return await signInWithCredential(auth, googleCredential);
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
};