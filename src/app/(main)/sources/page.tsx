
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Book, Film, Link as LinkIcon, PlusCircle, Trash2 } from 'lucide-react';
import { useSources } from '@/hooks/use-sources';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const translations = {
  en: {
    pageDescription: "Your central repository for research, inspiration, and canonical sources.",
    comicsTitle: "Comics Database",
    comicsDesc: "Browse, search, and track your reading of essential Batman comics. An interactive library of canon.",
    exploreComics: "Explore Comics",
    mediaTitle: "Media Database",
    mediaDesc: "Explore the rich history of Batman in film and television, from the classics to modern masterpieces.",
    exploreMedia: "Explore Media",
    externalLinks: "External Links & Resources",
    addNewLink: "Add New Link",
    addResourceTitle: "Add New Resource",
    addResourceDesc: "Save a new link for your research.",
    linkTitle: "Title",
    linkTitlePlaceholder: "e.g., Gotham City History Wiki",
    linkUrl: "URL",
    linkUrlPlaceholder: "https://...",
    cancel: "Cancel",
    saveLink: "Save Link",
    noLinks: "No external links saved yet.",
  },
  fa: {
    pageDescription: "مخزن مرکزی شما برای تحقیق، الهام و منابع معتبر.",
    comicsTitle: "پایگاه داده کمیک‌ها",
    comicsDesc: "کمیک‌های ضروری بتمن را مرور، جستجو و پیگیری کنید. یک کتابخانه تعاملی از منابع اصلی.",
    exploreComics: "کاوش در کمیک‌ها",
    mediaTitle: "پایگاه داده رسانه‌ها",
    mediaDesc: "تاریخ غنی بتمن در فیلم و تلویزیون را از آثار کلاسیک تا شاهکارهای مدرن کاوش کنید.",
    exploreMedia: "کاوش در رسانه‌ها",
    externalLinks: "پیوندها و منابع خارجی",
    addNewLink: "افزودن پیوند جدید",
    addResourceTitle: "افزودن منبع جدید",
    addResourceDesc: "یک پیوند جدید برای تحقیقات خود ذخیره کنید.",
    linkTitle: "عنوان",
    linkTitlePlaceholder: "مثلاً، ویکی تاریخ شهر گاتهام",
    linkUrl: "آدرس",
    linkUrlPlaceholder: "https://...",
    cancel: "لغو",
    saveLink: "ذخیره پیوند",
    noLinks: "هنوز هیچ پیوند خارجی ذخیره نشده است.",
  }
};

export default function SourcesPage() {
  const router = useRouter();
  const { sources, addSource, deleteSource, isLoaded } = useSources();
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'fa'>('en');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  const t = translations[lang];

  const handleAddSource = () => {
    if (newTitle.trim() && newUrl.trim()) {
      addSource(newTitle, newUrl);
      setNewTitle('');
      setNewUrl('');
      setDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          {t.pageDescription}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/sources/comics')}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-3"><Book /> {t.comicsTitle}</CardTitle>
            <CardDescription>
              {t.comicsDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Button>{t.exploreComics}</Button>
          </CardContent>
        </Card>
        <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/sources/media')}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-3"><Film /> {t.mediaTitle}</CardTitle>
            <CardDescription>
              {t.mediaDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Button>{t.exploreMedia}</Button>
          </CardContent>
        </Card>
      </div>


      <Separator />

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-2xl font-bold">{t.externalLinks}</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0"/> {t.addNewLink}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.addResourceTitle}</DialogTitle>
                        <DialogDescription>{t.addResourceDesc}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="link-title">{t.linkTitle}</Label>
                            <Input id="link-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={t.linkTitlePlaceholder} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link-url">{t.linkUrl}</Label>
                            <Input id="link-url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder={t.linkUrlPlaceholder} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
                        <Button onClick={handleAddSource}>{t.saveLink}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {isLoaded && sources.length > 0 ? (
            <div className="space-y-3">
                {sources.map(source => (
                    <Card key={source.id} className="bg-card/50 flex items-center p-3 gap-4 group">
                       <div className="p-2 bg-muted rounded-md">
                         <LinkIcon className="w-5 h-5 text-muted-foreground" />
                       </div>
                       <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex-grow min-w-0">
                           <p className="font-semibold truncate hover:underline">{source.title}</p>
                           <p className="text-sm text-muted-foreground truncate">{source.url}</p>
                       </a>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => deleteSource(source.id)}>
                            <Trash2 />
                       </Button>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">{t.noLinks}</p>
            </div>
        )}
      </div>
    </div>
  );
}
