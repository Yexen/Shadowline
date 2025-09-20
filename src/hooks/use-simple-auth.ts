'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types/auth';

// Auto-logout after 1 hour of inactivity (60 minutes = 3600000 ms)
const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

export function useAuth() {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const logout = async () => {
    localStorage.removeItem('shadowline-user');
    setActiveUser(null);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    router.push('/auth');
  };

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    if (activeUser) {
      inactivityTimer.current = setTimeout(() => {
        console.log('Auto-logout due to inactivity');
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [activeUser]);

  // Track user activity
  useEffect(() => {
    if (!activeUser) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const activityHandler = () => {
      resetInactivityTimer();
    };

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // Start the inactivity timer
    resetInactivityTimer();

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [activeUser, resetInactivityTimer]);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('shadowline-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setActiveUser(user);
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

      if (role === 'author') {
        // Author requires specific credentials
        if (email === 'yekta.kjs@gmail.com' && password === 'LivFreya') {
          user = {
            id: 'author-001',
            email: 'yekta.kjs@gmail.com',
            name: 'Yekta Jokar',
            avatarUrl: 'https://placehold.co/128x128.png',
            dataAiHint: 'author portrait',
            role: 'author',
            status: 'approved',
          };
        } else {
          throw new Error('Invalid author credentials');
        }
      } else if (role && ['viewer', 'analyst', 'contributor'].includes(role)) {
        // For guest roles, check if user was created through invitation
        const existingUsers = Object.keys(localStorage)
          .filter(key => key.startsWith('shadowline-user-'))
          .map(key => JSON.parse(localStorage.getItem(key) || '{}'))
          .filter(u => u.email === email && u.role === role);

        if (existingUsers.length === 0) {
          throw new Error('Account not found. Please use an invitation link to create an account.');
        }

        // Validate password (in a real app, this would be hashed)
        const existingUser = existingUsers[0];
        if (existingUser.password !== password) {
          throw new Error('Invalid password');
        }

        user = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          avatarUrl: existingUser.avatarUrl || 'https://placehold.co/128x128.png',
          dataAiHint: existingUser.dataAiHint || 'user portrait',
          role: existingUser.role,
          status: existingUser.status,
        };
      } else {
        throw new Error('Invalid role or credentials');
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