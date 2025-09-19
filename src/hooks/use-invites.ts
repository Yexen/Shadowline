'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAppFirestore } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { Invite, InviteType, UserRole } from '@/types/auth';
import { nanoid } from 'nanoid';

export function useInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchInvites = useCallback(async () => {
    try {
      const db = getAppFirestore();
      const invitesCollection = collection(db, 'invites');
      const inviteSnapshot = await getDocs(invitesCollection);

      const inviteList = inviteSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || null,
          usedAt: data.usedAt?.toDate() || null,
        } as Invite;
      });

      setInvites(inviteList);
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const createInvite = async (
    type: InviteType,
    createdBy: string,
    targetRole?: UserRole,
    expiresIn?: number, // days
    maxUses?: number
  ): Promise<string> => {
    const db = getAppFirestore();
    const token = nanoid(32);
    const inviteId = nanoid();

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : null;

    const invite: Omit<Invite, 'id'> = {
      token,
      type,
      targetRole,
      createdBy,
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      maxUses,
      currentUses: 0,
    };

    await setDoc(doc(db, 'invites', inviteId), {
      ...invite,
      createdAt: Timestamp.fromDate(invite.createdAt),
      expiresAt: invite.expiresAt ? Timestamp.fromDate(invite.expiresAt) : null,
    });

    await fetchInvites();
    return token;
  };

  const validateInvite = async (token: string): Promise<Invite | null> => {
    try {
      const db = getAppFirestore();
      const invitesRef = collection(db, 'invites');
      const q = query(invitesRef, where('token', '==', token));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const inviteDoc = snapshot.docs[0];
      const data = inviteDoc.data();

      const invite: Invite = {
        id: inviteDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || null,
        usedAt: data.usedAt?.toDate() || null,
      } as Invite;

      // Check if invite is still valid
      if (!invite.isActive) return null;
      if (invite.expiresAt && invite.expiresAt < new Date()) return null;
      if (invite.maxUses && invite.currentUses >= invite.maxUses) return null;

      return invite;
    } catch (error) {
      console.error('Error validating invite:', error);
      return null;
    }
  };

  const useInvite = async (token: string, usedBy: string): Promise<boolean> => {
    try {
      const invite = await validateInvite(token);
      if (!invite) return false;

      const db = getAppFirestore();
      const inviteRef = doc(db, 'invites', invite.id);

      const updates: any = {
        currentUses: invite.currentUses + 1,
        usedAt: Timestamp.fromDate(new Date()),
        usedBy,
      };

      // If single use or max uses reached, deactivate
      if (!invite.maxUses || invite.currentUses + 1 >= invite.maxUses) {
        updates.isActive = false;
      }

      await updateDoc(inviteRef, updates);
      await fetchInvites();
      return true;
    } catch (error) {
      console.error('Error using invite:', error);
      return false;
    }
  };

  const deactivateInvite = async (inviteId: string): Promise<void> => {
    try {
      const db = getAppFirestore();
      const inviteRef = doc(db, 'invites', inviteId);
      await updateDoc(inviteRef, { isActive: false });
      await fetchInvites();
    } catch (error) {
      console.error('Error deactivating invite:', error);
    }
  };

  const deleteInvite = async (inviteId: string): Promise<void> => {
    try {
      const db = getAppFirestore();
      const inviteRef = doc(db, 'invites', inviteId);
      await deleteDoc(inviteRef);
      await fetchInvites();
    } catch (error) {
      console.error('Error deleting invite:', error);
    }
  };

  return {
    invites,
    isLoaded,
    createInvite,
    validateInvite,
    useInvite,
    deactivateInvite,
    deleteInvite,
    refreshInvites: fetchInvites,
  };
}