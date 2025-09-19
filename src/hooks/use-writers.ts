
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, query, where, Firestore, Timestamp } from 'firebase/firestore';
import { getAppStorage, getAppAuth, getAppFirestore } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { User, UserRole, UserStatus, hasPermission, canPerform, PERMISSIONS } from '@/types/auth';
import { useInvites } from './use-invites';

// Legacy interface for backward compatibility
export interface Writer extends User {}

// Legacy types for backward compatibility
export type LegacyUserRole = 'head-writer' | 'writer' | 'reader';
export type LegacyUserStatus = 'approved' | 'pending' | 'rejected';


const authorDefault = {
  id: 'author-001',
  name: 'Yekta Jokar',
  email: 'yekta.kjs@gmail.com',
  password: 'LivFreya',
  avatarUrl: 'https://placehold.co/128x128.png',
  dataAiHint: 'female writer serious',
  role: 'author' as UserRole,
  status: 'approved' as UserStatus,
};


export function useWriters() {
  const [writers, setWriters] = useState<User[]>([]);
  const [activeWriter, setActiveWriter] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { validateInvite, useInvite } = useInvites();
  const router = useRouter();

  const fetchAllUsers = useCallback(async () => {
    if (activeWriter?.role !== 'author') {
        setWriters(activeWriter ? [activeWriter] : []);
        return;
    }
    const db = getAppFirestore();
    const usersCollection = collection(db, "users");
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        invitedAt: data.invitedAt?.toDate() || null,
        approvedAt: data.approvedAt?.toDate() || null,
      } as User;
    });
    setWriters(userList);
  }, [activeWriter]);

  useEffect(() => {
    const bypassedUser = localStorage.getItem('gotham-bypassed-user');
    if (bypassedUser) {
        setActiveWriter(JSON.parse(bypassedUser));
        setIsLoaded(true);
        return;
    }

    const auth = getAppAuth();
    const db = getAppFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'id'>;
           if (userData.status === 'approved') {
              setActiveWriter({
                id: user.uid,
                ...userData,
                invitedAt: userData.invitedAt?.toDate() || null,
                approvedAt: userData.approvedAt?.toDate() || null,
              });
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
    if (isLoaded && activeWriter?.role === 'author') {
        fetchAllUsers();
    } else if (isLoaded && activeWriter) {
        setWriters([activeWriter]);
    } else {
        setWriters([]);
    }
  }, [isLoaded, activeWriter, fetchAllUsers]);

  const addUser = async (name: string, email: string, password: string, role: UserRole, inviteToken?: string) => {
    if (!password) throw new Error("Password is required for signup.");

    // Validate invite if provided
    let invite = null;
    if (inviteToken) {
      invite = await validateInvite(inviteToken);
      if (!invite) {
        throw new Error("Invalid or expired invite token.");
      }
      // Override role if invite specifies one
      if (invite.targetRole) {
        role = invite.targetRole;
      }
    }

    const auth = getAppAuth();
    const db = getAppFirestore();
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

    const newUser: Omit<User, 'id'> = {
      name,
      email: email.toLowerCase(),
      avatarUrl: `https://placehold.co/128x128.png`,
      dataAiHint: 'user portrait',
      role: role,
      status: 'pending',
      inviteToken: inviteToken || undefined,
      invitedBy: invite?.createdBy || undefined,
      invitedAt: invite ? new Date() : undefined,
    };

    await setDoc(doc(db, "users", user.uid), {
      ...newUser,
      invitedAt: newUser.invitedAt ? Timestamp.fromDate(newUser.invitedAt) : null,
    });

    // Mark invite as used if provided
    if (inviteToken) {
      await useInvite(inviteToken, user.uid);
    }

    await signOut(auth);
  };

  // Legacy function for backward compatibility
  const addWriter = async (name: string, email: string, password: string, role: UserRole) => {
    return addUser(name, email, password, role);
  };
  
  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for login.");
    const auth = getAppAuth();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginAsAuthor = async (email?: string, password?: string) => {
    if (email?.toLowerCase() !== authorDefault.email || password !== authorDefault.password) {
        throw new Error("Invalid Author credentials.");
    }

    const authorSession = {
        id: authorDefault.id,
        name: authorDefault.name,
        email: authorDefault.email,
        avatarUrl: authorDefault.avatarUrl,
        dataAiHint: authorDefault.dataAiHint,
        role: authorDefault.role,
        status: authorDefault.status,
    };
    localStorage.setItem('gotham-bypassed-user', JSON.stringify(authorSession));
    setActiveWriter(authorSession);
  };

  // Legacy function for backward compatibility
  const loginAsHeadWriter = async (email?: string, password?: string) => {
    return loginAsAuthor(email, password);
  };

  const updateWriterStatus = async (writerId: string, status: UserStatus) => {
    const db = getAppFirestore();
    const userDocRef = doc(db, "users", writerId);
    await updateDoc(userDocRef, { status });
    fetchAllUsers();
  };

  const updateWriterRole = async (writerId: string, role: UserRole) => {
    const db = getAppFirestore();
    const userDocRef = doc(db, "users", writerId);
    await updateDoc(userDocRef, { role });
    fetchAllUsers();
  };
  
  const updateWriterAvatar = async (writerId: string, avatarDataUrl: string) => {
    const storage = getAppStorage();
    let finalAvatarUrl = avatarDataUrl;

    // If it's a data URL, upload to Firebase Storage
    if (avatarDataUrl.startsWith('data:image')) {
        const storageRef = ref(storage, `avatars/${writerId}`);
        const snapshot = await uploadString(storageRef, avatarDataUrl, 'data_url');
        finalAvatarUrl = await getDownloadURL(snapshot.ref);
    }

    // If author is managing, update local storage for bypassed user
    if(activeWriter?.id === 'author-001' && activeWriter.id === writerId) {
      const updatedWriter = {...activeWriter, avatarUrl: finalAvatarUrl};
      localStorage.setItem('gotham-bypassed-user', JSON.stringify(updatedWriter));
      setActiveWriter(updatedWriter);
      return;
    }

    const db = getAppFirestore();
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
    const db = getAppFirestore();
    const userDocRef = doc(db, "users", writerId);
    await deleteDoc(userDocRef);
    fetchAllUsers();
  };

  const logout = async () => {
    const auth = getAppAuth();
    localStorage.removeItem('gotham-bypassed-user');
    await signOut(auth);
    setActiveWriter(null);
    router.push('/auth');
  };

  const approveUser = async (userId: string, approvedBy: string) => {
    const db = getAppFirestore();
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      status: 'approved',
      approvedBy,
      approvedAt: Timestamp.fromDate(new Date()),
    });
    fetchAllUsers();
  };

  const checkPermission = (permission: typeof PERMISSIONS[keyof typeof PERMISSIONS]) => {
    if (!activeWriter) return false;
    return hasPermission(activeWriter.role, permission);
  };

  const checkAccess = (resource: string, action: string) => {
    if (!activeWriter) return false;
    return canPerform(activeWriter.role, resource, action);
  };

  return {
    isLoaded,
    writers,
    users: writers, // Alias for new naming
    activeWriter,
    activeUser: activeWriter, // Alias for new naming
    addWriter,
    addUser,
    login,
    loginAsHeadWriter,
    loginAsAuthor,
    logout,
    updateWriterStatus,
    updateWriterRole,
    updateWriterAvatar,
    deleteWriter,
    approveUser,
    checkPermission,
    checkAccess,
  };
}
