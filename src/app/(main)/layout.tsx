'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { BatLogo } from '@/components/bat-logo';
import { BatSignal } from '@/components/bat-signal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, PenSquare, BrainCircuit, Info, LogOut, FilePlus, BookCopy } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Mock data, in a real app this would come from a database or API
const bibleEntries = [
    { category: "Characters", items: [{ title: "The Joker", snippet: "An agent of chaos..." }, { title: "Catwoman", snippet: "Selina Kyle, a cat burglar..." }] },
    { category: "Locations", items: [{ title: "Arkham Asylum", snippet: "A psychiatric hospital for the criminally insane..." }, { title: "The Batcave", snippet: "Batman's secret headquarters..." }] },
    { category: "Gadgets", items: [{ title: "Batarang", snippet: "A bat-shaped throwing weapon..." }, { title: "Grapple Gun", snippet: "A device to fire a grappling hook..." }] },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!loggedIn) {
        router.replace('/login');
      }
    } catch (e) {
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('isLoggedIn');
    } finally {
      router.replace('/login');
    }
  };

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/editor', label: 'Editor', icon: PenSquare },
    { href: '/ai-tools', label: 'AI Tools', icon: BrainCircuit },
    { href: '/about', label: 'About', icon: Info },
  ];

  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p className="font-headline text-muted-foreground">CHECKING CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
                <BatLogo className="w-24 h-12 text-primary" />
                <BatSignal />
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        onClick={() => router.push(item.href.startsWith('/editor') ? '/editor/new-draft' : item.href)}
                        isActive={pathname === item.href || (item.href === '/editor' && pathname.startsWith('/editor'))}
                        tooltip={{ children: item.label, side: "right", align: "center" }}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>Drafts</SidebarGroupLabel>
                {/* Draft list would be populated from localStorage hook here */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => router.push('/editor/new-draft')} variant="outline">
                            <FilePlus />
                            <span>New Draft</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <BookCopy className="size-4" />
                        <span className="font-headline">BIBLE</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="font-headline">GOTHAM BIBLE</SheetTitle>
                    </SheetHeader>
                    <Accordion type="single" collapsible className="w-full mt-4">
                        {bibleEntries.map(entry => (
                            <AccordionItem value={entry.category} key={entry.category}>
                                <AccordionTrigger className="font-headline text-base">{entry.category}</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2">
                                        {entry.items.map(item => (
                                            <li key={item.title} className="p-2 rounded-md hover:bg-accent cursor-pointer">
                                                <h4 className="font-bold">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground">{item.snippet}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </SheetContent>
            </Sheet>
            <SidebarSeparator />
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/40x40" alt="Writer" data-ai-hint="batman avatar" />
                        <AvatarFallback>W</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">The Writer</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="group-data-[collapsible=icon]:hidden">
                    <LogOut />
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 md:hidden">
                <SidebarTrigger />
                <h2 className="font-headline text-lg uppercase">{pathname.split('/').pop() || 'Home'}</h2>
            </div>
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
