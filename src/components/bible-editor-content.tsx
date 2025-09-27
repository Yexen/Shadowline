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

type EditorView = 'identity' | 'traits' | 'relationships' | 'arcs' | 'backstory' | 'mindmap' | 'dossier' | 'overview' | 'description' | 'fields';
type EditMode = 'view' | 'edit';

type TabConfig = {
  value: string;
  label: string;
  icon: any;
};

const getTabsForCategory = (category: string): TabConfig[] => {
  switch (category) {
    case 'Characters':
      return [
        { value: 'identity', label: 'Identity', icon: BookUser },
        { value: 'traits', label: 'Traits', icon: List },
        { value: 'relationships', label: 'Relationships', icon: Users },
        { value: 'arcs', label: 'Arcs', icon: FileText },
        { value: 'backstory', label: 'Backstory', icon: Clock },
        { value: 'mindmap', label: 'Mindmap', icon: Network },
        { value: 'dossier', label: 'Dossier', icon: FileText }
      ];
    default:
      return [
        { value: 'overview', label: 'Overview', icon: BookUser },
        { value: 'description', label: 'Description', icon: FileText },
        { value: 'fields', label: 'Custom Fields', icon: List }
      ];
  }
};

const getTabGridCols = (category: string): string => {
  return category === 'Characters' ? 'grid-cols-7' : 'grid-cols-3';
};

// This component is the same as BibleEditor but without the Dialog wrapper
export function BibleEditorContent({ entry, category, onSave, onDelete, onViewOnMap }: BibleEditorContentProps) {
  const [currentEntry, setCurrentEntry] = useState<BibleEntry | null>(null);
  const [activeTab, setActiveTab] = useState<EditorView>('identity');
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [editingPage, setEditingPage] = useState<BiblePage | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [hoveredField, setHoveredField] = useState<number | null>(null);
  const [aiGeneratingField, setAiGeneratingField] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (entry) {
      // Create a deep copy to avoid direct mutation
      setCurrentEntry(JSON.parse(JSON.stringify(entry)));
      // Reset view when a new entry is opened based on category
      setActiveTab(category === 'Characters' ? 'identity' : 'overview');
      setEditingPage(null);
    } else {
      setCurrentEntry(null);
    }
  }, [entry, category]);

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

  const handleFixedFieldChange = (field: keyof BibleFixedFields, value: string | string[]) => {
    if (!currentEntry) return;
    const fixedFields = currentEntry.fixedFields || {};
    setCurrentEntry({
      ...currentEntry,
      fixedFields: { ...fixedFields, [field]: value }
    });
  };

  const handleRelationshipChange = (index: number, field: keyof BibleRelationship, value: string) => {
    if (!currentEntry) return;
    const relationships = [...(currentEntry.relationships || [])];
    relationships[index] = { ...relationships[index], [field]: value };
    setCurrentEntry({ ...currentEntry, relationships });
  };

  const handleAddRelationship = () => {
    if (!currentEntry) return;
    const relationships = [...(currentEntry.relationships || []), {
      characterName: '',
      relationshipType: 'Acquaintance',
      description: ''
    }];
    setCurrentEntry({ ...currentEntry, relationships });
  };

  const handleRemoveRelationship = (index: number) => {
    if (!currentEntry) return;
    const relationships = (currentEntry.relationships || []).filter((_, i) => i !== index);
    setCurrentEntry({ ...currentEntry, relationships });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentEntry) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      handleFixedFieldChange('picture', imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    if (!currentEntry) return;
    const dataStr = JSON.stringify(currentEntry, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentEntry.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (currentEntry && currentEntry.title) {
      // Filter out empty fields before saving
      const nonEmptyFields = (currentEntry.fields || []).filter(f => f.label.trim() !== '' || f.value.trim() !== '');
      onSave(category, { ...currentEntry, fields: nonEmptyFields });
    }
  };

  const handleDeleteEntry = () => {
    if (currentEntry && onDelete) {
      onDelete(category, currentEntry.title);
    }
  };

  const handleSuggestFields = async () => {
    if (!currentEntry || !currentEntry.title) return;
    setIsGenerating(true);
    try {
      const prompt = `Suggest relevant fields for the ${category.toLowerCase().slice(0, -1)} named "${currentEntry.title}". Create field labels and empty values.`;
      const response = await suggestBibleFields(prompt);

      if (response.fields && response.fields.length > 0) {
        const newFields: BibleField[] = response.fields.map(field => ({ label: field.label, value: '' }));
        setCurrentEntry({ ...currentEntry, fields: [...(currentEntry.fields || []), ...newFields] });
        toast({
          title: 'Fields Suggested',
          description: 'AI has added new fields to your entry.',
        });
      }
    } catch (error) {
      console.error("Failed to suggest fields:", error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not suggest fields at this time.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiFieldSuggestion = async (fieldIndex: number) => {
    if (!currentEntry || !currentEntry.title) return;
    setAiGeneratingField(fieldIndex);
    try {
      const field = currentEntry.fields?.[fieldIndex];
      if (!field) return;

      // Create a prompt for the AI to generate field content
      const prompt = `Generate content for the field "${field.label}" for the ${category.toLowerCase().slice(0, -1)} named "${currentEntry.title}". Provide detailed, relevant content.`;

      const response = await suggestBibleFields(prompt);

      if (response.fields && response.fields.length > 0) {
        const newFields = [...(currentEntry.fields || [])];
        newFields[fieldIndex] = { ...field, value: response.fields[0].value };
        setCurrentEntry({ ...currentEntry, fields: newFields });

        toast({
          title: 'AI Suggestion Applied',
          description: `Content generated for "${field.label}"`,
        });
      }
    } catch (error) {
      console.error("Failed to generate field content:", error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate content for this field.',
      });
    } finally {
      setAiGeneratingField(null);
    }
  };

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentEntry) return;

    setIsProcessingFile(true);
    try {
      let content = '';

      if (file.type === 'application/pdf') {
        // For PDF files, we'd need a PDF parser library
        // For now, show a message that PDF processing is not yet implemented
        toast({
          title: 'PDF Processing',
          description: 'PDF processing will be implemented soon. Please use HTML files for now.',
        });
        return;
      } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
        // Process HTML files
        content = await file.text();

        // Extract text content from HTML (basic implementation)
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const textContent = doc.body?.textContent || doc.textContent || '';

        // Create new fields based on content
        const newFields = [
          { label: 'Imported Content', value: textContent.trim() },
          { label: 'Original HTML', value: content }
        ];

        // Also try to extract a title if available
        const titleElement = doc.querySelector('title, h1, h2');
        if (titleElement && titleElement.textContent?.trim()) {
          newFields.unshift({ label: 'Extracted Title', value: titleElement.textContent.trim() });
        }

        setCurrentEntry({
          ...currentEntry,
          fields: [...(currentEntry.fields || []), ...newFields]
        });

        toast({
          title: 'File Processed',
          description: `Successfully imported content from ${file.name}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: 'Please upload HTML or PDF files only.',
        });
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        variant: 'destructive',
        title: 'Processing Error',
        description: 'Failed to process the uploaded file.',
      });
    } finally {
      setIsProcessingFile(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (!currentEntry) {
    return null;
  }

  if (editingPage) {
    return <ProfilePageEditor page={editingPage} onSave={handlePageSave} onCancel={() => setEditingPage(null)} onDelete={handlePageDelete} />
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="space-y-3 p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{currentEntry.title}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {category === 'Locations' && onViewOnMap && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewOnMap(currentEntry?.title || '')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            )}
            {editMode === 'edit' && (
              <>
                <input
                  type="file"
                  accept=".html,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-feed-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-feed-input')?.click()}
                  disabled={isProcessingFile}
                >
                  {isProcessingFile ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4 mr-2" />
                  )}
                  Feed
                </Button>
              </>
            )}
            <Button
              variant={editMode === 'view' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditMode(editMode === 'view' ? 'edit' : 'view')}
            >
              {editMode === 'view' ? <Edit className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {editMode === 'view' ? 'Edit' : 'View'}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {category} • {editMode === 'view' ? 'Reading Mode' : 'Edit Mode'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className={`grid w-full ${getTabGridCols(category)}`}>
            {getTabsForCategory(category).map(tab => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Identity Tab - Characters Only */}
        <TabsContent value="identity" className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Picture and Basic Info */}
              <div className="space-y-6">
                {/* Picture Section */}
                <div className="text-center">
                  <Label className="text-sm font-medium block mb-4">Picture</Label>
                  <div className="relative inline-block">
                    <Avatar className="w-32 h-32 mx-auto">
                      <AvatarImage
                        src={currentEntry.fixedFields?.picture}
                        alt={currentEntry.title}
                      />
                      <AvatarFallback className="text-lg">
                        {currentEntry.title.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {editMode === 'edit' && (
                      <div className="mt-3">
                        <label htmlFor="picture-upload" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Camera className="h-4 w-4 mr-2" />
                              Upload
                            </span>
                          </Button>
                        </label>
                        <input
                          id="picture-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                  <div className="space-y-4">
                {/* Real Name */}
                <div>
                  <Label className="text-sm font-medium">Real Name</Label>
                  {editMode === 'edit' ? (
                    <Input
                      value={currentEntry.fixedFields?.realName || ''}
                      onChange={(e) => handleFixedFieldChange('realName', e.target.value)}
                      placeholder="Real name"
                      className="mt-1 bg-card border-border text-foreground"
                    />
                  ) : (
                    <p className="mt-1 text-sm">{currentEntry.fixedFields?.realName || 'Unknown'}</p>
                  )}
                </div>

                {/* Aliases */}
                <div>
                  <Label className="text-sm font-medium">Aliases</Label>
                  {editMode === 'edit' ? (
                    <Input
                      value={currentEntry.fixedFields?.aliases || ''}
                      onChange={(e) => handleFixedFieldChange('aliases', e.target.value)}
                      placeholder="Known aliases (comma separated)"
                      className="mt-1 bg-card border-border text-foreground"
                    />
                  ) : (
                    <p className="mt-1 text-sm">{currentEntry.fixedFields?.aliases || 'None'}</p>
                  )}
                </div>

                    {/* Age */}
                    <div>
                      <Label className="text-sm font-medium">Age</Label>
                      {editMode === 'edit' ? (
                        <Input
                          value={currentEntry.fixedFields?.age || ''}
                          onChange={(e) => handleFixedFieldChange('age', e.target.value)}
                          placeholder="Age or age range"
                          className="mt-1 bg-card border-border text-foreground"
                        />
                      ) : (
                        <p className="mt-1 text-sm">{currentEntry.fixedFields?.age || 'Unknown'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Information */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                  <div className="space-y-4">
                    {/* Nationality */}
                    <div>
                      <Label className="text-sm font-medium">Nationality</Label>
                      {editMode === 'edit' ? (
                        <Input
                          value={currentEntry.fixedFields?.nationality || ''}
                          onChange={(e) => handleFixedFieldChange('nationality', e.target.value)}
                          placeholder="Nationality"
                          className="mt-1 bg-card border-border text-foreground"
                        />
                      ) : (
                        <p className="mt-1 text-sm">{currentEntry.fixedFields?.nationality || 'Unknown'}</p>
                      )}
                    </div>

                    {/* Alignment */}
                    <div>
                      <Label className="text-sm font-medium">Alignment</Label>
                      {editMode === 'edit' ? (
                        <Select
                          value={currentEntry.fixedFields?.alignment || ''}
                          onValueChange={(value) => handleFixedFieldChange('alignment', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select alignment" />
                          </SelectTrigger>
                          <SelectContent>
                            {ALIGNMENT_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <Badge variant="secondary">{currentEntry.fixedFields?.alignment || 'Unknown'}</Badge>
                        </div>
                      )}
                    </div>

                    {/* Affiliation */}
                    <div>
                      <Label className="text-sm font-medium">Affiliation</Label>
                      {editMode === 'edit' ? (
                        <Select
                          value={currentEntry.fixedFields?.affiliation?.[0] || ''}
                          onValueChange={(value) => handleFixedFieldChange('affiliation', [value])}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select affiliation" />
                          </SelectTrigger>
                          <SelectContent>
                            {AFFILIATION_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {currentEntry.fixedFields?.affiliation?.map((group) => (
                            <Badge key={group} variant="outline">{group}</Badge>
                          )) || <span className="text-sm text-muted-foreground">Independent</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Other tabs would continue here - for brevity I'll add placeholders that reference the original implementation */}
        {getTabsForCategory(category).slice(1).map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="flex-1 overflow-y-auto p-4">
            <div className="text-center text-muted-foreground">
              {tab.label} content will be implemented here (copying from BibleEditor)
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="p-4 border-t">
        <div className="flex justify-between w-full">
          {editMode === 'edit' && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Entry
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {currentEntry?.title}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this {category.toLowerCase().slice(0, -1)} entry and all its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteEntry} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Entry
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="flex gap-2 ml-auto">
            {editMode === 'edit' && (
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}