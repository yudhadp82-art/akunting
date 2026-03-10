const admin = require("firebase-admin");
const { initializeApp: initializeClientApp } = require("firebase/app");
const { getFirestore: getClientFirestore } = require("firebase/firestore");
const { getAuth: getClientAuth } = require("firebase/auth");

let app, db, auth;

// Use Firebase Admin for Backend (Bypasses security rules)
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    auth = admin.auth();
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization failed, falling back to Client SDK:", error.message);
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

  const clientApp = initializeClientApp(firebaseConfig);
  db = getClientFirestore(clientApp);
  auth = getClientAuth(clientApp);
  console.log("Firebase Client SDK initialized (Security rules apply)");
}

module.exports = { app, db, auth, admin };
