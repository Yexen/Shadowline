'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  tags?: string[];
}

const NOTES_STORAGE_KEY = 'gotham-notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(NOTES_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const notesWithDates = parsedData.map((n: any) => ({
          ...n,
          lastModified: new Date(n.lastModified)
        }));
        setNotes(notesWithDates);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse notes data", error);
      setNotes([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newData: Note[]) => {
    try {
      const sortedData = newData.sort((a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(sortedData));
      setNotes(sortedData);
    } catch (error) {
      console.error("Failed to save notes data to localStorage", error);
    }
  }, []);

  const addNote = (title: string, content: string, tags?: string[]): string => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      lastModified: new Date(),
      tags: tags || []
    };
    const newData = [newNote, ...notes];
    saveData(newData);
    return newNote.id;
  };

  const updateNote = (id: string, title: string, content: string, tags?: string[]) => {
    const updatedNotes = notes.map(note =>
      note.id === id
        ? { ...note, title, content, lastModified: new Date(), tags: tags || note.tags }
        : note
    );
    saveData(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const filteredNotes = notes.filter(note => note.id !== id);
    saveData(filteredNotes);
  };

  const getNote = (id: string): Note | undefined => {
    return notes.find(note => note.id === id);
  };

  return {
    notes,
    isLoaded,
    addNote,
    updateNote,
    deleteNote,
    getNote,
  };
}