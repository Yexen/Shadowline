

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
} from '@/components/ui/sidebar';
import { BatLogo } from '@/components/bat-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, PenSquare, BrainCircuit, Info, LogOut, FileText, Images, Settings, BookCopy, BookOpenCheck } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useBible, type BibleEntry } from '@/hooks/use-bible';
import { BibleEditor } from '@/components/bible-editor';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AppHeader } from '@/components/app-header';
import { useWriters } from '@/hooks/use-writers';
import { WriterProfile } from '@/components/writer-profile';
import { SettingsDialog } from '@/components/settings-dialog';
import { VolumesSidebar } from '@/components/volumes-sidebar';
import { PlusCircle } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  const { isLoaded: bibleLoaded, bibleData, addCategory, addOrUpdateEntry } = useBible();
  const { writers, activeWriter, isLoaded: writersLoaded } = useWriters();

  const [editingEntry, setEditingEntry] = useState<{ category: string; entry: BibleEntry } | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [writerProfileOpen, setWriterProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [volumesOpen, setVolumesOpen] = useState(false);


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
    { href: '/home', label: 'Home', icon: Home },
    { href: '/editor', label: 'Editor', icon: PenSquare },
    { href: '/drafts', label: 'Drafts', icon: FileText },
    { href: '/ai-tools', label: 'AI Tools', icon: BrainCircuit },
    { href: '/gallery', label: 'Gallery', icon: Images },
    { href: '/about', label: 'About', icon: Info },
  ];
  
  const handleSaveEntry = (category: string, entry: BibleEntry) => {
    addOrUpdateEntry(category, entry, editingEntry?.entry.title);
    setEditingEntry(null);
  }

  const handleAddNewEntry = (category: string) => {
    setEditingEntry({ category, entry: { title: 'New Entry', fields: [{label: "Description", value: ""}] } });
  }

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
        addCategory(newCategory.trim());
        setNewCategory('');
    }
  }


  if (!isClient || !writersLoaded) {
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
        <SidebarHeader>
            <div className="flex items-center group-data-[state=expanded]:justify-between group-data-[state=collapsed]:justify-center w-full p-2">
                 <BatLogo className="w-24 h-12 text-primary group-data-[state=collapsed]:hidden" />
                 <SidebarTrigger>
                    <BatLogo className="w-6 h-3 text-primary" />
                 </SidebarTrigger>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        onClick={() => router.push(item.href.startsWith('/editor') ? '/editor/new' : item.href)}
                        isActive={pathname === item.href || (item.href === '/editor' && pathname.startsWith('/editor')) || (item.href === '/drafts' && pathname.startsWith('/drafts')) || (item.href === '/gallery' && pathname.startsWith('/gallery'))}
                        tooltip={{ children: item.label, side: "right", align: "center" }}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setSettingsOpen(true)} tooltip={{ children: "Settings", side: "right", align: "center" }}>
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t-0 mt-0">
             <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setVolumesOpen(true)} tooltip={{ children: "Volumes", side: "right", align: "center" }} className="font-headline text-base group-data-[state=collapsed]:justify-center">
                    <BookOpenCheck />
                    <span className="group-data-[state=collapsed]:hidden">Volumes</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <Sheet>
                <SheetTrigger asChild>
                     <SidebarMenuItem>
                        <SidebarMenuButton tooltip={{ children: "Bible", side: "right", align: "center" }} className="font-headline text-base group-data-[state=collapsed]:justify-center">
                            <BookCopy />
                            <span className="group-data-[state=collapsed]:hidden">Bible</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="font-headline">GOTHAM BIBLE</SheetTitle>
                    </SheetHeader>
                    {!bibleLoaded ? (
                        <div className="space-y-4 mt-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                    <Accordion type="single" collapsible className="w-full mt-4 flex-grow overflow-y-auto">
                        {bibleData.map(entry => (
                            <AccordionItem value={entry.category} key={entry.category}>
                                <AccordionTrigger className="font-headline text-base">{entry.category}</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2">
                                        {entry.items.map(item => (
                                            <li key={item.title} className="p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => setEditingEntry({ category: entry.category, entry: item })}>
                                                <h4 className="font-bold">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground truncate">{item.fields?.[0]?.value || 'No description'}</p>
                                            </li>
                                        ))}
                                        <li>
                                            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleAddNewEntry(entry.category)}>
                                                <PlusCircle className="mr-2" /> Add New Entry
                                            </Button>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    )}
                     <div className="mt-auto border-t pt-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="New Category Name..."
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNewCategory()}
                            />
                            <Button onClick={handleAddNewCategory}>Add</Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <div className="p-2 border-t border-sidebar-border">
                <button className="flex items-center p-2 rounded-md hover:bg-accent w-full group" onClick={() => setWriterProfileOpen(true)}>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={activeWriter?.avatarUrl} alt={activeWriter?.name} data-ai-hint="writer avatar" />
                            <AvatarFallback>{activeWriter?.name.charAt(0) || 'W'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold group-data-[state=collapsed]:hidden">{activeWriter?.name || 'The Writer'}</span>
                    </div>
                     <div className="opacity-0 group-hover:opacity-100 group-data-[state=collapsed]:hidden">
                        <LogOut onClick={(e) => { e.stopPropagation(); handleLogout(); }}/>
                    </div>
                </button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6">
            <AppHeader />
            {children}
        </div>
      </SidebarInset>

      <BibleEditor 
        entry={editingEntry?.entry ?? null}
        category={editingEntry?.category ?? ''}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEntry}
      />

      <WriterProfile 
        isOpen={writerProfileOpen}
        onClose={() => setWriterProfileOpen(false)}
      />

      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <VolumesSidebar
        isOpen={volumesOpen}
        onClose={() => setVolumesOpen(false)}
      />

    </SidebarProvider>
  );
}
