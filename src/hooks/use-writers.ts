
'use client';

import { useState, useEffect, useCallback } from 'react';

export type UserRole = 'head-writer' | 'writer' | 'reader';

// TODO: Define this more robustly
export type Permissions = {
    readableSections: string[]; // e.g., ['/drafts', '/bible/Characters']
}

export interface Writer {
  id: string;
  name: string;
  avatarUrl: string;
  dataAiHint: string;
  role: UserRole;
  password?: string;
  permissions?: Permissions;
}

const WRITERS_STORAGE_KEY = 'gotham-writers';
const ACTIVE_WRITER_STORAGE_KEY = 'gotham-active-writer';
const DEFAULT_AVATAR = 'https://placehold.co/40x40.png';

const defaultWriters: Writer[] = [
    { 
        id: 'writer-1', 
        name: 'The Writer', 
        avatarUrl: DEFAULT_AVATAR, 
        dataAiHint: 'writer portrait',
        role: 'head-writer',
        password: 'Livfreya',
    },
];

export function useWriters() {
    const [writers, setWriters] = useState<Writer[]>([]);
    const [activeWriter, setActiveWriter] = useState<Writer | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedWriters = localStorage.getItem(WRITERS_STORAGE_KEY);
            const storedActiveWriterId = localStorage.getItem(ACTIVE_WRITER_STORAGE_KEY);

            const currentWriters = storedWriters ? JSON.parse(storedWriters) : defaultWriters;
            setWriters(currentWriters);

            const active = currentWriters.find((w: Writer) => w.id === storedActiveWriterId) || currentWriters[0];
            setActiveWriter(active);
            
            if (!storedWriters) {
                localStorage.setItem(WRITERS_STORAGE_KEY, JSON.stringify(defaultWriters));
            }
            if (!storedActiveWriterId) {
                localStorage.setItem(ACTIVE_WRITER_STORAGE_KEY, currentWriters[0].id);
            }

        } catch (error) {
            console.error("Failed to access localStorage for writers", error);
            setWriters(defaultWriters);
            setActiveWriter(defaultWriters[0]);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveData = useCallback((newWriters: Writer[]) => {
        try {
            localStorage.setItem(WRITERS_STORAGE_KEY, JSON.stringify(newWriters));
            setWriters(newWriters);
        } catch (error) {
            console.error("Failed to save writers to localStorage", error);
        }
    }, []);

    const addWriter = (name: string) => {
        const newWriter: Writer = {
            id: `writer-${Date.now()}`,
            name,
            avatarUrl: DEFAULT_AVATAR,
            dataAiHint: 'writer portrait anonymous',
            role: 'writer',
            password: 'password', // Default password, should be changed
            permissions: { readableSections: [] }
        };
        const newWriters = [...writers, newWriter];
        saveData(newWriters);
    };

    const updateWriter = (writerId: string, updatedWriter: Writer) => {
        const newWriters = writers.map(w => w.id === writerId ? updatedWriter : w);
        saveData(newWriters);
        if(activeWriter?.id === writerId) {
            setActiveWriter(updatedWriter);
        }
    };
    
    const updateWriterPassword = (writerId: string, newPassword: string) => {
        const newWriters = writers.map(w => w.id === writerId ? { ...w, password: newPassword } : w);
        saveData(newWriters);
         if(activeWriter?.id === writerId) {
            setActiveWriter(newWriters.find(w => w.id === writerId) || null);
        }
    }


    const deleteWriter = (writerId: string) => {
        if (writers.length <= 1) return; // Cannot delete the last writer
        const newWriters = writers.filter(w => w.id !== writerId);
        saveData(newWriters);
        if (activeWriter?.id === writerId) {
            switchActiveWriter(newWriters[0].id);
        }
    };
    
    const switchActiveWriter = (writerId: string) => {
        const newActiveWriter = writers.find(w => w.id === writerId);
        if (newActiveWriter) {
            try {
                localStorage.setItem(ACTIVE_WRITER_STORAGE_KEY, writerId);
                setActiveWriter(newActiveWriter);
            } catch (error) {
                console.error("Failed to set active writer in localStorage", error);
            }
        }
    };

    return { 
        isLoaded, 
        writers, 
        activeWriter, 
        addWriter, 
        updateWriter,
        updateWriterPassword, 
        deleteWriter, 
        setActiveWriter: switchActiveWriter
    };
}
