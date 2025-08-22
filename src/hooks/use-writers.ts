
'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, writeBatch } from 'firebase/firestore';

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

const DEFAULT_AVATAR = 'https://placehold.co/40x40.png';

export function useWriters() {
    const [writers, setWriters] = useState<Writer[]>([]);
    const [activeWriter, setActiveWriter] = useState<Writer | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            if (user) {
                // User is signed in, fetch their profile
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setActiveWriter({ id: user.uid, ...userDocSnap.data() } as Writer);
                } else {
                    // This case might happen if the Firestore doc wasn't created properly
                    setActiveWriter(null); 
                }
            } else {
                // User is signed out
                setActiveWriter(null);
            }
            setIsLoaded(true);
        });

        return () => unsubscribe();
    }, []);
    
    // Listen for changes to all users (for head-writer)
    useEffect(() => {
        if (activeWriter?.role !== 'head-writer') {
            setWriters(activeWriter ? [activeWriter] : []);
            return;
        };

        const usersCollectionRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Writer));
            setWriters(usersList);
        });

        return () => unsubscribe();
    }, [activeWriter]);


    const updateWriterStatus = async (writerId: string, status: UserStatus) => {
        if (activeWriter?.role !== 'head-writer') return;
        const userDocRef = doc(db, 'users', writerId);
        await setDoc(userDocRef, { status }, { merge: true });
    };

    const updateWriterRole = async (writerId: string, role: UserRole) => {
        if (activeWriter?.role !== 'head-writer') return;
        const userDocRef = doc(db, 'users', writerId);
        await setDoc(userDocRef, { role }, { merge: true });
    };
    
    const getWriterById = async (writerId: string) => {
        const userDocRef = doc(db, 'users', writerId);
        const userDocSnap = await getDoc(userDocRef);
        return userDocSnap.exists() ? { id: userDocSnap.id, ...userDocSnap.data() } as Writer : null;
    }


    return { 
        isLoaded, 
        writers, 
        activeWriter, 
        firebaseUser,
        updateWriterStatus,
        updateWriterRole,
        getWriterById,
    };
}
