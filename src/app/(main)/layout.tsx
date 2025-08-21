

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
import { Home, PenSquare, BrainCircuit, Info, LogOut, FilePlus, BookCopy, PlusCircle, Images, ImagePlus, Shield } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useBible, type BibleEntry } from '@/hooks/use-bible';
import { BibleEditor } from '@/components/bible-editor';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AppHeader } from '@/components/app-header';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLogo } from '@/hooks/use-logo';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  const { isLoaded, bibleData, addCategory, addOrUpdateEntry } = useBible();
  const [editingEntry, setEditingEntry] = useState<{ category: string; entry: BibleEntry } | null>(null);
  const [newCategory, setNewCategory] = useState('');

  // Logo upload state
  const { setLogoUrl } = useLogo();
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setLogoUrl(loadEvent.target?.result as string);
            setLogoDialogOpen(false);
        };
        reader.readAsDataURL(file);
    }
  }


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
                        isActive={pathname === item.href || (item.href === '/editor' && pathname.startsWith('/editor')) || (item.href === '/gallery' && pathname.startsWith('/gallery'))}
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
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="font-headline">GOTHAM BIBLE</SheetTitle>
                    </SheetHeader>
                    {!isLoaded ? (
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

             <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <Shield className="size-4" />
                        <span className="font-headline">CHANGE LOGO</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change App Logo</DialogTitle>
                        <DialogDescription>
                            Upload a new logo for the application. SVG, PNG, or JPG are recommended.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                         <Label>Upload from device</Label>
                        <Input type="file" accept="image/*" className="hidden" ref={logoFileInputRef} onChange={handleLogoFileSelect} />
                        <Button variant="outline" className="w-full mt-2" onClick={() => logoFileInputRef.current?.click()}>Browse Device</Button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLogoDialogOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
    </SidebarProvider>
  );
}
