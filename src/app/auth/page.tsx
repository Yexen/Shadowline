'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { BatLogo } from '@/components/bat-logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LoginDialog } from '@/components/login-dialog';
import { Globe } from 'lucide-react';

type Role = 'author' | 'viewer' | 'analyst' | 'contributor';
type Language = 'en' | 'fa';

const translations = {
  en: {
    title: "Shadowline",
    subtitle: "Welcome To The World Of Shadows Of Gotham",
    authorAccess: "Author Access",
    viewerAccess: "Viewer Access",
    analystAccess: "Analyst Access",
    contributorAccess: "Contributor Access",
    or: "Or",
    needAccount: "Need an account?",
    requestAccess: "Request Access",
    accessing: "Accessing...",
    currentLanguage: "English"
  },
  fa: {
    title: "Shadowline",
    subtitle: "به دنیای سایه‌های گاتهام خوش آمدید",
    authorAccess: "دسترسی نویسنده",
    viewerAccess: "دسترسی بیننده",
    analystAccess: "دسترسی تحلیلگر",
    contributorAccess: "دسترسی مشارکت‌کننده",
    or: "یا",
    needAccount: "حساب کاربری ندارید؟",
    requestAccess: "درخواست دسترسی",
    accessing: "در حال دسترسی...",
    currentLanguage: "فارسی"
  }
} satisfies Record<Language, any>;

export default function AuthPage() {
  const router = useRouter();
  const { isLoaded, activeUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogRole, setDialogRole] = useState<Role | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  // Keep document dir/lang in sync with selected language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  useEffect(() => {
    if (isLoaded && activeUser) {
        router.push('/home');
    }
  }, [isLoaded, activeUser, router]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'fa' : 'en'));
  };

  const t = translations[language];

  if (!isLoaded) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <BatLogo className="w-24 h-12 text-primary animate-pulse" />
        </div>
      )
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="absolute top-4 right-4">
            <Button variant="ghost" onClick={toggleLanguage}>
                <Globe className="mr-2"/> {t.currentLanguage}
            </Button>
        </div>
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 mx-auto mb-6">
                <BatLogo />
            </div>
            <h1 className="font-headline text-5xl font-bold bg-gradient-to-br from-yellow-600 via-yellow-200 to-yellow-600 bg-clip-text text-transparent animate-shimmer mb-2">{t.title}</h1>
            <p className="text-muted-foreground text-lg text-center">{t.subtitle}</p>
          </div>

          <div className="space-y-4">
             <Button
                className="w-full h-14 text-lg font-headline"
                onClick={() => setDialogRole('author')}
                disabled={isLoading}
             >
                {t.authorAccess}
             </Button>
             <Button
                variant="secondary"
                className="w-full h-12 text-md font-headline"
                onClick={() => setDialogRole('viewer')}
                disabled={isLoading}
             >
                {t.viewerAccess}
             </Button>
             <Button
                variant="secondary"
                className="w-full h-12 text-md font-headline"
                onClick={() => setDialogRole('analyst')}
                disabled={isLoading}
             >
                {t.analystAccess}
             </Button>
             <Button
                variant="secondary"
                className="w-full h-12 text-md font-headline"
                onClick={() => setDialogRole('contributor')}
                disabled={isLoading}
             >
                {t.contributorAccess}
             </Button>
          </div>

          <div className="text-center text-sm">
              <p className="text-muted-foreground">
                  Guest access is invitation only.
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