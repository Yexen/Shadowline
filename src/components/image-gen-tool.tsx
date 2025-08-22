
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateImage } from '@/ai/flows/image-gen-flow';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';

export function ImageGenTool() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setImageUrl('');
    try {
      const result = await generateImage(prompt);
      setImageUrl(result);
    } catch (error) {
      console.error("Image generation error:", error);
      // In a real app, you'd show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="e.g., 'A dark, rainy alley in Gotham'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
        </Button>
      </div>
      <div className="aspect-video w-full">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : imageUrl ? (
          <Image src={imageUrl} alt={prompt} width={512} height={512} className="w-full h-full object-contain rounded-md border" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted rounded-md">
            <p className="text-muted-foreground text-sm">Image will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
