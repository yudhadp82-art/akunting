import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALP6_IalHi7wpZRs_t9rbFI02DbzX_2Ps",
  authDomain: "openai-d3057.firebaseapp.com",
  projectId: "openai-d3057",
  storageBucket: "openai-d3057.firebasestorage.app",
  messagingSenderId: "330210498699",
  appId: "1:330210498699:web:357b4e830ab486927f5c8e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
