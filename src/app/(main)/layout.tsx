'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
import { AppHeader } from '@/components/app-header';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { useBible, type BibleEntry } from '@/hooks/use-bible';
import { useWriters } from '@/hooks/use-writers';
import { useModalStore } from '@/hooks/use-modal-store';
import { useVolumes } from '@/hooks/use-volumes';
import { useTimer } from '@/hooks/use-timer';

import { BibleEditor } from '@/components/bible-editor';
import { WriterProfile } from '@/components/writer-profile';
import { SettingsDialog } from '@/components/settings-dialog';
import { VolumesSidebar } from '@/components/volumes-sidebar';
import { ChapterEditor } from '@/components/chapter-editor';

import {
  Home,
  PenSquare,
  BrainCircuit,
  Info,
  LogOut,
  FileText,
  Images,
  Settings,
  BookCopy,
  ClipboardList,
  Map as MapIcon,
  Search,
  Library,
  Book,
  MessageSquare,
  Globe,
  User,
  Gamepad2,
  Terminal, // <-- terminal icon
  PlusCircle,
} from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  useTimer();

  // --- Dev Console path (same-tab). Hidden if no key set.
  const devKey = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY || '';
  const devConsolePath = `/dev-console${devKey ? `?key=${encodeURIComponent(devKey)}` : ''}`;

  // Keyboard shortcut: ⌘/Ctrl + Alt + D
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (devKey) router.push(devConsolePath);
        else alert('Dev Console key not set (NEXT_PUBLIC_DEV_CONSOLE_KEY).');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [devKey, devConsolePath, router]);

  // ---- app data/hooks
  const { isLoaded: bibleLoaded, bibleData, addCategory, addOrUpdateEntry } = useBible();
  const { activeWriter, isLoaded: authLoaded, logout } = useWriters();
  const { modalType, modalData, closeModal } = useModalStore();
  const { getChapter, updateChapter, isLoaded: volumesLoaded } = useVolumes();

  // ---- local ui state
  const [editingEntry, setEditingEntry] = useState<{ category: string; entry: BibleEntry } | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [writerProfileOpen, setWriterProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [volumesSidebarOpen, setVolumesSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fa'>('en');
  const [editingChapter, setEditingChapter] = useState<{ volumeId: string; chapterId: string } | null>(null);

  // dir/lang sync
  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // client auth guard
  useEffect(() => {
    if (authLoaded && !activeWriter) router.push('/auth');
  }, [authLoaded, activeWriter, router]);

  // modal plumbing
  useEffect(() => {
    if (modalType === 'bible' && modalData?.bible) setEditingEntry(modalData.bible);
    if (modalType === 'chapter' && modalData?.chapter) setEditingChapter(modalData.chapter);
  }, [modalType, modalData]);

  // --- menu
  const baseMenu = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/editor', label: 'Editor', icon: PenSquare },
    { href: '/drafts', label: 'Drafts', icon: FileText },
    { href: '/gallery', label: 'Gallery', icon: Images },
    { href: '/games', label: 'Games', icon: Gamepad2 },
    { href: '/ai-tools', label: 'AI Tools', icon: BrainCircuit },
    { href: '/maps', label: 'Maps', icon: MapIcon },
    { href: '/organization', label: 'Organization', icon: ClipboardList },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/sources', label: 'Sources', icon: Book },
  ];
  const menuItems = devKey
    ? [...baseMenu, { href: devConsolePath, label: 'Dev Console', icon: Terminal }]
    : baseMenu;

  // --- handlers
  const handleSaveEntry = (category: string, entry: BibleEntry) => {
    addOrUpdateEntry(category, entry, editingEntry?.entry.title);
    setEditingEntry(null);
    closeModal();
  };
  const handleAddNewEntry = (category: string) =>
    setEditingEntry({ category, entry: { title: 'New Entry', fields: [{ label: 'Description', value: '' }] } });
  const handleAddNewCategory = () => {
    if (!newCategory.trim()) return;
    addCategory(newCategory.trim());
    setNewCategory('');
  };
  const handleCloseEditor = () => {
    setEditingEntry(null);
    closeModal();
  };
  const handleSaveChapter = (volumeId: string, chapterId: string, title: string, content: string) => {
    updateChapter(volumeId, chapterId, { title, content });
    closeModal();
    setEditingChapter(null);
  };

  // splash while auth loads
  if (!authLoaded || !activeWriter) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <BatLogo className="w-24 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center w-full p-2 group-data-[state=expanded]:justify-center group-data-[state=collapsed]:justify-center">
            <SidebarTrigger asChild>
              <div className="cursor-pointer group-data-[state=expanded]:w-32 group-data-[state=expanded]:h-20 group-data-[state=collapsed]:w-6 group-data-[state=collapsed]:h-3">
                <BatLogo />
              </div>
            </SidebarTrigger>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems
              .filter((i) => !['/nyxen'].includes(i.href))
              .map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() =>
                      item.label === 'Dev Console'
                        ? router.push(item.href)
                        : router.push(item.href.startsWith('/editor') ? '/editor/new' : item.href)
                    }
                    isActive={item.label !== 'Dev Console' && pathname.startsWith(item.href)}
                    tooltip={{ children: item.label, side: 'right', align: 'center' }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

            {/* Bible sheet */}
            <SidebarMenuItem>
              <Sheet>
                <SidebarMenuButton asChild tooltip={{ children: 'Bible', side: 'right', align: 'center' }}>
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
                      {bibleData.map((entry) => (
                        <AccordionItem value={entry.category} key={entry.category}>
                          <AccordionTrigger className="font-headline text-base">{entry.category}</AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2">
                              {entry.items.map((item) => (
                                <li
                                  key={item.title}
                                  className="p-2 rounded-md hover:bg-accent cursor-pointer"
                                  onClick={() => setEditingEntry({ category: entry.category, entry: item })}
                                >
                                  <h4 className="font-bold">{item.title}</h4>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {item.fields?.[0]?.value || 'No description'}
                                  </p>
                                </li>
                              ))}
                              <li>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2"
                                  onClick={() => handleAddNewEntry(entry.category)}
                                >
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

            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setVolumesSidebarOpen(true)} tooltip={{ children: 'Volumes', side: 'right', align: 'center' }}>
                <Library />
                <span>Volumes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push('/about')}
                isActive={pathname.startsWith('/about')}
                tooltip={{ children: 'About', side: 'right', align: 'center' }}
              >
                <Info />
                <span>About</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-2 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div role="button" className="flex items-center p-2 rounded-md hover:bg-accent w-full group cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={activeWriter?.avatarUrl}
                        alt={activeWriter?.name || 'Writer'}
                        data-ai-hint={activeWriter?.dataAiHint}
                        key={activeWriter?.avatarUrl}
                      />
                      <AvatarFallback>{activeWriter?.name?.charAt(0) || 'W'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold group-data-[state=collapsed]:hidden">
                      {activeWriter?.name || 'The Writer'}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{activeWriter?.name || 'The Writer'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{activeWriter?.email || ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {devKey && (
                  <>
                    <DropdownMenuItem onClick={() => router.push(devConsolePath)}>
                      <Terminal className="mr-2" />
                      Dev Console
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={() => setWriterProfileOpen(true)}>
                  <User className="mr-2" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe className="mr-2" />
                    Language
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage('fa')}>فارسی (Farsi)</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="mr-2" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <WriterProfile isOpen={writerProfileOpen} onClose={() => setWriterProfileOpen(false)} />

      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenUserManagement={() => setWriterProfileOpen(true)}
      />

      <VolumesSidebar open={volumesSidebarOpen} onOpenChange={setVolumesSidebarOpen} />

      {editingChapter && volumesLoaded && (
        <ChapterEditor
          chapter={getChapter(editingChapter.volumeId, editingChapter.chapterId)}
          volumeId={editingChapter.volumeId}
          onSave={handleSaveChapter}
          onClose={() => {
            closeModal();
            setEditingChapter(null);
          }}
        />
      )}
    </SidebarProvider>
  );
}
