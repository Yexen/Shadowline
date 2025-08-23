
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';

const COVER_IMAGE_STORAGE_KEY = 'gotham-cover-image';
const COVER_IMAGE_HINT_KEY = 'gotham-cover-image-hint';
const DEFAULT_COVER_IMAGE = 'https://placehold.co/1600x400.png';
const DEFAULT_AI_HINT = 'gotham city batman';
const MAX_STORAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

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
      // Check the size of the data URI before saving
      if (newImageUrl.length > MAX_STORAGE_SIZE_BYTES) {
        toast({
            variant: 'destructive',
            title: 'Image Too Large',
            description: 'The selected image is too large to be saved locally. Please choose a smaller file (under 2MB).',
        });
        return;
      }
      localStorage.setItem(COVER_IMAGE_STORAGE_KEY, newImageUrl);
      localStorage.setItem(COVER_IMAGE_HINT_KEY, newHint);
      setCoverImage(newImageUrl);
      setDataAiHint(newHint);
    } catch (error) {
      console.error("Failed to save cover image to localStorage", error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
         toast({
            variant: 'destructive',
            title: 'Storage Full',
            description: 'Could not save the image. Local storage quota exceeded.',
        });
      }
    }
  }, []);

  return { isLoaded, coverImage, dataAiHint, setCoverImage: saveImage };
}
