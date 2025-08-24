'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  "projectId": "shadows-of-gotham",
  "appId": "1:711722841714:web:b43b5de58e834df2c6f4eb",
  "storageBucket": "shadows-of-gotham.appspot.com",
  "apiKey": "AIzaSyDsiKBnj84K0spBPXHyv9pW8AaYERuCz0o",
  "authDomain": "shadows-of-gotham.firebaseapp.com",
  "messagingSenderId": "711722841714",
  "measurementId": "G-S6V0G6J85V"
};

function getAppInstance(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getAppAuth() {
    return getAuth(getAppInstance());
}

export function getAppFirestore() {
    return getFirestore(getAppInstance());
}

export function getAppStorage() {
    return getStorage(getAppInstance());
}
