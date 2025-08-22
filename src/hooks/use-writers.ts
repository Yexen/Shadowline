
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'head-writer' | 'writer' | 'reader';
export type UserStatus = 'approved' | 'pending' | 'rejected';

export interface Writer {
  id: string;
  name: string;
  email: string;
  password?: string; // Password is required but optional here to avoid storing it in `activeWriter`
  avatarUrl: string;
  dataAiHint: string;
  role: UserRole;
  status: UserStatus;
}

const WRITERS_STORAGE_KEY = 'gotham-writers-list';
const ACTIVE_WRITER_STORAGE_KEY = 'gotham-active-writer';

// Define the default Head Writer profile.
const headWriterDefault: Writer = {
  id: 'head-writer-001',
  name: 'Yekta Jokar',
  email: 'yekta.kjs@gmail.com',
  password: 'LivFreya', 
  avatarUrl: 'https://placehold.co/128x128.png',
  dataAiHint: 'female writer serious',
  role: 'head-writer',
  status: 'approved',
};

export function useWriters() {
  const [writers, setWriters] = useState<Writer[]>([]);
  const [activeWriter, _setActiveWriter] = useState<Writer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      // Load all writers
      const storedWriters = localStorage.getItem(WRITERS_STORAGE_KEY);
      if (storedWriters) {
        setWriters(JSON.parse(storedWriters));
      } else {
        // If no writers list exists, initialize it with the Head Writer
        setWriters([headWriterDefault]);
        localStorage.setItem(WRITERS_STORAGE_KEY, JSON.stringify([headWriterDefault]));
      }

      // Load active writer
      const storedActiveWriter = localStorage.getItem(ACTIVE_WRITER_STORAGE_KEY);
      if (storedActiveWriter) {
        try {
          // Safeguard against non-JSON data
          const parsedWriter = JSON.parse(storedActiveWriter);
          if (typeof parsedWriter === 'object' && parsedWriter !== null) {
            _setActiveWriter(parsedWriter);
          } else {
            localStorage.removeItem(ACTIVE_WRITER_STORAGE_KEY);
          }
        } catch (e) {
          console.error("Failed to parse active writer, removing invalid data.", e);
          localStorage.removeItem(ACTIVE_WRITER_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to access localStorage for writers", error);
      setWriters([headWriterDefault]); // Fallback
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newData: Writer[]) => {
    try {
      localStorage.setItem(WRITERS_STORAGE_KEY, JSON.stringify(newData));
      setWriters(newData);
    } catch (error) {
      console.error("Failed to save writers data to localStorage", error);
    }
  }, []);

  const setActiveWriter = (writer: Writer | null) => {
    try {
        if (writer) {
            // Create a version of the writer object without the password for safe storage
            const { password, ...writerToStore } = writer;
            localStorage.setItem(ACTIVE_WRITER_STORAGE_KEY, JSON.stringify(writerToStore));
        } else {
            localStorage.removeItem(ACTIVE_WRITER_STORAGE_KEY);
        }
        _setActiveWriter(writer);
    } catch (error) {
        console.error("Failed to set active writer in localStorage", error);
    }
  };
  
  const addWriter = (name: string, email: string, password?: string) => {
    const existingWriter = writers.find(w => w.email === email);
    if (existingWriter) {
      throw new Error("A user with this email already exists.");
    }
    const newWriter: Writer = {
      id: `writer-${Date.now()}`,
      name,
      email,
      password,
      avatarUrl: `https://placehold.co/128x128.png`,
      dataAiHint: 'writer portrait',
      role: 'writer',
      status: 'pending',
    };
    const updatedWriters = [...writers, newWriter];
    saveData(updatedWriters);
  };

  const updateWriterStatus = (writerId: string, status: UserStatus) => {
    const updatedWriters = writers.map(w => w.id === writerId ? { ...w, status } : w);
    saveData(updatedWriters);
  };

  const updateWriterRole = (writerId: string, role: UserRole) => {
    const updatedWriters = writers.map(w => w.id === writerId ? { ...w, role } : w);
    saveData(updatedWriters);
  }

  const logout = () => {
    setActiveWriter(null);
  }

  return { isLoaded, writers, activeWriter, setActiveWriter, addWriter, logout, updateWriterStatus, updateWriterRole };
}
