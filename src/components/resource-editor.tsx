
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Volume, Resource } from '@/hooks/use-volumes';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Input } from './ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface ResourceEditorProps {
  volume: Volume | null | undefined;
  onClose: () => void;
  onAddResource: (volumeId: string) => void;
  onUpdateResource: (volumeId: string, resourceId: string, updates: Partial<Omit<Resource, 'id'>>) => void;
  onDeleteResource: (volumeId: string, resourceId: string) => void;
}

export function ResourceEditor({ volume, onClose, onAddResource, onUpdateResource, onDeleteResource }: ResourceEditorProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
  
  if (!volume) {
    return null;
  }

  return (
    <Dialog open={!!volume} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">Resources: {volume.title}</DialogTitle>
          <DialogDescription>
            Manage research materials, notes, and links for this volume.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          {(volume.resources || []).length > 0 ? (
            <Accordion type="single" collapsible className="w-full" value={activeAccordion} onValueChange={setActiveAccordion}>
                {(volume.resources || []).map(resource => (
                  <AccordionItem value={resource.id} key={resource.id}>
                    <AccordionTrigger>
                        <span className="truncate flex-grow text-left">{resource.title}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <Input
                          placeholder="Resource Title"
                          value={resource.title}
                          onChange={(e) => onUpdateResource(volume.id, resource.id, { title: e.target.value })}
                          className="font-semibold"
                        />
                        <Textarea
                          value={resource.content}
                          onChange={(e) => onUpdateResource(volume.id, resource.id, { content: e.target.value })}
                          className="min-h-[150px] resize-y"
                          placeholder="Resource content, notes, or links..."
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm"><Trash2 className="mr-2"/> Delete Resource</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the resource: "{resource.title}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteResource(volume.id, resource.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-16">No resources for this volume yet.</p>
          )}
        </ScrollArea>
        <DialogFooter className="justify-between">
            <Button variant="outline" onClick={() => onAddResource(volume.id)}>
                <PlusCircle className="mr-2"/> Add Resource
            </Button>
            <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
