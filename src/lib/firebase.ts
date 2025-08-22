
'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "shadows-of-gotham",
  "appId": "1:711722841714:web:b43b5de58e834df2c6f4eb",
  "storageBucket": "shadows-of-gotham.firebasestorage.app",
  "apiKey": "AIzaSyDsiKBnj84K0spBPXHyv9pW8AaYERuCz0o",
  "authDomain": "shadows-of-gotham.firebaseapp.com",
  "messagingSenderId": "711722841714",
  "measurementId": ""
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
