import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4TFTwaC2rhyMWKivCZLhKGMhuIOQk6uo",
  authDomain: "echovers-604ae.firebaseapp.com",
  projectId: "echovers-604ae",
  storageBucket: "echovers-604ae.firebasestorage.app",
  messagingSenderId: "714622669418",
  appId: "1:714622669418:web:789139366a92ef7229f013",
  measurementId: "G-EG32JQZ5J3",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} else {
  app = getApp();
  console.log('Using existing Firebase app');
}

export { auth, firestore, firebaseConfig };