
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBTR-3XjPLDyp5fW761YF04WSoWoPwyvD0",
  authDomain: "video2-93f63.firebaseapp.com",
  projectId: "video2-93f63",
  storageBucket: "video2-93f63.appspot.com",
  messagingSenderId: "269164360804",
  appId: "1:269164360804:web:3c65e98064150f9fcc1b71",
  measurementId: "G-VSDKLZWLWW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence (optional)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Multiple tabs open, offline persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.error('The current browser does not support offline persistence.');
    }
  });
} catch (error) {
  console.error('Error enabling offline persistence:', error);
}

export default app;
