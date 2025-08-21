
'use client';

import { useState, useEffect, useCallback } from 'react';

const COVER_IMAGE_STORAGE_KEY = 'gotham-cover-image';
const COVER_IMAGE_HINT_KEY = 'gotham-cover-image-hint';
const DEFAULT_COVER_IMAGE = 'https://placehold.co/1600x400.png';
const DEFAULT_AI_HINT = 'gotham city batman';


export function useCoverImage() {
  const [coverImage, setCoverImage] = useState<string>(DEFAULT_COVER_IMAGE);
  const [dataAiHint, setDataAiHint] = useState<string>(DEFAULT_AI_HINT);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedImage = localStorage.getItem(COVER_IMAGE_STORAGE_KEY);
      const storedHint = localStorage.getItem(COVER_IMAGE_HINT_KEY);
      if (storedImage) {
        setCoverImage(storedImage);
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

  const saveImage = useCallback((newImageUrl: string, newHint: string) => {
    try {
      localStorage.setItem(COVER_IMAGE_STORAGE_KEY, newImageUrl);
      localStorage.setItem(COVER_IMAGE_HINT_KEY, newHint);
      setCoverImage(newImageUrl);
      setDataAiHint(newHint);
    } catch (error) {
      console.error("Failed to save cover image to localStorage", error);
    }
  }, []);

  return { isLoaded, coverImage, dataAiHint, setCoverImage: saveImage };
}
