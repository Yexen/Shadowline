'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types/auth';

export function useAuth() {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('shadowline-user');
    if (storedUser) {
      try {
        setActiveUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('shadowline-user');
      }
    }
    setIsLoaded(true);
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      // Simulate authentication
      let user: User;

      if (email === 'yekta.kjs@gmail.com' && password === 'LivFreya' && role === 'author') {
        user = {
          id: 'author-001',
          email: 'yekta.kjs@gmail.com',
          name: 'Yekta Jokar',
          avatarUrl: 'https://placehold.co/128x128.png',
          dataAiHint: 'author portrait',
          role: 'author',
          status: 'approved',
        };
      } else if (role && role !== 'author') {
        user = {
          id: `user-${Date.now()}`,
          email: email,
          name: email.split('@')[0],
          avatarUrl: 'https://placehold.co/128x128.png',
          dataAiHint: 'user portrait',
          role: role,
          status: 'approved',
        };
      } else {
        throw new Error('Invalid credentials');
      }

      localStorage.setItem('shadowline-user', JSON.stringify(user));
      setActiveUser(user);
      router.push('/home');
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
    localStorage.removeItem('shadowline-user');
    setActiveUser(null);
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

  const checkPermission = () => true; // Simplified for demo
  const checkAccess = () => true; // Simplified for demo

  return {
    isLoaded,
    activeUser,
    activeWriter: activeUser, // Legacy compatibility
    users: [],
    writers: [],
    login,
    loginAsAuthor,
    loginAsHeadWriter: loginAsAuthor,
    logout,
    addUser,
    addWriter: addUser,
    checkPermission,
    checkAccess,
    isLoading,
  };
}