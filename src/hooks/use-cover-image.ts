
'use client';

import { useState, useEffect, useCallback } from 'react';

const COVER_IMAGE_STORAGE_KEY = 'gotham-cover-image';
const DEFAULT_COVER_IMAGE = 'https://placehold.co/1600x400';

export function useCoverImage() {
  const [coverImage, setCoverImage] = useState<string>(DEFAULT_COVER_IMAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedImage = localStorage.getItem(COVER_IMAGE_STORAGE_KEY);
      if (storedImage) {
        setCoverImage(storedImage);
      } else {
        setCoverImage(DEFAULT_COVER_IMAGE);
      }
    } catch (error) {
      console.error("Failed to access localStorage for cover image", error);
      setCoverImage(DEFAULT_COVER_IMAGE);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveImage = useCallback((newImageUrl: string) => {
    try {
      localStorage.setItem(COVER_IMAGE_STORAGE_KEY, newImageUrl);
      setCoverImage(newImageUrl);
    } catch (error) {
      console.error("Failed to save cover image to localStorage", error);
    }
  }, []);

  return { isLoaded, coverImage, setCoverImage: saveImage };
}
