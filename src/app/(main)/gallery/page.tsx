
'use client';

import { useState } from 'react';
import { Images } from 'lucide-react';
import { useGallery } from '@/hooks/use-gallery';
import { GalleryFolder } from '@/components/gallery-folder';
import { GalleryControls } from '@/components/gallery-controls';
import { Skeleton } from '@/components/ui/skeleton';

export default function GalleryPage() {
  const { folders, addFolder, addImageToFolder, updateImage, deleteImage, updateFolder, deleteFolder, isLoaded } = useGallery();

  if (!isLoaded) {
    return (
        <div className="space-y-8">
            <div>
                
                <p className="mt-2 text-muted-foreground">
                  Loading visual archives...
                </p>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        
        <p className="mt-2 text-muted-foreground">
          A visual archive of your world. Add folders and images to build your reference library.
        </p>
      </div>

      <GalleryControls addFolder={addFolder} />

      <div className="space-y-12">
        {folders.map(folder => (
          <GalleryFolder
            key={folder.id}
            folder={folder}
            onAddImage={addImageToFolder}
            onUpdateImage={updateImage}
            onDeleteImage={deleteImage}
            onUpdateFolder={updateFolder}
            onDeleteFolder={deleteFolder}
          />
        ))}
        {folders.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">No folders yet.</p>
                <p className="text-sm text-muted-foreground/80">Click "Add New Folder" to get started.</p>
            </div>
        )}
      </div>
    </div>
  );
}
