import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "trive-4073d.firebaseapp.com",
  projectId: "trive-4073d",
  storageBucket: "trive-4073d.firebasestorage.app",
  messagingSenderId: "115600453835",
  appId: "1:115600453835:web:2bc898d113db77396b2b4e",
  measurementId: "G-WDD3S30GMS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;