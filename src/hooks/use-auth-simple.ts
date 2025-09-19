'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole, hasPermission, canPerform, PERMISSIONS } from '@/types/auth';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isLoaded = status !== 'loading';
  const activeUser = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    avatarUrl: session.user.image || 'https://placehold.co/128x128.png',
    dataAiHint: 'user portrait',
    role: session.user.role,
    status: session.user.status,
  } as User : null;

  const login = async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        role: role || 'viewer',
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        router.push('/home');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAuthor = async (email?: string, password?: string) => {
    return login(email || 'yekta.kjs@gmail.com', password || 'LivFreya', 'author');
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/auth');
  };

  const addUser = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    inviteToken?: string
  ) => {
    // For demo purposes, just simulate success
    console.log('User would be created:', { name, email, role, inviteToken });
    return Promise.resolve();
  };

  const checkPermission = (permission: typeof PERMISSIONS[keyof typeof PERMISSIONS]) => {
    if (!activeUser) return false;
    return hasPermission(activeUser.role, permission);
  };

  const checkAccess = (resource: string, action: string) => {
    if (!activeUser) return false;
    return canPerform(activeUser.role, resource, action);
  };

  return {
    isLoaded,
    activeUser,
    activeWriter: activeUser, // Legacy compatibility
    users: [], // Will be populated when needed
    writers: [], // Legacy compatibility
    login,
    loginAsAuthor,
    loginAsHeadWriter: loginAsAuthor, // Legacy compatibility
    logout,
    addUser,
    addWriter: addUser, // Legacy compatibility
    checkPermission,
    checkAccess,
    isLoading,
  };
}