import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  projectId: 'lake9-dev',
  authDomain: 'lake9-dev.firebaseapp.com',
  storageBucket: 'lake9-dev.appspot.com',
  messagingSenderId: '839377096508',
  appId: '1:839377096508:web:your-app-id'
};

// Initialize Firebase only once
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app, firebaseConfig };
