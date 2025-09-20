'use client';

import { useState } from 'react';

export function useCoverImage() {
  const [coverImage, setCoverImage] = useState<string>('https://placehold.co/1200x600.png');
  const [coverImagePosition, setCoverImagePosition] = useState<number>(50);
  const [dataAiHint, setDataAiHint] = useState<string>('hero banner image');
  const [isUploading, setIsUploading] = useState(false);

  const uploadCoverImage = async (imageData: string) => {
    setIsUploading(true);
    try {
      // For now, just use the data URL directly
      // In production, you could upload to Vercel Blob Storage
      setCoverImage(imageData);
      return imageData;
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const removeCoverImage = async () => {
    setCoverImage('https://placehold.co/1200x600.png');
  };

  return {
    coverImage,
    setCoverImage,
    coverImagePosition,
    setCoverImagePosition,
    dataAiHint,
    setDataAiHint,
    uploadCoverImage,
    removeCoverImage,
    isUploading,
  };
}