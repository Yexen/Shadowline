
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  Auth,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, query, where, Firestore } from 'firebase/firestore';
import { app, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';


export type UserRole = 'head-writer' | 'writer' | 'reader';
export type UserStatus = 'approved' | 'pending' | 'rejected';

export interface Writer {
  id: string; // This will be the Firebase Auth UID
  name: string;
  email: string;
  avatarUrl: string;
  dataAiHint: string;
  role: UserRole;
  status: UserStatus;
}

let auth: Auth;
let db: Firestore;

const headWriterDefault = {
  id: 'head-writer-001',
  name: 'Yekta Jokar',
  email: 'yekta.kjs@gmail.com',
  password: 'LivFreya',
  avatarUrl: 'https://placehold.co/128x128.png',
  dataAiHint: 'female writer serious',
  role: 'head-writer' as UserRole,
  status: 'approved' as UserStatus,
};


export function useWriters() {
  const [writers, setWriters] = useState<Writer[]>([]);
  const [activeWriter, setActiveWriter] = useState<Writer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  // Lazy initialize Firebase services
  if (!auth) {
    auth = getAuth(app);
  }
  if (!db) {
    db = getFirestore(app);
  }
  
  const fetchAllUsers = useCallback(async () => {
    if (activeWriter?.role !== 'head-writer') {
        setWriters(activeWriter ? [activeWriter] : []);
        return;
    }
    const usersCollection = collection(db, "users");
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Writer));
    setWriters(userList);
  }, [activeWriter]);

  useEffect(() => {
    const bypassedUser = localStorage.getItem('gotham-bypassed-user');
    if (bypassedUser) {
        setActiveWriter(JSON.parse(bypassedUser));
        setIsLoaded(true);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<Writer, 'id'>;
           if (userData.status === 'approved') {
              setActiveWriter({ id: user.uid, ...userData });
           } else {
              signOut(auth);
              setActiveWriter(null);
              if(router) router.push('/auth');
           }
        } else {
             signOut(auth);
             setActiveWriter(null);
        }
      } else {
        setActiveWriter(null);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [router]);
  
  useEffect(() => {
    if (isLoaded && activeWriter?.role === 'head-writer') {
        fetchAllUsers();
    } else if (isLoaded && activeWriter) {
        setWriters([activeWriter]);
    } else {
        setWriters([]);
    }
  }, [isLoaded, activeWriter, fetchAllUsers]);

  const addWriter = async (name: string, email: string, password: string, role: UserRole) => {
    if (!password) throw new Error("Password is required for signup.");
    
    const usersRef = collection(db, "users");
    const emailQuery = query(usersRef, where("email", "==", email.toLowerCase()));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
        throw new Error("A user with this email already exists.");
    }
    const nameQuery = query(usersRef, where("name", "==", name));
    const nameSnapshot = await getDocs(nameQuery);
    if (!nameSnapshot.empty) {
        throw new Error("A user with this name already exists. Please choose a different name.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const newWriter: Omit<Writer, 'id'> = {
      name,
      email: email.toLowerCase(),
      avatarUrl: `https://placehold.co/128x128.png`,
      dataAiHint: 'writer portrait',
      role: role,
      status: 'pending',
    };
    
    await setDoc(doc(db, "users", user.uid), newWriter);
    await signOut(auth);
  };
  
  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for login.");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginAsHeadWriter = async (email?: string, password?: string) => {
    if (email?.toLowerCase() !== headWriterDefault.email || password !== headWriterDefault.password) {
        throw new Error("Invalid Head Writer credentials.");
    }

    const headWriterSession = {
        id: headWriterDefault.id,
        name: headWriterDefault.name,
        email: headWriterDefault.email,
        avatarUrl: headWriterDefault.avatarUrl,
        dataAiHint: headWriterDefault.dataAiHint,
        role: headWriterDefault.role,
        status: headWriterDefault.status,
    };
    localStorage.setItem('gotham-bypassed-user', JSON.stringify(headWriterSession));
    setActiveWriter(headWriterSession);
  };

  const updateWriterStatus = async (writerId: string, status: UserStatus) => {
    const userDocRef = doc(db, "users", writerId);
    await updateDoc(userDocRef, { status });
    fetchAllUsers();
  };

  const updateWriterRole = async (writerId: string, role: UserRole) => {
    const userDocRef = doc(db, "users", writerId);
    await updateDoc(userDocRef, { role });
    fetchAllUsers();
  };
  
  const updateWriterAvatar = async (writerId: string, avatarDataUrl: string) => {
    let finalAvatarUrl = avatarDataUrl;

    // If it's a data URL, upload to Firebase Storage
    if (avatarDataUrl.startsWith('data:image')) {
        const storageRef = ref(storage, `avatars/${writerId}`);
        const snapshot = await uploadString(storageRef, avatarDataUrl, 'data_url');
        finalAvatarUrl = await getDownloadURL(snapshot.ref);
    }

    // If head writer is managing, update local storage for bypassed user
    if(activeWriter?.id === 'head-writer-001' && activeWriter.id === writerId) {
      const updatedWriter = {...activeWriter, avatarUrl: finalAvatarUrl};
      localStorage.setItem('gotham-bypassed-user', JSON.stringify(updatedWriter));
      setActiveWriter(updatedWriter);
      return;
    }

    const userDocRef = doc(db, "users", writerId);
    await updateDoc(userDocRef, { avatarUrl: finalAvatarUrl });
    if(activeWriter && activeWriter.id === writerId) {
        setActiveWriter({...activeWriter, avatarUrl: finalAvatarUrl});
    }
    fetchAllUsers();
  }

  const deleteWriter = async (writerId: string) => {
    // Note: This does not delete the Firebase Auth user, only the Firestore document.
    // For a production app, you would want to use a Firebase Function to handle user deletion.
    const userDocRef = doc(db, "users", writerId);
    await deleteDoc(userDocRef);
    fetchAllUsers();
  };

  const logout = async () => {
    localStorage.removeItem('gotham-bypassed-user');
    await signOut(auth);
    setActiveWriter(null);
    router.push('/auth');
  };

  return { 
    isLoaded, 
    writers, 
    activeWriter, 
    addWriter, 
    login,
    loginAsHeadWriter,
    logout, 
    updateWriterStatus, 
    updateWriterRole,
    updateWriterAvatar,
    deleteWriter 
  };
}
