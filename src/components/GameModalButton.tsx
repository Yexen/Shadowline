
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gamepad2, ExternalLink } from 'lucide-react';

const translations = {
  en: {
    playInApp: 'Play in app',
    openFullTab: 'Open full tab'
  },
  fa: {
    playInApp: 'بازی در برنامه',
    openFullTab: 'باز کردن در تب کامل'
  }
};

export function GameModalButton({
  title,
  slug,
}: {
  title: string;
  slug: string; // folder name under /public/games/<slug>/index.html
}) {
  const [open, setOpen] = useState(false);
  const href = `/games/${slug}/`;
  const [lang, setLang] = useState<'en' | 'fa'>('en');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  const t = translations[lang];

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Gamepad2 className="w-4 h-4" />
          {t.playInApp}
        </Button>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            {t.openFullTab}
          </Button>
        </a>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl w-[96vw]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="w-full aspect-video rounded overflow-hidden">
            <iframe
              src={href}
              className="w-full h-full"
              allow="fullscreen; gamepad; accelerometer; autoplay"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
