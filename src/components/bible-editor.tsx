
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
import type { BibleEntry } from '@/hooks/use-bible';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface BibleEditorProps {
  entry: BibleEntry | null;
  category: string;
  onSave: (category: string, entry: BibleEntry) => void;
  onClose: () => void;
}

export function BibleEditor({ entry, category, onSave, onClose }: BibleEditorProps) {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setFields(entry.fields || []);
    } else {
      setTitle('');
      setFields([]);
    }
  }, [entry]);

  const handleFieldChange = (index: number, type: 'label' | 'value', value: string) => {
    const newFields = [...fields];
    newFields[index][type] = value;
    setFields(newFields);
  };

  const handleAddField = () => {
    setFields([...fields, { label: 'New Field', value: '' }]);
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const handleSave = () => {
    if (title) {
      // Filter out empty fields before saving
      const nonEmptyFields = fields.filter(f => f.label.trim() !== '' || f.value.trim() !== '');
      onSave(category, { title, fields: nonEmptyFields });
      onClose();
    }
  };

  const isOpen = !!entry;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Bible Entry</DialogTitle>
          <DialogDescription>
            Update the details for this entry in the '{category}' category. Add, edit, or remove fields as needed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-bold text-base">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Batcave"
              className="font-bold"
            />
          </div>
          
          <Label className="font-bold text-base">Fields</Label>
          <ScrollArea className="h-[300px] w-full pr-4">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={index} className="flex items-end gap-2">
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
                      <Input
                        id={`field-value-${index}`}
                        value={field.value}
                        onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                        placeholder="e.g., The Dark Knight"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveField(index)}>
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
