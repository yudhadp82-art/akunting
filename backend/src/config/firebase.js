const admin = require("firebase-admin");
const { initializeApp: initializeClientApp } = require("firebase/app");
const { getFirestore: getClientFirestore } = require("firebase/firestore");
const { getAuth: getClientAuth } = require("firebase/auth");

let db, auth;
let adminApp = null;

// Initialize Firebase Admin SDK for Backend (Bypasses security rules)
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountKey) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    }, 'admin-app'); // Use a name to avoid conflicts
    db = adminApp.firestore();
    auth = adminApp.auth();
    console.log("🔥 Firebase Admin initialized successfully (Bypassing rules)");
  } catch (error) {
    console.error("❌ Firebase Admin failed to initialize:", error.message);
  }
}

// Fallback to Client SDK if Admin is not configured or fails
if (!db) {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };

  try {
    const clientApp = initializeClientApp(firebaseConfig);
    db = getClientFirestore(clientApp);
    auth = getClientAuth(clientApp);
    console.log("🔌 Firebase Client SDK initialized (Security rules apply)");
  } catch (error) {
    console.error("❌ Firebase Client SDK failed to initialize:", error.message);
  }
}

module.exports = { db, auth, admin, adminApp };
