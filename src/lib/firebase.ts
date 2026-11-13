import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Configure Google Auth Provider with Google Chat and profile scopes
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/chat.spaces');
googleAuthProvider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/chat.messages');
googleAuthProvider.addScope('https://www.googleapis.com/auth/chat.messages.create');
googleAuthProvider.addScope('https://www.googleapis.com/auth/chat.memberships');
export const googleProvider = googleAuthProvider;

// Configure Firestore with persistent local cache for offline access and automatic sync
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (e) {
  // If already initialized, retrieve existing instance
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;

// Test connection on boot per Firebase skill guidelines
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is operating in offline cache mode.');
    }
    return false;
  }
}

// Automatically probe connection without throwing
if (typeof window !== 'undefined') {
  validateFirestoreConnection().catch(() => {});
}

export { signInWithPopup, signOut, GoogleAuthProvider };
export default app;
