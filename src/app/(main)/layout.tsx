
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
import { Home, PenSquare, BrainCircuit, Info, LogOut, FileText, Images, Settings, BookCopy, BookOpenCheck, ClipboardList, Bot, Map as MapIcon, Search } from 'lucide-react';
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
import { useModalStore } from '@/hooks/use-modal-store';
import { useVolumes, type Chapter } from '@/hooks/use-volumes';
import { ChapterEditor } from '@/components/chapter-editor';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { isLoaded: bibleLoaded, bibleData, addCategory, addOrUpdateEntry } = useBible();
  const { isLoaded: writersLoaded, activeWriter, logout } = useWriters();
  const { updateChapter } = useVolumes();
  const { modalType, modalData, closeModal } = useModalStore();

  const [editingEntry, setEditingEntry] = useState<{ category: string; entry: BibleEntry } | null>(null);
  const [editingChapter, setEditingChapter] = useState<{ volumeId: string; chapter: Chapter} | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [writerProfileOpen, setWriterProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [volumesOpen, setVolumesOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && writersLoaded && !activeWriter) {
      router.replace('/auth');
    }
  }, [isClient, writersLoaded, activeWriter, router]);

  useEffect(() => {
    if (modalType === 'bible' && modalData?.bible) {
      setEditingEntry(modalData.bible);
    } else if (modalType === 'chapter' && modalData?.chapter) {
      setEditingChapter(modalData.chapter);
    }
  }, [modalType, modalData]);


  const handleLogout = () => {
    logout();
    router.replace('/auth');
  };

  const menuItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/editor', label: 'Editor', icon: PenSquare },
    { href: '/drafts', label: 'Drafts', icon: FileText },
    { href: '/ai-tools', label: 'AI Tools', icon: BrainCircuit },
    { href: '/nyxen', label: 'Nyxen', icon: Bot },
    { href: '/gallery', label: 'Gallery', icon: Images },
    { href: '/maps', label: 'Maps', icon: MapIcon },
    { href: '/organization', label: 'Organization', icon: ClipboardList },
    { href: '/about', label: 'About', icon: Info },
  ];
  
  const handleSaveEntry = (category: string, entry: BibleEntry) => {
    addOrUpdateEntry(category, entry, editingEntry?.entry.title);
    setEditingEntry(null);
    closeModal();
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

  const handleCloseEditor = () => {
    setEditingEntry(null);
    closeModal();
  }

  const handleSaveChapter = (chapter: Chapter) => {
    if (editingChapter) {
        updateChapter(editingChapter.volumeId, chapter.id, chapter.title, chapter.content);
        setEditingChapter(null);
        closeModal();
    }
  };
  
  const handleCloseChapterEditor = () => {
    setEditingChapter(null);
    closeModal();
  }
  
  if (!isClient || !writersLoaded || !activeWriter) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <BatLogo className="w-24 h-12 animate-pulse text-primary" />
        </div>
      );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center group-data-[state=expanded]:justify-center group-data-[state=collapsed]:justify-center w-full p-2">
                 <SidebarTrigger asChild>
                    <div className="group-data-[state=expanded]:w-32 group-data-[state=expanded]:h-20 group-data-[state=collapsed]:w-6 group-data-[state=collapsed]:h-3 cursor-pointer">
                        <BatLogo />
                    </div>
                 </SidebarTrigger>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {menuItems.slice(0, 9).map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        onClick={() => router.push(item.href.startsWith('/editor') ? '/editor/new' : item.href)}
                        isActive={pathname.startsWith(item.href)}
                        tooltip={{ children: item.label, side: "right", align: "center" }}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setVolumesOpen(true)} tooltip={{ children: "Volumes", side: "right", align: "center" }}>
                       <BookOpenCheck />
                       <span>Volumes</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Sheet>
                        <SidebarMenuButton asChild tooltip={{ children: "Bible", side: "right", align: "center" }}>
                            <SheetTrigger asChild>
                                 <button className="flex w-full items-center gap-2">
                                    <BookCopy />
                                    <span>Bible</span>
                                 </button>
                             </SheetTrigger>
                        </SidebarMenuButton>
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
                </SidebarMenuItem>
                {menuItems.slice(9).map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                        onClick={() => router.push(item.href.startsWith('/editor') ? '/editor/new' : item.href)}
                        isActive={pathname.startsWith(item.href)}
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
        <SidebarFooter>
            <div className="p-2 border-t border-sidebar-border">
                <button className="flex items-center p-2 rounded-md hover:bg-accent w-full group" onClick={() => setWriterProfileOpen(true)}>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={activeWriter?.avatarUrl} alt={activeWriter?.name} data-ai-hint={activeWriter?.dataAiHint} />
                            <AvatarFallback>{activeWriter?.name.charAt(0) || 'W'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold group-data-[state=collapsed]:hidden">{activeWriter?.name || 'The Writer'}</span>
                    </div>
                     <div className="opacity-0 group-hover:opacity-100 group-data-[state=collapsed]:hidden ml-auto">
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
        onClose={handleCloseEditor}
        onSave={handleSaveEntry}
      />
      
      {editingChapter && (
        <ChapterEditor 
            chapter={editingChapter.chapter}
            onSave={handleSaveChapter}
            onClose={handleCloseChapterEditor}
        />
      )}

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
