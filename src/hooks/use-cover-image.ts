
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

const COVER_IMAGE_STORAGE_KEY = 'gotham-cover-image-url';
const COVER_IMAGE_HINT_KEY = 'gotham-cover-image-hint';
const DEFAULT_COVER_IMAGE = 'https://placehold.co/1600x400.png';
const DEFAULT_AI_HINT = 'gotham city batman';

// Helper function to upload image and get URL
const uploadCoverImage = async (dataUrl: string): Promise<string> => {
    const storageRef = ref(storage, `covers/cover-${Date.now()}`);
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
    return getDownloadURL(snapshot.ref);
};

export function useCoverImage() {
  const [coverImage, setCoverImage] = useState<string>(DEFAULT_COVER_IMAGE);
  const [dataAiHint, setDataAiHint] = useState<string>(DEFAULT_AI_HINT);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUrl = localStorage.getItem(COVER_IMAGE_STORAGE_KEY);
      const storedHint = localStorage.getItem(COVER_IMAGE_HINT_KEY);
      if (storedUrl) {
        setCoverImage(storedUrl);
        setDataAiHint(storedHint || DEFAULT_AI_HINT);
      } else {
        setCoverImage(DEFAULT_COVER_IMAGE);
        setDataAiHint(DEFAULT_AI_HINT);
      }
    } catch (error) {
      console.error("Failed to access localStorage for cover image", error);
      setCoverImage(DEFAULT_COVER_IMAGE);
      setDataAiHint(DEFAULT_AI_HINT);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveImage = useCallback(async (newImageUrl: string, newHint: string) => {
    try {
        let finalUrl = newImageUrl;
        
        // If it's a data URI, upload it to Firebase Storage
        if (newImageUrl.startsWith('data:image')) {
            toast({ title: 'Uploading new cover image...' });
            
            // Delete the old image from Firebase storage if it's a firebase URL
            const oldUrl = localStorage.getItem(COVER_IMAGE_STORAGE_KEY);
            if(oldUrl && oldUrl.includes('firebasestorage.googleapis.com')) {
                try {
                    const oldRef = ref(storage, oldUrl);
                    await deleteObject(oldRef);
                } catch (deleteError: any) {
                    // It's okay if deletion fails (e.g., file not found), just log it
                    if (deleteError.code !== 'storage/object-not-found') {
                        console.warn("Could not delete old cover image:", deleteError);
                    }
                }
            }
            
            finalUrl = await uploadCoverImage(newImageUrl);
            toast({ title: 'Upload complete!', description: 'Your new cover image has been saved.' });
        }
      
      localStorage.setItem(COVER_IMAGE_STORAGE_KEY, finalUrl);
      localStorage.setItem(COVER_IMAGE_HINT_KEY, newHint);
      setCoverImage(finalUrl);
      setDataAiHint(newHint);
    } catch (error) {
      console.error("Failed to save cover image:", error);
      toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not save the new cover image. Please try again.',
        });
    }
  }, []);

  return { isLoaded, coverImage, dataAiHint, setCoverImage: saveImage };
}
