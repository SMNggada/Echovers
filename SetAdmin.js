import { auth, firestore } from '../config/firebase';

const setAdminRole = async (userId) => {
  try {
    const userRef = firestore().collection('users').doc(userId);
    await userRef.set(
      {
        id: userId,
        name: 'Smark',
        email: 'billioniardotcom112@gmail.com',
        role: 'admin',
        createdAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`[SetAdmin] Admin role set for user: ${userId}`);
  } catch (error) {
    console.error('[SetAdmin] Error setting admin role:', error);
  }
};

// Call this with the UID of a signed-in user
setAdminRole('2AfJFnJYXscdpW1CYyJsM05OF572'); // Replace with actual UID