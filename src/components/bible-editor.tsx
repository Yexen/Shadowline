'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface BibleEditorProps {
  entry: BibleEntry | null;
  category: string;
  onSave: (category: string, entry: BibleEntry) => void;
  onDelete?: (category: string, entryTitle: string) => void;
  onViewOnMap?: (locationName: string) => void;
  onClose: () => void;
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

export function BibleEditor({ entry, category, onSave, onDelete, onViewOnMap, onClose }: BibleEditorProps) {
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
      onClose();
    }
  };

  const handleDeleteEntry = () => {
    if (currentEntry && onDelete) {
      onDelete(category, currentEntry.title);
      onClose();
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

  const isOpen = !!entry;

  if (!currentEntry) {
    return null;
  }
  
  if (editingPage) {
    return <ProfilePageEditor page={editingPage} onSave={handlePageSave} onCancel={() => setEditingPage(null)} onDelete={handlePageDelete} />
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{currentEntry.title}</DialogTitle>
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
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
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

          {/* Traits Tab - Characters Only */}
          <TabsContent value="traits" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="space-y-4">
              {editMode === 'edit' && (
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Character Traits</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSuggestFields} disabled={isGenerating}>
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      AI Suggest
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAddField}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Trait
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(currentEntry.fields || []).map((field, index) => (
                  <div 
                    key={index} 
                    className="p-4 border rounded-lg relative group"
                    onMouseEnter={() => setHoveredField(index)}
                    onMouseLeave={() => setHoveredField(null)}
                  >
                    {editMode === 'edit' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={field.label}
                            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                            placeholder="Trait name"
                            className="flex-1"
                          />
                          {/* AI Suggestion Button */}
                          {hoveredField === index && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAiFieldSuggestion(index)}
                              disabled={aiGeneratingField === index}
                              className="opacity-80 hover:opacity-100 transition-opacity"
                              title="Generate AI content for this field"
                            >
                              {aiGeneratingField === index ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Bot className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRemoveField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="relative">
                          <Textarea
                            value={field.value}
                            onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                            placeholder="Trait description"
                            className="min-h-[80px]"
                          />
                          {/* AI Suggestion Button for Textarea */}
                          {hoveredField === index && !field.value && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAiFieldSuggestion(index)}
                              disabled={aiGeneratingField === index}
                              className="absolute top-2 right-2 opacity-60 hover:opacity-100 transition-opacity"
                              title="Generate AI content"
                            >
                              {aiGeneratingField === index ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Bot className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-sm font-medium">{field.label}</Label>
                        <p className="mt-1 text-sm">{field.value}</p>
                      </div>
                    )}
                  </div>
                ))}

                {(!currentEntry.fields || currentEntry.fields.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No character traits yet.</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Relationships Tab - Characters Only */}
          <TabsContent value="relationships" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="space-y-4">
              {editMode === 'edit' && (
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Relationships</Label>
                  <Button variant="outline" size="sm" onClick={handleAddRelationship}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Relationship
                  </Button>
                </div>
              )}
              
              <div className="space-y-3">
                {(currentEntry.relationships || []).map((relationship, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    {editMode === 'edit' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Character</Label>
                          <Input
                            value={relationship.characterName}
                            onChange={(e) => handleRelationshipChange(index, 'characterName', e.target.value)}
                            placeholder="Character name"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Relationship</Label>
                          <Select
                            value={relationship.relationshipType}
                            onValueChange={(value) => handleRelationshipChange(index, 'relationshipType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {RELATIONSHIP_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRemoveRelationship(index)}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="md:col-span-3">
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={relationship.description || ''}
                            onChange={(e) => handleRelationshipChange(index, 'description', e.target.value)}
                            placeholder="Describe the relationship"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{relationship.relationshipType}</Badge>
                          <span className="font-medium">{relationship.characterName}</span>
                        </div>
                        {relationship.description && (
                          <p className="text-sm text-muted-foreground mt-2">{relationship.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {(!currentEntry.relationships || currentEntry.relationships.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No relationships defined yet.</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Arcs Tab - Characters Only */}
          <TabsContent value="arcs" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Character Arcs</h3>
                {editMode === 'edit' && (
                  <Button
                    onClick={() => {
                      const newArc = { id: Date.now().toString(), title: 'New Arc', content: '' };
                      setCurrentEntry({
                        ...currentEntry,
                        pages: [...(currentEntry.pages || []), newArc]
                      });
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Arc
                  </Button>
                )}
              </div>
              
              {currentEntry.pages && currentEntry.pages.length > 0 ? (
                <div className="space-y-2">
                  {currentEntry.pages.map((page, index) => (
                    <Card key={page.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        {editMode === 'edit' ? (
                          <Input
                            value={page.title}
                            onChange={(e) => {
                              const newPages = [...(currentEntry.pages || [])];
                              newPages[index] = { ...page, title: e.target.value };
                              setCurrentEntry({ ...currentEntry, pages: newPages });
                            }}
                            className="font-medium bg-transparent border-none p-0 h-auto"
                            placeholder="Arc title..."
                          />
                        ) : (
                          <h4 className="font-medium">{page.title}</h4>
                        )}
                        {editMode === 'edit' && (
                          <Button
                            onClick={() => {
                              const newPages = currentEntry.pages?.filter((_, i) => i !== index) || [];
                              setCurrentEntry({ ...currentEntry, pages: newPages });
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {editMode === 'edit' ? (
                        <Textarea
                          value={page.content}
                          onChange={(e) => {
                            const newPages = [...(currentEntry.pages || [])];
                            newPages[index] = { ...page, content: e.target.value };
                            setCurrentEntry({ ...currentEntry, pages: newPages });
                          }}
                          placeholder="Describe this character arc..."
                          className="min-h-[100px]"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {page.content || 'No content yet'}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No character arcs yet. Add one to get started.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Backstory Tab - Characters Only */}
          <TabsContent value="backstory" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="space-y-4">
              <BackstoryTimeline />
            </div>
          </TabsContent>

          {/* Mindmap Tab - Characters Only */}
          <TabsContent value="mindmap" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="space-y-4">
              <RelationshipMindmap />
            </div>
          </TabsContent>

          {/* Dossier Tab - Characters Only */}
          <TabsContent value="dossier" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Character Dossier</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive information archive</p>
                </div>
                {editMode === 'edit' && (
                  <Button variant="outline" size="sm" onClick={handleAddNewPage}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                )}
              </div>

              {/* Notion-like Layout */}
              <div className="space-y-4">
                {(currentEntry.pages || []).map((page, index) => (
                  <div 
                    key={page.id} 
                    className="group border rounded-lg hover:shadow-lg transition-all duration-200 bg-card"
                  >
                    {/* Section Header */}
                    <div 
                      className="p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setEditingPage(page)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <h4 className="font-semibold text-lg">{page.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge variant="secondary" className="text-xs">
                            {page.content?.length || 0} chars
                          </Badge>
                          {editMode === 'edit' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPage(page);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section Content Preview */}
                    <div className="p-4">
                      {page.content ? (
                        <div className="prose prose-sm max-w-none">
                          <div className="text-sm text-muted-foreground line-clamp-3">
                            {page.content.split('\n').slice(0, 3).join(' ').slice(0, 200)}
                            {page.content.length > 200 && '...'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No content yet. Click to add.</p>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {editMode === 'view' && page.content && (
                      <div className="px-4 pb-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingPage(page)}
                          className="w-full"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          View Full Content
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {(!currentEntry.pages || currentEntry.pages.length === 0) && (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-accent/20">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-accent rounded-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">No dossier sections yet</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create organized sections to document this character's complete profile
                      </p>
                    </div>
                    {editMode === 'edit' && (
                      <Button variant="outline" onClick={handleAddNewPage}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create First Section
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Add sections footer for edit mode */}
              {editMode === 'edit' && currentEntry.pages && currentEntry.pages.length > 0 && (
                <div className="text-center pt-4 border-t">
                  <Button variant="ghost" onClick={handleAddNewPage} className="text-muted-foreground">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Another Section
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Overview Tab for Non-Characters */}
          <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-6 p-1">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Picture Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Image</Label>
                  <div className="relative">
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
                      <div className="mt-2">
                        <label htmlFor="picture-upload-overview" className="cursor-pointer">
                          <Button variant="outline" size="sm" asChild>
                            <span>
                              <Camera className="h-4 w-4 mr-2" />
                              Upload
                            </span>
                          </Button>
                        </label>
                        <input
                          id="picture-upload-overview"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Category-Specific Fields */}
                <div className="md:col-span-2 space-y-4">
                  {category === 'Locations' && (
                    <>
                      {/* District */}
                      <div>
                        <Label className="text-sm font-medium">District</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.district || ''}
                            onValueChange={(value) => handleFixedFieldChange('district', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                            <SelectContent>
                              {DISTRICT_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.district || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Threat Level */}
                      <div>
                        <Label className="text-sm font-medium">Threat Level</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.threatLevel || ''}
                            onValueChange={(value) => handleFixedFieldChange('threatLevel', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select threat level" />
                            </SelectTrigger>
                            <SelectContent>
                              {LOCATION_THREAT_LEVEL_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="secondary">{currentEntry.fixedFields?.threatLevel || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>

                      {/* Control */}
                      <div>
                        <Label className="text-sm font-medium">Control</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.control || ''}
                            onValueChange={(value) => handleFixedFieldChange('control', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select control" />
                            </SelectTrigger>
                            <SelectContent>
                              {CONTROL_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.control || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Function */}
                      <div>
                        <Label className="text-sm font-medium">Function</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.function || ''}
                            onValueChange={(value) => handleFixedFieldChange('function', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select function" />
                            </SelectTrigger>
                            <SelectContent>
                              {FUNCTION_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.function || 'Unknown'}</p>
                        )}
                      </div>
                    </>
                  )}

                  {category === 'Gadgets' && (
                    <>
                      {/* Creator */}
                      <div>
                        <Label className="text-sm font-medium">Creator</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.creator || ''}
                            onValueChange={(value) => handleFixedFieldChange('creator', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select creator" />
                            </SelectTrigger>
                            <SelectContent>
                              {CREATOR_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.creator || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Current Owner */}
                      <div>
                        <Label className="text-sm font-medium">Current Owner</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.currentOwner || ''}
                            onChange={(e) => handleFixedFieldChange('currentOwner', e.target.value)}
                            placeholder="Current owner"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.currentOwner || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Gadget Type */}
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.gadgetType || ''}
                            onValueChange={(value) => handleFixedFieldChange('gadgetType', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {GADGET_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="secondary">{currentEntry.fixedFields?.gadgetType || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {category === 'Vehicles' && (
                    <>
                      {/* Vehicle Name */}
                      <div>
                        <Label className="text-sm font-medium">Vehicle Name</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.vehicleName || ''}
                            onChange={(e) => handleFixedFieldChange('vehicleName', e.target.value)}
                            placeholder="Vehicle name"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.vehicleName || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Owner */}
                      <div>
                        <Label className="text-sm font-medium">Owner</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.owner || ''}
                            onChange={(e) => handleFixedFieldChange('owner', e.target.value)}
                            placeholder="Vehicle owner"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.owner || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Manufacturer */}
                      <div>
                        <Label className="text-sm font-medium">Manufacturer</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.manufacturer || ''}
                            onValueChange={(value) => handleFixedFieldChange('manufacturer', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select manufacturer" />
                            </SelectTrigger>
                            <SelectContent>
                              {VEHICLE_MANUFACTURER_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.manufacturer || 'Unknown'}</p>
                        )}
                      </div>
                    </>
                  )}

                  {category === 'Animals' && (
                    <>
                      {/* Species */}
                      <div>
                        <Label className="text-sm font-medium">Species</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.species || ''}
                            onChange={(e) => handleFixedFieldChange('species', e.target.value)}
                            placeholder="Animal species"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.species || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Animal Alias */}
                      <div>
                        <Label className="text-sm font-medium">Alias</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.animalAlias || ''}
                            onChange={(e) => handleFixedFieldChange('animalAlias', e.target.value)}
                            placeholder="Animal alias or codename"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.animalAlias || 'None'}</p>
                        )}
                      </div>

                      {/* Companion Of */}
                      <div>
                        <Label className="text-sm font-medium">Companion Of</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.companionOf || ''}
                            onChange={(e) => handleFixedFieldChange('companionOf', e.target.value)}
                            placeholder="Character this animal companions"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.companionOf || 'None'}</p>
                        )}
                      </div>

                      {/* Role */}
                      <div>
                        <Label className="text-sm font-medium">Role</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.role || ''}
                            onValueChange={(value) => handleFixedFieldChange('role', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ANIMAL_ROLE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="secondary">{currentEntry.fixedFields?.role || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {category === 'Couples' && (
                    <>
                      {/* Members */}
                      <div>
                        <Label className="text-sm font-medium">Members</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.members || ''}
                            onChange={(e) => handleFixedFieldChange('members', e.target.value)}
                            placeholder="Couple members"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.members || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Relationship Status */}
                      <div>
                        <Label className="text-sm font-medium">Relationship Status</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.relationshipStatus || ''}
                            onValueChange={(value) => handleFixedFieldChange('relationshipStatus', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {RELATIONSHIP_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="secondary">{currentEntry.fixedFields?.relationshipStatus || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>

                      {/* Volumes */}
                      <div>
                        <Label className="text-sm font-medium">Volumes</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.volumes || ''}
                            onChange={(e) => handleFixedFieldChange('volumes', e.target.value)}
                            placeholder="Story volumes (e.g., I-VI)"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.volumes || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Themes */}
                      <div>
                        <Label className="text-sm font-medium">Themes</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.themes || ''}
                            onChange={(e) => handleFixedFieldChange('themes', e.target.value)}
                            placeholder="Relationship themes"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.themes || 'None'}</p>
                        )}
                      </div>
                    </>
                  )}

                  {category === 'Resources' && (
                    <>
                      {/* Source */}
                      <div>
                        <Label className="text-sm font-medium">Source</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.source || ''}
                            onChange={(e) => handleFixedFieldChange('source', e.target.value)}
                            placeholder="Resource source"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.source || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Linked To */}
                      <div>
                        <Label className="text-sm font-medium">Linked To</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.linkedTo || ''}
                            onChange={(e) => handleFixedFieldChange('linkedTo', e.target.value)}
                            placeholder="Character or entity linked to"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.linkedTo || 'None'}</p>
                        )}
                      </div>

                      {/* Volume */}
                      <div>
                        <Label className="text-sm font-medium">Volume</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.volume || ''}
                            onChange={(e) => handleFixedFieldChange('volume', e.target.value)}
                            placeholder="Story volume"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.volume || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Resource Status */}
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.resourceStatus || ''}
                            onValueChange={(value) => handleFixedFieldChange('resourceStatus', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {RESOURCE_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="secondary">{currentEntry.fixedFields?.resourceStatus || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {category === 'Factions' && (
                    <>
                      {/* Purpose */}
                      <div>
                        <Label className="text-sm font-medium">Purpose</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.purpose || ''}
                            onChange={(e) => handleFixedFieldChange('purpose', e.target.value)}
                            placeholder="Faction purpose"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.purpose || 'Unknown'}</p>
                        )}
                      </div>

                      {/* Faction Alignment */}
                      <div>
                        <Label className="text-sm font-medium">Alignment</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.factionAlignment || ''}
                            onValueChange={(value) => handleFixedFieldChange('factionAlignment', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select alignment" />
                            </SelectTrigger>
                            <SelectContent>
                              {FACTION_ALIGNMENT_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="secondary">{currentEntry.fixedFields?.factionAlignment || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>

                      {/* Strengths */}
                      <div>
                        <Label className="text-sm font-medium">Strengths</Label>
                        {editMode === 'edit' ? (
                          <Input
                            value={currentEntry.fixedFields?.strengths || ''}
                            onChange={(e) => handleFixedFieldChange('strengths', e.target.value)}
                            placeholder="Faction strengths"
                            className="mt-1 bg-card border-border text-foreground"
                          />
                        ) : (
                          <p className="mt-1 text-sm">{currentEntry.fixedFields?.strengths || 'Unknown'}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Description Tab for Non-Characters */}
          <TabsContent value="description" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Description</Label>
                {editMode === 'edit' && (
                  <p className="text-sm text-muted-foreground">Click to edit</p>
                )}
              </div>
              
              <div className="prose prose-sm max-w-none">
                {editMode === 'edit' ? (
                  <Textarea
                    value={currentEntry.fields?.[0]?.value || ''}
                    onChange={(e) => {
                      const newFields = [...(currentEntry.fields || [])];
                      if (newFields.length === 0) {
                        newFields.push({ label: 'Description', value: e.target.value });
                      } else {
                        newFields[0] = { ...newFields[0], value: e.target.value };
                      }
                      setCurrentEntry({ ...currentEntry, fields: newFields });
                    }}
                    placeholder={`Enter detailed description for this ${category.toLowerCase().slice(0, -1)}...`}
                    className="min-h-[200px] resize-none"
                  />
                ) : (
                  <div className="p-4 border rounded-lg bg-background">
                    {currentEntry.fields?.[0]?.value ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {currentEntry.fields[0].value}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No description available. Click Edit to add one.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Custom Fields Tab */}
          <TabsContent value="fields" className="flex-1 overflow-y-auto space-y-4 p-1">
            <div className="space-y-4">
              {editMode === 'edit' && (
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Custom Fields</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSuggestFields} disabled={isGenerating}>
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      AI Suggest
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAddField}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(currentEntry.fields || []).map((field, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    {editMode === 'edit' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={field.label}
                            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                            placeholder="Field name"
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRemoveField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={field.value}
                          onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                          placeholder="Field content"
                          className="min-h-[80px]"
                        />
                      </div>
                    ) : (
                      <div>
                        <Label className="text-sm font-medium">{field.label}</Label>
                        <p className="mt-1 text-sm">{field.value}</p>
                      </div>
                    )}
                  </div>
                ))}

                {(!currentEntry.fields || currentEntry.fields.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No custom fields yet.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
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
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {editMode === 'edit' && (
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}