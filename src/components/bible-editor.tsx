
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
import { PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { generateBibleFields, GenerateBibleFieldsInput } from '@/ai/flows/generate-bible-fields';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';

interface BibleEditorProps {
  entry: BibleEntry | null;
  category: string;
  onSave: (category: string, entry: BibleEntry) => void;
  onClose: () => void;
}

export function BibleEditor({ entry, category, onSave, onClose }: BibleEditorProps) {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<{ label: string; value: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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

  const handleSuggestFields = async () => {
    if (!title) {
        toast({
            variant: 'destructive',
            title: 'Title Required',
            description: 'Please enter a title for the entry first.',
        });
        return;
    }
    setIsGenerating(true);
    try {
        const input: GenerateBibleFieldsInput = { category, title };
        const result = await generateBibleFields(input);
        if (result.fields) {
            const newFields = result.fields.map(label => ({ label, value: '' }));
            setFields(prevFields => [...(prevFields || []), ...newFields]);
        }
    } catch (error) {
        console.error("Failed to suggest fields:", error);
        toast({
            variant: 'destructive',
            title: 'AI Error',
            description: 'Could not generate field suggestions.',
        });
    } finally {
        setIsGenerating(false);
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
          
          <div className="flex justify-between items-center">
            <Label className="font-bold text-base">Fields</Label>
            <Button variant="ghost" size="sm" onClick={handleSuggestFields} disabled={isGenerating}>
              {isGenerating ? "Generating..." : <><Sparkles className="mr-2 h-4 w-4" /> Suggest Fields</>}
            </Button>
          </div>

          <ScrollArea className="h-[300px] w-full pr-4">
              <div className="space-y-4">
                {fields.map((field, index) => (
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
