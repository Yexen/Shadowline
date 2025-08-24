
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';
import { GameModalButton } from '@/components/GameModalButton';
import { useEffect, useState } from 'react';

const translations = {
  en: {
    description: 'Welcome to the Batcave Arcades. Take a break from writing and test your skills with these custom-built training simulations.',
    gameTitle: 'Batmobile Runner',
    gameDesc: 'Endless rooftop chase. Dodge, jump, and collect intel.'
  },
  fa: {
    description: 'به آرکیدهای بت‌کیو خوش آمدید. از نوشتن فاصله بگیرید و مهارت‌های خود را با این شبیه‌سازهای آموزشی سفارشی امتحان کنید.',
    gameTitle: 'راننده بت‌موبیل',
    gameDesc: 'تعقیب بی‌پایان روی پشت‌بام. جاخالی دهید، بپرید و اطلاعات جمع کنید.'
  }
};

export default function GamesPage() {
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
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          {t.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card/50">
          <CardHeader className="space-y-3">
            <CardTitle className="font-headline flex items-center gap-2">
              <Gamepad2 />
              {t.gameTitle}
            </CardTitle>
            <CardDescription>{t.gameDesc}</CardDescription>
            <GameModalButton title={t.gameTitle} slug="batmobile-runner" />
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
