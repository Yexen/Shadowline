
'use client';

import { useState } from 'react';
import { useWriters } from '@/hooks/use-writers';
import { BatLogo } from '@/components/bat-logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LoginDialog } from '@/components/login-dialog';
import { Globe } from 'lucide-react';

type Role = 'writer' | 'reader' | 'head-writer';
type Language = 'en' | 'fa';

const translations = {
  en: {
    protocol: "Writer’s Protocol",
    writerAccess: "Writer Access",
    readerAccess: "Reader Access",
    headWriterAccess: "Head Writer Access",
    or: "Or",
    needAccount: "Need an account?",
    requestAccess: "Request Access",
    accessing: "Accessing..."
  },
  fa: {
    protocol: "پروتکل نویسنده",
    writerAccess: "دسترسی نویسنده",
    readerAccess: "دسترسی خواننده",
    headWriterAccess: "دسترسی نویسنده ارشد",
    or: "یا",
    needAccount: "حساب کاربری ندارید؟",
    requestAccess: "درخواست دسترسی",
    accessing: "در حال دسترسی..."
  }
};

export default function AuthPage() {
  const router = useRouter();
  const { isLoaded } = useWriters();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogRole, setDialogRole] = useState<Role | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const t = translations[language];

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'fa' : 'en';
    setLanguage(newLang);
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="absolute top-4 right-4">
            <Button variant="ghost" onClick={toggleLanguage}>
                <Globe className="mr-2"/> {language === 'en' ? 'فارسی' : 'English'}
            </Button>
        </div>
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
                <BatLogo className="w-16 h-16 text-primary" />
            </div>
            <h1 className="font-headline text-4xl font-bold mt-4 tracking-wider">SHADOWLINE</h1>
            <p className="text-muted-foreground text-lg">{t.protocol}</p>
          </div>

          <div className="space-y-4">
             <Button 
                className="w-full h-14 text-lg font-headline"
                onClick={() => setDialogRole('writer')}
                disabled={isLoading}
             >
                {t.writerAccess}
             </Button>
             <Button 
                variant="secondary"
                className="w-full h-14 text-lg font-headline"
                onClick={() => setDialogRole('reader')}
                disabled={isLoading}
             >
                {t.readerAccess}
             </Button>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        {t.or}
                    </span>
                </div>
            </div>
             <Button 
                variant="ghost" 
                className="w-full text-primary hover:text-primary/90" 
                onClick={() => setDialogRole('head-writer')}
                disabled={!isLoaded || isLoading}
              >
                {isLoading ? t.accessing : t.headWriterAccess}
            </Button>
          </div>

          <div className="text-center text-sm">
              <p className="text-muted-foreground">
                  {t.needAccount} <Link href="/signup" className="text-primary hover:underline">{t.requestAccess}</Link>
              </p>
          </div>
        </div>
      </div>

      <LoginDialog 
        role={dialogRole}
        onClose={() => setDialogRole(null)}
      />
    </>
  );
}
