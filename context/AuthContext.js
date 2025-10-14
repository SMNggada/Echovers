import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from '@react-native-firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithCredential, signOut } from '@react-native-firebase/auth';
import { db } from '../config/firebase'; // Import db (getFirestore instance)

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState('listener');

  const syncUserProfile = async (user, retries = 3) => {
    if (!user || !user.uid) {
      console.warn('[AuthContext] Invalid user object:', user);
      return;
    }

    let attempt = 0;
    while (attempt < retries) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          const newUserProfile = {
            userId: user.uid,
            name: user.displayName || 'Anonymous',
            email: user.email || '',
            photo: user.photoURL || '',
            role: 'listener',
            hasAppliedForCreator: false,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, newUserProfile);
          setUserProfile(newUserProfile);
          setUserRole('listener');
          console.log('[AuthContext] Created new user profile:', newUserProfile);
        } else {
          const existingProfile = docSnap.data();
          if (!existingProfile) {
            throw new Error('Firestore returned empty data for existing document');
          }
          const updates = {};
          if (!existingProfile.userId) {
            updates.userId = user.uid;
          }
          if (user.email && existingProfile.email !== user.email) {
            updates.email = user.email;
          }
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = serverTimestamp();
            await updateDoc(userRef, updates);
            console.log('[AuthContext] Updated profile with missing fields:', { userId: user.uid, updates });
          }
          setUserProfile({ ...existingProfile, ...updates });
          setUserRole(existingProfile.role || 'listener');
          console.log('[AuthContext] Synced profile:', { userId: user.uid, role: existingProfile.role });
        }
        return;
      } catch (err) {
        attempt++;
        console.error(`[AuthContext] Failed to sync Firestore profile (attempt ${attempt}/${retries}):`, {
          message: err.message,
          code: err.code,
          stack: err.stack,
        });
        if (attempt >= retries) {
          setError(`Failed to sync profile after ${retries} attempts: ${err.message || 'Unknown error'}`);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  useEffect(() => {
    if (user) {
      console.log('[AuthContext] Setting up Firestore listener for user:', user.uid);
      let retryCount = 0;
      const maxRetries = 3;
      const setupListener = () => {
        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              console.log('[AuthContext] Real-time profile update:', {
                userId: user.uid,
                role: data.role,
                email: data.email,
                hasAppliedForCreator: data.hasAppliedForCreator,
                updatedAt: data.updatedAt?.toDate()?.toISOString(),
              });
              setUserProfile({ ...data });
              setUserRole(data.role || 'listener');
              retryCount = 0; // Reset retry count on success
            } else {
              console.warn('[AuthContext] User document does not exist or is empty:', user.uid);
              syncUserProfile(user);
            }
          },
          (err) => {
            console.error('[AuthContext] Firestore listener error for user:', user.uid, {
              message: err.message,
              code: err.code,
              stack: err.stack,
            });
            setError(`Firestore listener failed: ${err.message}`);
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`[AuthContext] Retrying listener setup (${retryCount}/${maxRetries})`);
              setTimeout(setupListener, 1000);
            }
          }
        );
        return unsubscribe;
      };
      const unsubscribe = setupListener();
      return () => {
        console.log('[AuthContext] Unsubscribing listener for user:', user.uid);
        unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        console.log('[AuthContext] Configuring Google Sign-In...');
        await GoogleSignin.configure({
          webClientId: '714622669418-5bgips4ncag7onkq6er4oanpcdonnfc9.apps.googleusercontent.com',
          iosClientId: '',
          offlineAccess: true,
          forceCodeForRefreshToken: true,
          scopes: ['profile', 'email', 'openid'],
        });
        console.log('[AuthContext] Google Sign-In configured successfully');
      } catch (err) {
        console.error('[AuthContext] Google SignIn configuration error:', {
          message: err.message,
          code: err.code,
          stack: err.stack,
        });
        setError(`Configuration failed: ${err.message || 'Unknown error'}`);
      }
    };

    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = authInstance.onAuthStateChanged(async (firebaseUser) => {
      console.log('[AuthContext] Firebase auth state changed:', firebaseUser ? firebaseUser.uid : null);
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
        await syncUserProfile(firebaseUser);
        setError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserProfile(null);
        setUserRole('listener');
        setError(null);
      }
      setInitializing(false);
    });

    return () => {
      console.log('[AuthContext] Unsubscribing auth state listener');
      unsubscribe();
    };
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (!isSignedIn) {
        console.log('[AuthContext] No user signed in with Google');
        return;
      }
      const userInfo = await GoogleSignin.signInSilently();
      console.log('[AuthContext] Silent sign-in userInfo:', JSON.stringify(userInfo, null, 2));
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) {
        throw new Error('No ID token received from silent Google Sign-In');
      }
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await signInWithCredential(getAuth(), googleCredential);
      console.log('[AuthContext] Silent sign-in successful:', firebaseUserCredential.user.uid);
      setToken(idToken);
    } catch (err) {
      console.error('[AuthContext] Silent Sign-In failed:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      setError(`Silent sign-in failed: ${err.message || 'Unknown error'}`);
    }
  }, []);

  const login = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      console.log('[AuthContext] Google Sign-In userInfo:', JSON.stringify(userInfo, null, 2));
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await signInWithCredential(getAuth(), googleCredential);
      console.log('[AuthContext] Firebase Sign-In successful:', firebaseUserCredential.user.uid);
      setToken(idToken);
      setError(null);
    } catch (err) {
      console.error('[AuthContext] Google Sign-In Error:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      const errorMessage = err.message || 'Unknown sign-in error';
      setError(`Sign-in failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('[AuthContext] Logging out...');
      await GoogleSignin.signOut();
      await signOut(getAuth());
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setUserProfile(null);
      setUserRole('listener');
      console.log('[AuthContext] Logout successful');
    } catch (err) {
      console.error('[AuthContext] Logout Error:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      setError(`Logout failed: ${err.message || 'Unknown error'}`);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    initializing,
    error,
    login,
    logout,
    userProfile,
    userRole,
    syncUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log('[useAuth] Context:', {
    user: context.user ? context.user.uid : null,
    isAuthenticated: context.isAuthenticated,
    initializing: context.initializing,
    error: context.error,
    userRole: context.userRole,
  });
  return context;
};