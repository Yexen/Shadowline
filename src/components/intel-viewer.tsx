
'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface IntelViewerProps {
  open: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
}

const translations = {
  en: {
    intelReport: 'Intel Report',
    openInNewTab: 'Open in New Tab',
    close: 'Close',
    loading: 'Loading...'
  },
  fa: {
    intelReport: 'گزارش اطلاعاتی',
    openInNewTab: 'باز کردن در تب جدید',
    close: 'بستن',
    loading: 'در حال بارگیری...'
  }
};

export function IntelViewer({ open, onClose, url, title }: IntelViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [lang, setLang] = React.useState<'en' | 'fa'>('en');

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  const t = translations[lang];

  React.useEffect(() => {
    if (open) {
      setIsLoading(true);
    }
  }, [open, url]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b flex-row items-center justify-between">
          <div className="min-w-0">
            <DialogTitle className="font-headline truncate">{title || t.intelReport}</DialogTitle>
            <DialogDescription className="truncate">{url}</DialogDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
             <Button variant="outline" size="sm" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 rtl:ml-2 rtl:mr-0"/> {t.openInNewTab}
                </a>
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">{t.close}</Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="relative flex-grow">
            {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <Skeleton className="w-full h-full" />
                </div>
            )}
            <iframe
                src={url}
                title={title || 'Article Viewer'}
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
