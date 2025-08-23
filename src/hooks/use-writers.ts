
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';


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

const auth = getAuth(app);
const db = getFirestore(app);

const headWriterDefault = {
  id: 'head-writer-001', // Placeholder, will be replaced by actual UID on first signup/login
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
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<Writer, 'id'>;
           if (userData.status === 'approved') {
              setActiveWriter({ id: user.uid, ...userData });
           } else {
              // User is not approved, log them out
              signOut(auth);
              setActiveWriter(null);
              // Optionally redirect to a page explaining their status
              if(router) router.push('/auth');
           }
        } else {
            // Firestore doc doesn't exist, something is wrong.
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
  
  // Fetch all users if the active user is a head-writer
  useEffect(() => {
    if (isLoaded && activeWriter?.role === 'head-writer') {
        fetchAllUsers();
    } else if (isLoaded && activeWriter) {
        setWriters([activeWriter]);
    } else {
        setWriters([]);
    }
  }, [isLoaded, activeWriter, fetchAllUsers]);

  const addWriter = async (name: string, email: string, password?: string) => {
    if (!password) throw new Error("Password is required for signup.");
    
    // Check if user already exists in Firestore by email (case-insensitive for robustness)
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error("A user with this email already exists.");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const newWriter: Omit<Writer, 'id'> = {
      name,
      email: email.toLowerCase(),
      avatarUrl: `https://placehold.co/128x128.png`,
      dataAiHint: 'writer portrait',
      role: 'writer',
      status: 'pending',
    };
    
    await setDoc(doc(db, "users", user.uid), newWriter);
    // The onAuthStateChanged listener will handle setting the active user if they get auto-logged in,
    // but typically we want them to log in after their account is approved.
    await signOut(auth);
  };
  
  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for login.");
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle the rest
  };

  const loginAsHeadWriter = async () => {
    // This is a special function to ensure the head writer exists and logs them in.
    try {
        await login(headWriterDefault.email, headWriterDefault.password);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            // First time login for head writer, create account
             try {
                const userCredential = await createUserWithEmailAndPassword(auth, headWriterDefault.email, headWriterDefault.password);
                const user = userCredential.user;
                const headWriterProfile: Omit<Writer, 'id'> = {
                    name: headWriterDefault.name,
                    email: headWriterDefault.email,
                    avatarUrl: headWriterDefault.avatarUrl,
                    dataAiHint: headWriterDefault.dataAiHint,
                    role: headWriterDefault.role,
                    status: headWriterDefault.status,
                };
                await setDoc(doc(db, "users", user.uid), headWriterProfile);
             } catch (creationError: any) {
                if (creationError.code !== 'auth/email-already-in-use') {
                    throw creationError;
                }
                // If email is in use, it means auth user exists but maybe firestore doc doesn't.
                // Just proceed to login, which will get caught by onAuthStateChanged.
             }
             // After creation or if already exists, try logging in again
             await login(headWriterDefault.email, headWriterDefault.password);

        } else {
            console.error("Head writer login failed:", error);
            throw error;
        }
    }
  };

  const updateWriterStatus = async (writerId: string, status: UserStatus) => {
    const userDocRef = doc(db, "users", writerId);
    await updateDoc(userDocRef, { status });
    fetchAllUsers(); // Refresh the list
  };

  const updateWriterRole = async (writerId: string, role: UserRole) => {
    const userDocRef = doc(db, "users", writerId);
    await updateDoc(userDocRef, { role });
    fetchAllUsers(); // Refresh the list
  };

  const deleteWriter = async (writerId: string) => {
    // Note: Deleting a Firebase Auth user requires admin privileges,
    // usually handled by a backend function. Here we just delete the Firestore record.
    const userDocRef = doc(db, "users", writerId);
    await deleteDoc(userDocRef);
    fetchAllUsers(); // Refresh the list
  };

  const logout = async () => {
    await signOut(auth);
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
    deleteWriter 
  };
}
