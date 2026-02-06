import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCYYrVwOSiIGbxosUBAsEmaSgYGoBrchUw",
  authDomain: "lake9-dev.firebaseapp.com",
  projectId: "lake9-dev",
  storageBucket: "lake9-dev.firebasestorage.app",
  messagingSenderId: "839377096508",
  appId: "1:839377096508:web:85509167012e4ca3871839",
  measurementId: "G-NGNZVEHRXR"
};

// Initialize Firebase only once
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// TODO: Optional - Add Firebase App Check for extra security
// See docs/FIREBASE_APP_CHECK_SETUP.md for instructions

export { app, firebaseConfig };

