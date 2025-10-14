import { initializeApp } from '@react-native-firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, updateDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp,arrayUnion,arrayRemove, } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4TFTwaC2rhyMWKivCZLhKGMhuIOQk6uo",
  authDomain: "echovers-604ae.firebaseapp.com",
  projectId: "echovers-604ae",
  storageBucket: "echovers-604ae.appspot.com",
  messagingSenderId: "714622669418",
  appId: "1:714622669418:web:789139366a92ef7229f013",
  measurementId: "G-EG32JQZ5J3",
};

// Initialize Firebase if not already initialized
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const createDocument = async (collectionName, data, id = null) => {
  try {
    const colRef = collection(db, collectionName);
    const docRef = id ? doc(colRef, id) : doc(colRef);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    console.log(`Document created in ${collectionName}:`, docRef.id);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
};

export const getDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(`Fetched document from ${collectionName}:`, docSnap.data());
      return { id: docSnap.id, ...docSnap.data() };
    }
    console.log(`No document found in ${collectionName} with id:`, id);
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    console.log(`Document updated in ${collectionName}:`, id);
    return { id, ...data };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
};

export const getDocuments = async (
  collectionName,
  whereConditions = [],
  orderByField,
  orderDirection = 'asc',
  limitCount
) => {
  try {
    let q = collection(db, collectionName);
    if (whereConditions.length > 0) {
      q = query(q, ...whereConditions.map(([field, op, value]) => where(field, op, value)));
    }
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Fetched documents from ${collectionName}:`, documents);
    return documents;
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
};

export const subscribeToCollection = (
  collectionName,
  callback,
  whereConditions = [],
  orderByField,
  orderDirection = 'desc'
) => {
  try {
    let q = collection(db, collectionName);
    if (whereConditions.length > 0) {
      q = query(q, ...whereConditions.map(([field, op, value]) => where(field, op, value)));
    }
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Subscribed to ${collectionName}:`, documents);
      callback(documents);
    }, (error) => {
      console.error(`Subscription error for ${collectionName}:`, {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
    });
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
};
export { doc, collection, getDoc, setDoc, getDocs, updateDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp,   arrayUnion,
  arrayRemove, };
// For backward compatibility with existing code
export const firestore = {
  FieldValue: {
    serverTimestamp,
    arrayUnion,
    arrayRemove,
  },
};