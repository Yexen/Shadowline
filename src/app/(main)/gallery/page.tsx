
'use client';

import { useState, useEffect } from 'react';
import { Images } from 'lucide-react';
import { useGallery } from '@/hooks/use-gallery';
import { GalleryFolder } from '@/components/gallery-folder';
import { GalleryControls } from '@/components/gallery-controls';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export type GalleryFilter = 'all' | 'image' | 'video';

const translations = {
  en: {
    loading: 'Loading visual archives...',
    description: 'A visual archive of your world. Add folders, images, and videos to build your reference library.',
    all: 'All',
    images: 'Images',
    videos: 'Videos',
    noFolders: 'No folders yet.',
    noFoldersDesc: 'Click "Add New Folder" to get started.',
  },
  fa: {
    loading: 'در حال بارگیری آرشیوهای بصری...',
    description: 'آرشیوی بصری از دنیای شما. برای ساخت کتابخانه مرجع خود، پوشه‌ها، تصاویر و ویدیوها را اضافه کنید.',
    all: 'همه',
    images: 'تصاویر',
    videos: 'ویدیوها',
    noFolders: 'هنوز هیچ پوشه‌ای وجود ندارد.',
    noFoldersDesc: 'برای شروع، روی «افزودن پوشه جدید» کلیک کنید.',
  }
};

export default function GalleryPage() {
  const { folders, addFolder, addItemToFolder, updateItem, deleteItem, updateFolder, deleteFolder, isLoaded } = useGallery();
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [lang, setLang] = useState<'en' | 'fa'>('en');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  const t = translations[lang];

  if (!isLoaded) {
    return (
        <div className="space-y-8">
            <div>
                <p className="mt-2 text-muted-foreground">{t.loading}</p>
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
            {t.description}
          </p>
      </div>

      <div className="flex justify-between items-center">
        <GalleryControls addFolder={addFolder} />
        <div className="flex items-center gap-2">
            <Button variant={filter === 'all' ? 'default' : 'ghost'} onClick={() => setFilter('all')}>{t.all}</Button>
            <Button variant={filter === 'image' ? 'default' : 'ghost'} onClick={() => setFilter('image')}>{t.images}</Button>
            <Button variant={filter === 'video' ? 'default' : 'ghost'} onClick={() => setFilter('video')}>{t.videos}</Button>
        </div>
      </div>


      <div className="space-y-12">
        {folders.map(folder => (
          <GalleryFolder
            key={folder.id}
            folder={folder}
            filter={filter}
            onAddItem={addItemToFolder}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            onUpdateFolder={updateFolder}
            onDeleteFolder={deleteFolder}
          />
        ))}
        {folders.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">{t.noFolders}</p>
                <p className="text-sm text-muted-foreground/80">{t.noFoldersDesc}</p>
            </div>
        )}
      </div>
    </div>
  );
}
