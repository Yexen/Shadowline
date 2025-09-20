'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, getUserByEmail } from '@/lib/db';
import { User } from '@/types/auth';

export function useWriters() {
  const [writers, setWriters] = useState<User[]>([]);
  const [activeWriter, setActiveWriter] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadWriters() {
      try {
        const users = await getAllUsers();
        setWriters(users);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load writers:', error);
        setIsLoaded(true);
      }
    }

    loadWriters();
  }, []);

  const getWriterByEmail = async (email: string) => {
    try {
      return await getUserByEmail(email);
    } catch (error) {
      console.error('Failed to get writer by email:', error);
      return null;
    }
  };

  return {
    writers,
    activeWriter,
    isLoaded,
    getWriterByEmail,
    setActiveWriter,
  };
}