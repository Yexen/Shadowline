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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AppHeader } from '@/components/app-header';
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
  BookOpenCheck,
  ClipboardList,
  Map as MapIcon,
  Search,
  PlusCircle,
  Library,
  Gamepad2,
  Crown,
  NotebookPen,
  FolderOpen,
  MessageSquare,
  Book,
  Terminal,
  Trash2
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useBible, type BibleEntry } from '@/hooks/use-bible';
import { useVolumes } from '@/hooks/use-volumes';
import { useModalStore } from '@/hooks/use-modal-store';
import { useWriters } from '@/hooks/use-writers';
import { useTimer } from '@/hooks/use-timer';
import { useAuth } from '@/hooks/use-auth';

import { BibleEditor } from '@/components/bible-editor';
import { WriterProfile } from '@/components/writer-profile';
import { SettingsDialog } from '@/components/settings-dialog';
import { VolumesSidebar } from '@/components/volumes-sidebar';
import { ChapterEditor } from '@/components/chapter-editor';

import {
  useProfilerStore,
  type Profile,
  type ProfileTag,
  type TagColor
} from '@/hooks/use-profiler-store';

const tagColors: Record<TagColor, string> = {
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const DEV_CONSOLE_PATH = '/dev-console';

const menuItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/editor', label: 'Editor', icon: PenSquare },
  { href: '/drafts', label: 'Drafts', icon: FileText },
  { href: '/gallery', label: 'Gallery', icon: Images },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/ai-tools', label: 'AI Tools', icon: BrainCircuit },
  { href: '/council-chamber', label: 'Discussion', icon: Crown },
  { href: '/maps', label: 'Maps', icon: MapIcon },
  { href: '/batcave-archive', label: 'Notebook', icon: NotebookPen },
  { href: '/classification', label: 'Classification', icon: FolderOpen },
  { href: '/organization', label: 'Organization', icon: ClipboardList },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/sources', label: 'Sources', icon: Book },
  { href: '/about', label: 'About', icon: Info },
  { href: '/settings', label: 'Settings', icon: Settings },
  // Always show Dev Console
  { href: DEV_CONSOLE_PATH, label: 'Dev Console', icon: Terminal },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { isLoaded: bibleLoaded, bibleData, addCategory, addOrUpdateEntry, deleteEntry, deleteCategory } = useBible();
  const { activeWriter } = useWriters();
  const { modalType, modalData, closeModal, openModal } = useModalStore();
  const { volumes, updateChapter, getChapter } = useVolumes();
  const { logout } = useAuth();

  const [editingEntry, setEditingEntry] = useState<{ category: string; entry: BibleEntry } | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [writerProfileOpen, setWriterProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [volumesSheetOpen, setVolumesSheetOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [editingVolumeId, setEditingVolumeId] = useState<string>('');

  useEffect(() => {
    if (modalType === 'bible' && modalData?.bible) {
      setEditingEntry(modalData.bible);
    }
  }, [modalType, modalData]);

  useEffect(() => {
    if (modalType === 'chapter' && modalData?.chapter) {
      console.log('Chapter modal triggered with data:', modalData.chapter);
      const { volumeId, chapterId } = modalData.chapter;
      const chapter = getChapter(volumeId, chapterId);
      console.log('Found chapter:', chapter);
      setEditingChapter(chapter);
      setEditingVolumeId(volumeId);
    }
  }, [modalType, modalData, getChapter]);

  const handleSaveEntry = (category: string, entry: BibleEntry) => {
    addOrUpdateEntry(category, entry, editingEntry?.entry.title);
    setEditingEntry(null);
    closeModal();
  };

  const handleDeleteEntry = (category: string, entryTitle: string) => {
    deleteEntry(category, entryTitle);
    setEditingEntry(null);
    closeModal();
  };

  const handleViewOnMap = (locationName: string) => {
    // Store the location to highlight in localStorage for the map to read
    localStorage.setItem('map-highlight-location', locationName);
    // Navigate to the 3D Gotham map
    router.push('/maps?map=map-gotham-3d');
    // Close the Bible editor
    setEditingEntry(null);
    closeModal();
  };

  const handleAddNewEntry = (category: string) => {
    setEditingEntry({ category, entry: { title: 'New Entry', fields: [{label: "Description", value: ""}] } });
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
        addCategory(newCategory.trim());
        setNewCategory('');
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (confirm(`Are you sure you want to delete the "${categoryName}" category and all its entries? This action cannot be undone.`)) {
      deleteCategory(categoryName);
    }
  };

  const handleCloseEditor = () => {
    setEditingEntry(null);
    closeModal();
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-center w-full p-2">
            <SidebarTrigger asChild>
              <div className="w-10 h-10 cursor-pointer">
                <BatLogo />
              </div>
            </SidebarTrigger>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {menuItems.slice(0, 7).map((item) => (
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

            {/* Bible Sheet */}
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
                      {/* Show all available categories including new ones */}
                      {['Characters', 'Locations', 'Gadgets', 'Vehicles', 'Animals', 'Couples', 'Resources', 'Factions'].map(categoryName => {
                        const categoryData = bibleData.find(entry => entry.category === categoryName);
                        const items = categoryData?.items || [];
                        
                        return (
                          <AccordionItem value={categoryName} key={categoryName}>
                            <AccordionTrigger className="font-headline text-base">
                              <div className="flex items-center justify-between w-full pr-4">
                                <span>{categoryName} {items.length > 0 && `(${items.length})`}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {items.map(item => (
                                  <li key={item.title} className="p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => setEditingEntry({ category: categoryName, entry: item })}>
                                    <h4 className="font-bold">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground truncate">{item.fields?.[0]?.value || 'No description'}</p>
                                  </li>
                                ))}
                                {items.length === 0 && (
                                  <li className="p-2 text-sm text-muted-foreground text-center">
                                    No entries yet
                                  </li>
                                )}
                                <li>
                                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleAddNewEntry(categoryName)}>
                                    <PlusCircle className="mr-2" /> Add New Entry
                                  </Button>
                                </li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                      
                      {/* Show any additional custom categories that might exist */}
                      {bibleData.filter(entry => !['Characters', 'Locations', 'Gadgets', 'Vehicles', 'Animals', 'Couples', 'Resources', 'Factions'].includes(entry.category)).map(entry => (
                        <AccordionItem value={entry.category} key={entry.category}>
                          <AccordionTrigger className="font-headline text-base">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span>{entry.category} ({entry.items.length})</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(entry.category);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </AccordionTrigger>
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

            {/* Volumes */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setVolumesSheetOpen(true)}
                tooltip={{ children: "Volumes", side: "right", align: "center" }}
              >
                <Library />
                <span>Volumes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {menuItems.slice(7).map((item) => (
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
                <div className="p-2 rounded-md hover:bg-accent cursor-pointer" onClick={(e) => { e.stopPropagation(); logout(); }}>
                  <LogOut className="h-4 w-4" />
                </div>
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

      {/* Bible Editor */}
      <BibleEditor 
        entry={editingEntry?.entry ?? null}
        category={editingEntry?.category ?? ''}
        onClose={handleCloseEditor}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        onViewOnMap={handleViewOnMap}
      />
      
      {/* Writer Profile */}
      <WriterProfile 
        isOpen={writerProfileOpen}
        onClose={() => setWriterProfileOpen(false)}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Volumes Sidebar */}
      <VolumesSidebar 
        open={volumesSheetOpen}
        onOpenChange={setVolumesSheetOpen}
      />

      {/* Chapter Editor */}
      {editingChapter && editingVolumeId && (
        <ChapterEditor
          chapter={editingChapter}
          volumeId={editingVolumeId}
          onSave={(volumeId: string, chapterId: string, title: string, content: string) => {
            updateChapter(volumeId, chapterId, { title, content });
            closeModal();
            setEditingChapter(null);
            setEditingVolumeId('');
          }}
          onClose={() => {
            closeModal();
            setEditingChapter(null);
            setEditingVolumeId('');
          }}
        />
      )}
      
    </SidebarProvider>
  );
}