
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBpLAsjjR-Vj1MMIg_35aTnk-qon6AK51A",
  authDomain: "raja-kumari-multi-speciality.firebaseapp.com",
  projectId: "raja-kumari-multi-speciality",
  storageBucket: "raja-kumari-multi-speciality.firebasestorage.app",
  messagingSenderId: "679027872066",
  appId: "1:679027872066:web:5c403f782406ecc86c38db",
  measurementId: "G-8871NN9HRW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
