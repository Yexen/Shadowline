'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BibleEntry, BiblePage, BibleField, BibleFixedFields, BibleRelationship } from '@/hooks/use-bible';
import { 
  ALIGNMENT_OPTIONS,
  AFFILIATION_OPTIONS,
  RELATIONSHIP_TYPES,
  LOCATION_THREAT_LEVEL_OPTIONS,
  CONTROL_OPTIONS,
  FUNCTION_OPTIONS,
  DISTRICT_OPTIONS,
  GADGET_TYPE_OPTIONS,
  CREATOR_OPTIONS,
  VEHICLE_MANUFACTURER_OPTIONS,
  ANIMAL_ROLE_OPTIONS,
  RELATIONSHIP_STATUS_OPTIONS,
  RESOURCE_STATUS_OPTIONS,
  FACTION_ALIGNMENT_OPTIONS
} from '@/hooks/use-bible';
import { PlusCircle, Trash2, Sparkles, BookUser, List, Loader2, Upload, Download, Eye, Edit, Camera, Users, FileText, Plus, FileUp, MapPin, Bot, Network, Clock } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card } from './ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ProfilePageEditor } from './profile-page-editor';
import { suggestBibleFields } from '@/ai/flows/bible-fields-flow';
import { RelationshipMindmap } from './relationship-mindmap';
import { BackstoryTimeline } from './backstory-timeline';

interface BibleEditorContentProps {
  entry: BibleEntry | null;
  category: string;
  onSave: (category: string, entry: BibleEntry) => void;
  onDelete?: (category: string, entryTitle: string) => void;
  onViewOnMap?: (locationName: string) => void;
}

// This component is the same as BibleEditor but without the Dialog wrapper
export function BibleEditorContent({ entry, category, onSave, onDelete, onViewOnMap }: BibleEditorContentProps) {
  // For now, just render a placeholder - we'll copy the actual content from BibleEditor later
  return (
    <div className="max-w-4xl max-h-[90vh] flex flex-col h-full">
      <div className="space-y-3 p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{entry?.title || 'Bible Editor'}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {category === 'Locations' && onViewOnMap && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewOnMap(entry?.title || '')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={entry?.title || ''} readOnly />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} readOnly />
          </div>
          
          {entry?.fields && (
            <div className="space-y-3">
              <Label>Fields</Label>
              {entry.fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Textarea 
                    value={field.value} 
                    readOnly 
                    className="min-h-[100px]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}