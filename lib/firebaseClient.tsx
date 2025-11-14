import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// These will be populated from environment variables
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Firebase configuration is expected to be a JSON string in the environment variables
const firebaseConfigStr = process.env.FIREBASE_CONFIG;

if (firebaseConfigStr) {
  try {
    const firebaseConfig = JSON.parse(firebaseConfigStr);
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Failed to parse FIREBASE_CONFIG or initialize Firebase.", error);
    console.error("Please make sure FIREBASE_CONFIG is a valid JSON string with your project's credentials.");
  }
}

if (!app) {
  console.warn("Firebase configuration not found or is invalid. The application will run in a mock mode without database connectivity.");
  console.warn("To connect to Firebase, set the FIREBASE_CONFIG environment variable.");
}

export { db, storage };
