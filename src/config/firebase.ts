/**
 * Firebase Configuration and Initialization
 * 
 * Initializes Firebase app with modular SDK (v9+) for optimal tree-shaking.
 * Exports auth and db instances for use throughout the application.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { firebaseCredentials } from './firebase-credentials';

/**
 * Firebase configuration
 * Uses hardcoded credentials for production (safe - protected by Firestore rules)
 * Uses environment variables for development
 */
const firebaseConfig = import.meta.env.DEV ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} : firebaseCredentials;

/**
 * Validates that all required Firebase config values are present
 * Only runs in development mode
 */
const validateConfig = (): void => {
  if (!import.meta.env.DEV) return; // Skip validation in production

  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ] as const;

  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field] || firebaseConfig[field] === `your-${field.toLowerCase()}-here`
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing Firebase configuration: ${missingFields.join(', ')}. ` +
      'Please check your .env.local file and ensure all VITE_FIREBASE_* variables are set.'
    );
  }
};

// Validate configuration on module load (dev only)
validateConfig();

/**
 * Firebase app instance
 * Initialized once and reused throughout the application
 */
export const app: FirebaseApp = initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance
 * Used for Google Sign-In and user authentication
 */
export const auth: Auth = getAuth(app);

/**
 * Firestore database instance
 * Used for all financial data storage and real-time sync
 */
export const db: Firestore = getFirestore(app);

/**
 * Enable offline persistence with IndexedDB for PWA support
 * Allows the app to work offline by caching Firestore data locally
 * Automatically syncs changes when back online
 */
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('✅ Firestore offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn(
        'Firestore persistence failed: Multiple tabs open. ' +
        'Persistence can only be enabled in one tab at a time.'
      );
    } else if (err.code === 'unimplemented') {
      // Browser doesn't support IndexedDB persistence
      console.warn(
        'Firestore persistence failed: Browser does not support offline persistence.'
      );
    } else {
      // Unexpected error
      console.error('Firestore persistence error:', err);
    }
  });
