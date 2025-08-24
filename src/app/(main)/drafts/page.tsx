
'use client';

import { useRouter } from 'next/navigation';
import { useDrafts } from '@/hooks/use-drafts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useEffect, useState } from 'react';

const translations = {
  en: {
    loading: "Loading your drafts from the Batcomputer...",
    pageDescription: "Manage your story drafts. Start a new one or continue a work in progress.",
    newDraft: "Create New Draft",
    untitled: "Untitled Draft",
    lastModified: "Last modified",
    noContent: "No content yet...",
    deleteConfirmTitle: "Are you absolutely sure?",
    deleteConfirmDesc: "This action cannot be undone. This will permanently delete the draft titled",
    cancel: "Cancel",
    deleteAction: "Delete Draft",
    noDraftsTitle: "No Drafts Found",
    noDraftsDesc: "Click \"Create New Draft\" to start your first story.",
  },
  fa: {
    loading: "در حال بارگیری پیش‌نویس‌های شما از بت‌کامپیوتر...",
    pageDescription: "پیش‌نویس‌های داستان خود را مدیریت کنید. یک پیش‌نویس جدید شروع کنید یا کار در حال انجام را ادامه دهید.",
    newDraft: "ایجاد پیش‌نویس جدید",
    untitled: "پیش‌نویس بدون عنوان",
    lastModified: "آخرین تغییر",
    noContent: "هنوز محتوایی وجود ندارد...",
    deleteConfirmTitle: "آیا کاملاً مطمئن هستید؟",
    deleteConfirmDesc: "این عمل قابل بازگشت نیست. این کار به طور دائمی پیش‌نویس با عنوان را حذف خواهد کرد",
    cancel: "لغو",
    deleteAction: "حذف پیش‌نویس",
    noDraftsTitle: "هیچ پیش‌نویسی یافت نشد",
    noDraftsDesc: "برای شروع اولین داستان خود، روی «ایجاد پیش‌نویس جدید» کلیک کنید.",
  }
};

function extractTextFromHtml(html: string): string {
    if (typeof window === 'undefined') {
        return html.replace(/<[^>]*>?/gm, '');
    }
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

export default function DraftsPage() {
  const router = useRouter();
  const { drafts, deleteDraft, isLoaded } = useDrafts();
  const [lang, setLang] = useState<'en' | 'fa'>('en');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  const t = translations[lang];

  const handleNewDraft = () => {
    router.push('/editor/new');
  };

  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div>
          <p className="mt-2 text-muted-foreground">{t.loading}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          {t.pageDescription}
        </p>
      </div>

      <Button onClick={handleNewDraft}>
        <FilePlus className="mr-2 rtl:ml-2 rtl:mr-0" />
        {t.newDraft}
      </Button>

      {drafts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map(draft => {
            const snippet = extractTextFromHtml(draft.content).substring(0, 100) + '...';
            return (
                <Card key={draft.id} className="flex flex-col bg-card hover:border-primary/50 transition-colors">
                <CardHeader className="cursor-pointer flex-grow" onClick={() => router.push(`/editor/${draft.id}`)}>
                    <CardTitle className="font-headline">{draft.title || t.untitled}</CardTitle>
                    <CardDescription>
                    {t.lastModified}: {new Date(draft.lastModified).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="cursor-pointer flex-grow" onClick={() => router.push(`/editor/${draft.id}`)}>
                    <p className="text-muted-foreground line-clamp-3">
                    {snippet || t.noContent}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                        <Trash2 />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.deleteConfirmDesc} "{draft.title || t.untitled}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteDraft(draft.id)}>{t.deleteAction}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
                </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <h3 className="text-xl font-headline">{t.noDraftsTitle}</h3>
          <p className="text-muted-foreground">{t.noDraftsDesc}</p>
        </div>
      )}
    </div>
  );
}
