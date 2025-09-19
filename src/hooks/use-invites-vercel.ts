'use client';

import { useState, useEffect, useCallback } from 'react';
import { Invite, InviteType, UserRole } from '@/types/auth';
import {
  createInvite as dbCreateInvite,
  getInviteByToken,
  getAllInvites,
  useInvite as dbUseInvite,
  deactivateInvite as dbDeactivateInvite,
  deleteInvite as dbDeleteInvite
} from '@/lib/db';

export function useInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchInvites = useCallback(async () => {
    try {
      const allInvites = await getAllInvites();
      setInvites(allInvites);
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
    expiresIn?: number,
    maxUses?: number
  ): Promise<string> => {
    try {
      const token = await dbCreateInvite(type, createdBy, targetRole, expiresIn, maxUses);
      await fetchInvites(); // Refresh the list
      return token;
    } catch (error) {
      console.error('Error creating invite:', error);
      throw error;
    }
  };

  const validateInvite = async (token: string): Promise<Invite | null> => {
    try {
      const invite = await getInviteByToken(token);

      if (!invite) return null;
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
      const success = await dbUseInvite(token, usedBy);
      if (success) {
        await fetchInvites(); // Refresh the list
      }
      return success;
    } catch (error) {
      console.error('Error using invite:', error);
      return false;
    }
  };

  const deactivateInvite = async (inviteId: string): Promise<void> => {
    try {
      await dbDeactivateInvite(inviteId);
      await fetchInvites(); // Refresh the list
    } catch (error) {
      console.error('Error deactivating invite:', error);
      throw error;
    }
  };

  const deleteInvite = async (inviteId: string): Promise<void> => {
    try {
      await dbDeleteInvite(inviteId);
      await fetchInvites(); // Refresh the list
    } catch (error) {
      console.error('Error deleting invite:', error);
      throw error;
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