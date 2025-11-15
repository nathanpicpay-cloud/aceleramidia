import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseInstances {
    app: FirebaseApp;
    db: Firestore;
    storage: FirebaseStorage;
}

export function initializeFirebase(config: object): FirebaseInstances | null {
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    console.log("Firebase initialized successfully.");
    return { app, db, storage };
  } catch (error) {
    console.error("Failed to initialize Firebase with provided config.", error);
    alert(`Failed to initialize Firebase. Please check your configuration.\nError: ${(error as Error).message}`);
    return null;
  }
}
