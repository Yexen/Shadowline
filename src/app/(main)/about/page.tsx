
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info, Github, Twitter, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

const translations = {
  en: {
    pageDescription: "The story behind the Shadows of Gotham Writer's Protocol.",
    writer: "The Writer",
    creator: "Creator & Guardian of Gotham's Stories",
    p1: "Shadows of Gotham Writer was forged in the heart of the city's darkness, born from a need for a dedicated space where tales of heroism, villainy, and the complex morality of Gotham could be crafted without distraction. This tool is more than just a text editor; it is a sanctuary for chroniclers of the night.",
    p2: "Built with cutting-edge Wayne Enterprises technology (simulated via Next.js, TypeScript, and Tailwind CSS), this application provides a secure, immersive environment. Every feature, from the AI-powered 'Oracle' tools to the integrated 'Gotham Bible' for lore management, is designed to empower writers to bring their visions of Gotham to life.",
    p3: "This is a personal project, a love letter to the enduring legacy of the Dark Knight and the universe he protects. It stands as a testament to the power of stories and the inspiration found within the shadows.",
    connect: "CONNECT WITH THE CREATOR",
  },
  fa: {
    pageDescription: "داستان پشت پروتکل نویسندگی سایه‌های گاتهام.",
    writer: "نویسنده",
    creator: "خالق و نگهبان داستان‌های گاتهام",
    p1: "نویسنده سایه‌های گاتهام در قلب تاریکی شهر شکل گرفت، از نیازی برای فضایی اختصاصی که در آن داستان‌های قهرمانی، شرارت و اخلاقیات پیچیده گاتهام بتواند بدون حواس‌پرتی خلق شود. این ابزار چیزی بیش از یک ویرایشگر متن است؛ پناهگاهی برای وقایع‌نگاران شب است.",
    p2: "این برنامه که با فناوری پیشرفته وین اینترپرایز (شبیه‌سازی شده با Next.js، TypeScript و Tailwind CSS) ساخته شده، یک محیط امن و فراگیر فراهم می‌کند. هر ویژگی، از ابزارهای هوش مصنوعی 'اوراکل' گرفته تا 'کتاب مقدس گاتهام' برای مدیریت دانش، برای توانمندسازی نویسندگان در به تصویر کشیدن دیدگاه‌هایشان از گاتهام طراحی شده است.",
    p3: "این یک پروژه شخصی است، نامه‌ای عاشقانه به میراث ماندگار شوالیه تاریکی و جهانی که او از آن محافظت می‌کند. این ابزار گواهی بر قدرت داستان‌ها و الهامی است که در سایه‌ها یافت می‌شود.",
    connect: "ارتباط با خالق",
  }
};

export default function AboutPage() {
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
          {t.pageDescription}
        </p>
      </div>

      <Card className="overflow-hidden bg-card">
        <Image src="https://placehold.co/1200x400.png" alt="Gotham skyline" width={1200} height={400} className="w-full h-48 object-cover" data-ai-hint="gotham city dark" />
        <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
                <Avatar className="w-32 h-32 border-4 border-background ring-2 ring-primary">
                    <AvatarImage src="https://placehold.co/128x128.png" data-ai-hint="writer portrait" />
                    <AvatarFallback className="text-4xl font-headline">W</AvatarFallback>
                </Avatar>
                <div className="pt-16">
                    <h2 className="font-headline text-3xl font-bold">{t.writer}</h2>
                    <p className="text-primary">{t.creator}</p>
                </div>
            </div>

            <div className="mt-6 space-y-4 text-lg text-foreground/80">
                <p>{t.p1}</p>
                <p>{t.p2}</p>
                <p>{t.p3}</p>
            </div>
            
            <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="font-headline text-muted-foreground">{t.connect}</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon"><Github /></Button>
                    <Button variant="outline" size="icon"><Twitter /></Button>
                    <Button variant="outline" size="icon"><Mail /></Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
