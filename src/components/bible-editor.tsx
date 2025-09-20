
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
import type { BibleEntry, BiblePage, BibleField, BibleFixedFields, BibleRelationship } from '@/hooks/use-bible';
import { 
  POSITION_OPTIONS, 
  GROUP_AFFILIATION_OPTIONS, 
  RELATIONSHIP_TYPES,
  THREAT_LEVEL_OPTIONS,
  ACCESS_LEVEL_OPTIONS,
  DISTRICT_OPTIONS,
  STATUS_OPTIONS,
  GADGET_TYPE_OPTIONS,
  MANUFACTURER_OPTIONS,
  EFFECTIVENESS_OPTIONS,
  AVAILABILITY_OPTIONS
} from '@/hooks/use-bible';
import { PlusCircle, Trash2, Sparkles, BookUser, List, Loader2, Upload, Download, Eye, Edit, Camera, Users, FileText } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ProfilePageEditor } from './profile-page-editor';
import { suggestBibleFields } from '@/ai/flows/bible-fields-flow';

interface BibleEditorProps {
  entry: BibleEntry | null;
  category: string;
  onSave: (category: string, entry: BibleEntry) => void;
  onClose: () => void;
}

type EditorView = 'profile' | 'relationships' | 'fields' | 'pages' | 'description';
type EditMode = 'view' | 'edit';

export function BibleEditor({ entry, category, onSave, onClose }: BibleEditorProps) {
  const [currentEntry, setCurrentEntry] = useState<BibleEntry | null>(null);
  const [view, setView] = useState<EditorView>('profile');
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [editingPage, setEditingPage] = useState<BiblePage | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (entry) {
      // Create a deep copy to avoid direct mutation
      setCurrentEntry(JSON.parse(JSON.stringify(entry)));
      // Reset view when a new entry is opened
      setView('profile'); 
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

  const handleSuggestFields = async () => {
    if (!currentEntry || !currentEntry.title) return;
    setIsGenerating(true);
    try {
      const suggestedFields = await suggestBibleFields({
        entryTitle: currentEntry.title,
        entryCategory: category
      });
      const newFields: BibleField[] = suggestedFields.map(field => ({ label: field, value: '' }));
      setCurrentEntry({ ...currentEntry, fields: [...(currentEntry.fields || []), ...newFields] });
      toast({
        title: 'Fields Suggested',
        description: 'AI has added new fields to your entry.',
      });
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{currentEntry.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
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

        <Tabs value={view} onValueChange={(value) => setView(value as EditorView)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className={`grid w-full ${category === 'Characters' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <BookUser className="h-4 w-4" />
              Profile
            </TabsTrigger>
            {category === 'Characters' && (
              <TabsTrigger value="relationships" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Relations
              </TabsTrigger>
            )}
            {category !== 'Characters' && (
              <TabsTrigger value="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </TabsTrigger>
            )}
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Custom Fields
            </TabsTrigger>
            {category === 'Characters' && (
              <TabsTrigger value="pages" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pages
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-6 overflow-y-auto">
            {category === 'Characters' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Picture Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Picture</Label>
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

                {/* Fixed Fields */}
                <div className="md:col-span-2 space-y-4">
                  {/* Name */}
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    {editMode === 'edit' ? (
                      <Input
                        value={currentEntry.fixedFields?.name || ''}
                        onChange={(e) => handleFixedFieldChange('name', e.target.value)}
                        placeholder="Real name"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{currentEntry.fixedFields?.name || 'Unknown'}</p>
                    )}
                  </div>

                  {/* Alias */}
                  <div>
                    <Label className="text-sm font-medium">Alias</Label>
                    {editMode === 'edit' ? (
                      <Input
                        value={currentEntry.fixedFields?.alias || ''}
                        onChange={(e) => handleFixedFieldChange('alias', e.target.value)}
                        placeholder="Known aliases"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{currentEntry.fixedFields?.alias || 'None'}</p>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <Label className="text-sm font-medium">Position</Label>
                    {editMode === 'edit' ? (
                      <Select
                        value={currentEntry.fixedFields?.position?.[0] || ''}
                        onValueChange={(value) => handleFixedFieldChange('position', [value])}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSITION_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {currentEntry.fixedFields?.position?.map((pos) => (
                          <Badge key={pos} variant="secondary">{pos}</Badge>
                        )) || <span className="text-sm text-muted-foreground">None</span>}
                      </div>
                    )}
                  </div>

                  {/* Group Affiliation */}
                  <div>
                    <Label className="text-sm font-medium">Group Affiliation</Label>
                    {editMode === 'edit' ? (
                      <Select
                        value={currentEntry.fixedFields?.groupAffiliation?.[0] || ''}
                        onValueChange={(value) => handleFixedFieldChange('groupAffiliation', [value])}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          {GROUP_AFFILIATION_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {currentEntry.fixedFields?.groupAffiliation?.map((group) => (
                          <Badge key={group} variant="outline">{group}</Badge>
                        )) || <span className="text-sm text-muted-foreground">Independent</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Picture Section for non-characters */}
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

                {/* Category-Specific Fields */}
                <div className="md:col-span-2 space-y-4">
                  {category === 'Locations' && (
                    <>
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
                              {THREAT_LEVEL_OPTIONS.map((option) => (
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

                      {/* Access Level */}
                      <div>
                        <Label className="text-sm font-medium">Access Level</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.accessLevel || ''}
                            onValueChange={(value) => handleFixedFieldChange('accessLevel', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACCESS_LEVEL_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="outline">{currentEntry.fixedFields?.accessLevel || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>

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

                      {/* Status */}
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.status || ''}
                            onValueChange={(value) => handleFixedFieldChange('status', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="secondary">{currentEntry.fixedFields?.status || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {category === 'Gadgets' && (
                    <>
                      {/* Type */}
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.type || ''}
                            onValueChange={(value) => handleFixedFieldChange('type', value)}
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
                            <Badge variant="secondary">{currentEntry.fixedFields?.type || 'Unknown'}</Badge>
                          </div>
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
                              {MANUFACTURER_OPTIONS.map((option) => (
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

                      {/* Effectiveness */}
                      <div>
                        <Label className="text-sm font-medium">Effectiveness</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.effectiveness || ''}
                            onValueChange={(value) => handleFixedFieldChange('effectiveness', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select effectiveness" />
                            </SelectTrigger>
                            <SelectContent>
                              {EFFECTIVENESS_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="outline">{currentEntry.fixedFields?.effectiveness || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>

                      {/* Availability */}
                      <div>
                        <Label className="text-sm font-medium">Availability</Label>
                        {editMode === 'edit' ? (
                          <Select
                            value={currentEntry.fixedFields?.availability || ''}
                            onValueChange={(value) => handleFixedFieldChange('availability', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              {AVAILABILITY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1">
                            <Badge variant="secondary">{currentEntry.fixedFields?.availability || 'Unknown'}</Badge>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="relationships" className="mt-4 overflow-y-auto">
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
                            className="mt-1"
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

          <TabsContent value="description" className="mt-4 overflow-y-auto">
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

              {/* Quick info cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Quick Info</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Category:</span> {category}</p>
                    <p><span className="text-muted-foreground">Custom Fields:</span> {currentEntry.fields?.length || 0}</p>
                    {category === 'Characters' && (
                      <p><span className="text-muted-foreground">Pages:</span> {currentEntry.pages?.length || 0}</p>
                    )}
                  </div>
                </div>
                
                {category === 'Locations' && currentEntry.fixedFields && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Security Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Threat:</span>
                        <Badge variant="secondary">{currentEntry.fixedFields.threatLevel || 'Unknown'}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Access:</span>
                        <Badge variant="outline">{currentEntry.fixedFields.accessLevel || 'Unknown'}</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {category === 'Gadgets' && currentEntry.fixedFields && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Operational Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <Badge variant="secondary">{currentEntry.fixedFields.type || 'Unknown'}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="outline">{currentEntry.fixedFields.availability || 'Unknown'}</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="mt-4 overflow-y-auto">
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

          <TabsContent value="pages" className="mt-4 overflow-y-auto">
            <div className="space-y-4">
              {editMode === 'edit' && (
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Profile Pages</Label>
                  <Button variant="outline" size="sm" onClick={handleAddNewPage}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Page
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(currentEntry.pages || []).map((page) => (
                  <div 
                    key={page.id} 
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setEditingPage(page)}
                  >
                    <h4 className="font-medium">{page.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {page.content || 'No content yet'}
                    </p>
                  </div>
                ))}
              </div>

              {(!currentEntry.pages || currentEntry.pages.length === 0) && (
                <p className="text-center text-muted-foreground py-8">No pages created yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {editMode === 'edit' && (
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
