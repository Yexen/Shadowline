
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, PenLine, ChevronRight, Image as ImageIcon, FileText } from 'lucide-react';
import { ImageGenTool } from '@/components/image-gen-tool';
import { SummarizeTool } from '@/components/summarize-tool';
import { OracleChatTool } from '@/components/oracle-chat-tool';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

const translations = {
  en: {
    pageDescription: 'A suite of AI-powered tools to assist your writing process, from generating ideas to refining your drafts.',
    chapterGenTitle: 'Chapter Generation',
    chapterGenDesc: 'Provide a prompt and let the AI ghostwriter draft a scene or chapter for you.',
    goToEditor: 'Go to Editor',
    askOracleTitle: 'Ask the Oracle (Contextual)',
    askOracleDesc: 'Select text in the editor and ask contextual questions to get insights, clarify themes, or check character motivations.',
    imageGenTitle: 'Image Generation',
    imageGenDesc: 'Generate a visual reference for a character, location, or scene.',
    summarizeTitle: 'Summarize',
    summarizeDesc: 'Get a quick summary of a bible entry. Try "@The Joker".'
  },
  fa: {
    pageDescription: 'مجموعه‌ای از ابزارهای مجهز به هوش مصنوعی برای کمک به فرآیند نویسندگی شما، از تولید ایده تا اصلاح پیش‌نویس‌ها.',
    chapterGenTitle: 'تولید فصل',
    chapterGenDesc: 'یک اعلان ارائه دهید و به نویسنده هوش مصنوعی اجازه دهید یک صحنه یا فصل برای شما بنویسد.',
    goToEditor: 'برو به ویرایشگر',
    askOracleTitle: 'از اوراکل بپرس (متنی)',
    askOracleDesc: 'متنی را در ویرایشگر انتخاب کرده و سوالات متنی بپرسید تا بینش کسب کنید، مضامین را روشن کنید یا انگیزه‌های شخصیت را بررسی کنید.',
    imageGenTitle: 'تولید تصویر',
    imageGenDesc: 'یک مرجع بصری برای یک شخصیت، مکان یا صحنه ایجاد کنید.',
    summarizeTitle: 'خلاصه کردن',
    summarizeDesc: 'خلاصه سریعی از یک ورودی کتاب مقدس دریافت کنید. "@جوکر" را امتحان کنید.'
  }
};

export default function AiToolsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'fa'>('en');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  const t = translations[lang];

  const tools = [
    {
      title: t.chapterGenTitle,
      description: t.chapterGenDesc,
      icon: PenLine,
      action: () => router.push('/editor/new'),
      cta: t.goToEditor
    },
    {
      title: t.askOracleTitle,
      description: t.askOracleDesc,
      icon: Sparkles,
      action: () => router.push('/editor/new'),
      cta: t.goToEditor
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          {t.pageDescription}
        </p>
      </div>

      <OracleChatTool />

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => (
          <Card 
            key={index} 
            className="bg-card hover:border-primary/50 transition-colors flex flex-col cursor-pointer"
            onClick={tool.action}
          >
            <CardHeader className="flex-row items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                 <tool.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">{tool.title}</CardTitle>
                <CardDescription className="mt-1">{tool.description}</CardDescription>
              </div>
            </CardHeader>
            <div className="p-6 pt-0 mt-auto">
                <div className="flex items-center justify-end text-primary font-bold text-sm">
                    {tool.cta} <ChevronRight className="w-4 h-4 ml-1 rtl:mr-1 rtl:ml-0" />
                </div>
            </div>
          </Card>
        ))}
         <Card className="bg-card">
            <CardHeader className="flex-row items-start gap-4">
               <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                 <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">{t.imageGenTitle}</CardTitle>
                <CardDescription className="mt-1">{t.imageGenDesc}</CardDescription>
              </div>
            </CardHeader>
            <div className="p-6 pt-0">
              <ImageGenTool />
            </div>
        </Card>
        <Card className="bg-card">
            <CardHeader className="flex-row items-start gap-4">
               <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                 <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">{t.summarizeTitle}</CardTitle>
                <CardDescription className="mt-1">{t.summarizeDesc}</CardDescription>
              </div>
            </CardHeader>
            <div className="p-6 pt-0">
              <SummarizeTool />
            </div>
        </Card>
      </div>
    </div>
  );
}
