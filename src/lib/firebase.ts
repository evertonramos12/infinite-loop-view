
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDm4JMutIr3YhP8_eloPGju2yWYgz_XDcI",
  authDomain: "videos-16c3c.firebaseapp.com",
  projectId: "videos-16c3c",
  storageBucket: "videos-16c3c.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "1087744099662",
  appId: "1:1087744099662:web:36940fe1055c1e04190a1f",
  measurementId: "G-D36NDJVVPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
