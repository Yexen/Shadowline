
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BibleEntry, BiblePage } from '@/hooks/use-bible';
import { PlusCircle, Trash2, Sparkles, BookUser, List } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { ProfilePageEditor } from './profile-page-editor';

interface BibleEditorProps {
  entry: BibleEntry | null;
  category: string;
  onSave: (category: string, entry: BibleEntry) => void;
  onClose: () => void;
}

type EditorView = 'fields' | 'profile';

export function BibleEditor({ entry, category, onSave, onClose }: BibleEditorProps) {
  const [currentEntry, setCurrentEntry] = useState<BibleEntry | null>(null);
  const [view, setView] = useState<EditorView>('fields');
  const [editingPage, setEditingPage] = useState<BiblePage | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (entry) {
      // Create a deep copy to avoid direct mutation
      setCurrentEntry(JSON.parse(JSON.stringify(entry)));
      // Reset view when a new entry is opened
      setView('fields'); 
      setEditingPage(null);
    } else {
      setCurrentEntry(null);
    }
  }, [entry]);

  const handleFieldChange = (index: number, type: 'label' | 'value', value: string) => {
    if (!currentEntry) return;
    const newFields = [...(currentEntry.fields || [])];
    newFields[index][type] = value;
    setCurrentEntry({ ...currentEntry, fields: newFields });
  };

  const handleAddField = () => {
    if (!currentEntry) return;
    const newFields = [...(currentEntry.fields || []), { label: 'New Field', value: '' }];
    setCurrentEntry({ ...currentEntry, fields: newFields });
  };

  const handleRemoveField = (index: number) => {
    if (!currentEntry) return;
    const newFields = (currentEntry.fields || []).filter((_, i) => i !== index);
    setCurrentEntry({ ...currentEntry, fields: newFields });
  };

  const handleSave = () => {
    if (currentEntry && currentEntry.title) {
      // Filter out empty fields before saving
      const nonEmptyFields = (currentEntry.fields || []).filter(f => f.label.trim() !== '' || f.value.trim() !== '');
      onSave(category, { ...currentEntry, fields: nonEmptyFields });
      onClose();
    }
  };

  const handleSuggestFields = async () => {
    toast({
      variant: 'destructive',
      title: 'AI Offline',
      description: 'The AI field suggestion feature is temporarily disabled.',
    });
  };

  const handleTitleChange = (newTitle: string) => {
    if (!currentEntry) return;
    setCurrentEntry({ ...currentEntry, title: newTitle });
  }

  const handlePageSave = (page: BiblePage) => {
    if (!currentEntry) return;
    const pages = [...(currentEntry.pages || [])];
    const pageIndex = pages.findIndex(p => p.id === page.id);
    if (pageIndex > -1) {
        pages[pageIndex] = page;
    } else {
        pages.push(page);
    }
    setCurrentEntry({ ...currentEntry, pages });
    setEditingPage(null);
  };

  const handlePageDelete = (pageId: string) => {
      if (!currentEntry) return;
      const pages = (currentEntry.pages || []).filter(p => p.id !== pageId);
      setCurrentEntry({ ...currentEntry, pages });
      setEditingPage(null);
  };

  const handleAddNewPage = () => {
    setEditingPage({ id: `page-${Date.now()}`, title: 'New Page', content: '' });
  };


  const isOpen = !!entry;

  if (!currentEntry) {
    return null;
  }
  
  if (editingPage) {
    return <ProfilePageEditor page={editingPage} onSave={handlePageSave} onCancel={() => setEditingPage(null)} onDelete={handlePageDelete} />
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="font-headline">Edit Bible Entry</DialogTitle>
            <div className="flex items-center gap-1">
                <Button variant={view === 'fields' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('fields')}><List className="mr-2"/> Fields</Button>
                <Button variant={view === 'profile' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('profile')}><BookUser className="mr-2"/> Profile</Button>
            </div>
          </div>
          <DialogDescription>
            {view === 'fields' 
                ? `Update the details for this entry in the '${category}' category.`
                : `Manage detailed profile pages for '${currentEntry.title}'.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
            <Label htmlFor="title" className="font-bold text-base">Title</Label>
            <Input
              id="title"
              value={currentEntry.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., The Batcave"
              className="font-bold"
            />
        </div>

        {view === 'fields' ? (
           <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-base">Fields</Label>
                <Button variant="ghost" size="sm" onClick={handleSuggestFields} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : <><Sparkles className="mr-2 h-4 w-4" /> Suggest Fields</>}
                </Button>
              </div>
              <ScrollArea className="h-[300px] w-full pr-4">
                  <div className="space-y-4">
                    {(currentEntry.fields || []).map((field, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="grid flex-1 gap-1.5">
                          <Label htmlFor={`field-label-${index}`} className="text-xs">Label</Label>
                          <Input
                            id={`field-label-${index}`}
                            value={field.label}
                            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                            placeholder="e.g., Alias"
                          />
                        </div>
                        <div className="grid flex-1 gap-1.5">
                          <Label htmlFor={`field-value-${index}`} className="text-xs">Value</Label>
                          <Textarea
                            id={`field-value-${index}`}
                            value={field.value}
                            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                            placeholder="e.g., The Dark Knight"
                            className="min-h-[40px]"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveField(index)} className="mt-6">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
              </ScrollArea>
               <Button variant="outline" size="sm" onClick={handleAddField}>
                  <PlusCircle className="mr-2" /> Add New Field
                </Button>
            </div>
        ) : (
            <div className="space-y-4 py-4">
                <ScrollArea className="h-[300px] w-full pr-4">
                    <div className="space-y-2">
                        {(currentEntry.pages || []).length > 0 ? (
                           (currentEntry.pages || []).map(page => (
                               <div key={page.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => setEditingPage(page)}>
                                   <span className="font-medium">{page.title}</span>
                               </div>
                           ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No profile pages yet.</p>
                        )}
                    </div>
                </ScrollArea>
                <Button variant="outline" size="sm" onClick={handleAddNewPage}>
                  <PlusCircle className="mr-2" /> Add New Page
                </Button>
            </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
