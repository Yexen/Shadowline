
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { getAppStorage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { useUserData } from './use-user-data';

const COVER_IMAGE_STORAGE_KEY = 'gotham-cover-image-url';
const COVER_IMAGE_HINT_KEY = 'gotham-cover-image-hint';
const COVER_IMAGE_POSITION_KEY = 'gotham-cover-image-position';

const DEFAULT_COVER_IMAGE = '/alimoini_Ultra-wide_comic-book_splash_header_on_a_rain-slick__039016ec-7d75-4c0a-8233-4e1ec46921c4_3.png';
const DEFAULT_AI_HINT = 'ultra-wide comic-book splash header on rain-slick night Gotham Batman';
const DEFAULT_POSITION = 50; // Center

// Helper function to upload image and get URL
const uploadCoverImage = async (dataUrl: string): Promise<string> => {
    const storage = getAppStorage();
    // Client-side size check before upload to prevent large files from being processed
    // 2MB limit
    if (dataUrl.length > 2 * 1024 * 1024) {
        throw new Error('Image size exceeds 2MB limit.');
    }
    const storageRef = ref(storage, `covers/cover-${Date.now()}`);
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
    return getDownloadURL(snapshot.ref);
};

export function useCoverImage() {
  const [coverImage, setCoverImage] = useState<string>(DEFAULT_COVER_IMAGE);
  const [dataAiHint, setDataAiHint] = useState<string>(DEFAULT_AI_HINT);
  const [coverImagePosition, setPosition] = useState<number>(DEFAULT_POSITION);
  const [isLoaded, setIsLoaded] = useState(false);

  const { userData, updateCoverImage, isLoaded: userDataLoaded, isAuthenticated } = useUserData();

  useEffect(() => {
    if (userDataLoaded) {
      // Load from persistent user data first (Firestore or localStorage)
      if (userData.coverImage) {
        setCoverImage(userData.coverImage);
        setDataAiHint(DEFAULT_AI_HINT); // Could be extended to save hint in user data
        setPosition(DEFAULT_POSITION); // Could be extended to save position in user data
      } else {
        // Fallback to localStorage for compatibility
        try {
          const storedUrl = localStorage.getItem(COVER_IMAGE_STORAGE_KEY);
          const storedHint = localStorage.getItem(COVER_IMAGE_HINT_KEY);
          const storedPosition = localStorage.getItem(COVER_IMAGE_POSITION_KEY);

          if (storedUrl) {
            setCoverImage(storedUrl);
            setDataAiHint(storedHint || DEFAULT_AI_HINT);
            setPosition(storedPosition ? parseInt(storedPosition, 10) : DEFAULT_POSITION);
            // Migrate to user data if authenticated
            if (isAuthenticated) {
              updateCoverImage(storedUrl);
            }
          } else {
            setCoverImage(DEFAULT_COVER_IMAGE);
            setDataAiHint(DEFAULT_AI_HINT);
            setPosition(DEFAULT_POSITION);
          }
        } catch (error) {
          console.error("Failed to access localStorage for cover image", error);
          setCoverImage(DEFAULT_COVER_IMAGE);
          setDataAiHint(DEFAULT_AI_HINT);
          setPosition(DEFAULT_POSITION);
        }
      }
      setIsLoaded(true);
    }
  }, [userDataLoaded, userData.coverImage, isAuthenticated, updateCoverImage]);

  const saveImage = useCallback(async (newImageUrl: string, newHint: string) => {
    try {
        console.log('Saving cover image...', { newImageUrl: newImageUrl.substring(0, 50) + '...', newHint });
        toast({ title: 'Saving cover image...' });
        
        let finalUrl = newImageUrl;
        
        // Upload to Firebase Storage if it's a data URL and user is authenticated
        if (newImageUrl.startsWith('data:image') && isAuthenticated) {
            try {
                console.log('Uploading to Firebase Storage...');
                finalUrl = await uploadCoverImage(newImageUrl);
                console.log('Upload successful, URL:', finalUrl);
            } catch (uploadError) {
                console.warn('Firebase upload failed, using data URL:', uploadError);
                finalUrl = newImageUrl; // Fallback to data URL
            }
        }
      
      // Save to persistent user data (Firestore or localStorage)
      updateCoverImage(finalUrl);
      
      // Also save to localStorage for compatibility
      localStorage.setItem(COVER_IMAGE_STORAGE_KEY, finalUrl);
      localStorage.setItem(COVER_IMAGE_HINT_KEY, newHint);
      
      setCoverImage(finalUrl);
      setDataAiHint(newHint);
      
      console.log('Cover image saved successfully!');
      toast({ 
          title: 'Cover image saved!', 
          description: isAuthenticated ? 'Saved to your account and synced across devices.' : 'Saved locally to this device.'
      });
    } catch (error) {
      console.error("Failed to save cover image:", error);
      toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: (error as Error).message || 'Could not save the new cover image. Please try again.',
        });
    }
  }, [isAuthenticated, updateCoverImage]);
  
  const setCoverImagePosition = useCallback((newPosition: number) => {
    try {
        localStorage.setItem(COVER_IMAGE_POSITION_KEY, newPosition.toString());
        setPosition(newPosition);
    } catch (error) {
        console.error("Failed to save cover image position", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save image position.',
        });
    }
  }, []);

  return { 
    isLoaded: isLoaded && userDataLoaded, 
    coverImage, 
    dataAiHint, 
    setCoverImage: saveImage, 
    coverImagePosition, 
    setCoverImagePosition,
    isAuthenticated 
  };
}
