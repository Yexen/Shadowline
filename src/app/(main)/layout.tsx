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
  Terminal, // terminal icon
  PlusCircle,
} from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  useTimer();

  // --- Dev Console path (always visible)
  const DEV_CONSOLE_PATH = '/dev-console';

  // Keyboard shortcut: ⌘/Ctrl + Alt + D
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        router.push(DEV_CONSOLE_PATH);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  // Helper to compare paths ignoring query strings
  const pathOnly = (p?: string | null) => (p || '').split('?')[0];
  const currentPath = pathOnly(pathname);

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
  const menuItems = [
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
    { href: DEV_CONSOLE_PATH, label: 'Dev Console', icon: Terminal },
  ];

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
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  onClick={() => {
                    if (item.label !== 'Dev Console' && item.href.startsWith('/editor')) {
                      router.push('/editor/new');
                    } else {
                      router.push(item.href);
                    }
                  }}
                  isActive={
                    item.label === 'Dev Console'
                      ? currentPath === DEV_CONSOLE_PATH
                      : currentPath.startsWith(item.href)
                  }
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
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

                <DropdownMenuItem onClick={() => router.push(DEV_CONSOLE_PATH)}>
                  <Terminal className="mr-2" />
                  Dev Console
                </DropdownMenuItem>
                <DropdownMenuSeparator />

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
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>

      <BibleEditor
        entry={editingEntry?.entry ?? null}
        category={editingEntry?.category ?? ''}
        onClose={() => {
          setEditingEntry(null);
          closeModal();
        }}
        onSave={(cat, entry) => {
          addOrUpdateEntry(cat, entry, editingEntry?.entry.title);
          setEditingEntry(null);
          closeModal();
        }}
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
          onSave={(v, c, t, cont) => {
            updateChapter(v, c, { title: t, content: cont });
            closeModal();
            setEditingChapter(null);
          }}
          onClose={() => {
            closeModal();
            setEditingChapter(null);
          }}
        />
      )}
    </SidebarProvider>
  );
}
