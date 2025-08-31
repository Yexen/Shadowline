'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  BookOpen, 
  Scroll,
  Brain,
  ArrowRight,
  Check,
  X,
  Loader2,
  Trash2,
  Eye,
  Sparkles,
  MessageSquare,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClassification, ClassificationItem } from '@/hooks/use-classification';
import { useBible } from '@/hooks/use-bible';
import { useVolumes } from '@/hooks/use-volumes';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ClassificationPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);
  const [tempInstructions, setTempInstructions] = useState('');
  const [volumeSelectionDialogOpen, setVolumeSelectionDialogOpen] = useState(false);
  const [selectedItemForVolume, setSelectedItemForVolume] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const {
    items,
    stats,
    globalInstructions,
    batchProcessing,
    addItems,
    updateItem,
    removeItem,
    classifyItem,
    classifyAllPending,
    acceptClassification,
    saveInstructions
  } = useClassification();
  
  const { addCategory, addOrUpdateEntry } = useBible();
  const { volumes, addChapterToVolume, getVolume } = useVolumes();

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, []);

  const handleFileUpload = async (files: File[]) => {
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];

    const validFiles: File[] = [];
    
    for (const file of files) {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive"
        });
        continue;
      }

      if (!supportedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not supported for classification`,
          variant: "destructive"
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const newItems = validFiles.map(file => ({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' as const : 
              file.type.startsWith('video/') ? 'video' as const :
              file.type === 'application/pdf' ? 'file' as const : 'text' as const,
        size: file.size,
        source: 'upload',
        status: 'pending' as const,
        file
      }));

      const itemIds = await addItems(newItems);

      toast({
        title: "Files added",
        description: `${validFiles.length} file(s) added to classification queue`
      });

      // Auto-classify uploaded files after extraction completes
      if (globalInstructions) {
        toast({
          title: "Auto-classifying files",
          description: "AI is analyzing your uploaded files...",
        });
        
        // Wait a moment for PDF extraction to complete, then classify
        setTimeout(async () => {
          try {
            await classifyAllPending({ globalInstructions });
            toast({
              title: "Classification complete",
              description: "Files have been automatically classified and are ready for review"
            });
          } catch (error) {
            console.error('Auto-classification failed:', error);
          }
        }, 2000);
      }
    }
  };

  const handleClassifyItem = async (item: any) => {
    const result = await classifyItem(item.id);
    if (result) {
      toast({
        title: "Classification complete",
        description: `${item.name} classified as ${result.category.toUpperCase()} with ${Math.round(result.confidence)}% confidence`
      });
    }
  };

  const handleClassifyAll = async () => {
    if (stats.pending === 0) return;
    
    toast({
      title: "Starting batch classification",
      description: `Processing ${stats.pending} items with AI guidance...`
    });
    
    try {
      await classifyAllPending({ 
        globalInstructions: globalInstructions || undefined
      });
      
      toast({
        title: "Batch classification complete",
        description: "All pending items have been classified"
      });
    } catch (error) {
      toast({
        title: "Classification failed",
        description: "There was an error processing the items",
        variant: "destructive"
      });
    }
  };

  const findVolumeByName = (volumeName: string): string | null => {
    const volume = volumes.find(v => 
      v.title.toLowerCase().includes(volumeName.toLowerCase()) ||
      v.id === volumeName ||
      volumeName.match(/^\d+$/) && volumes.indexOf(v) === parseInt(volumeName) - 1
    );
    return volume?.id || null;
  };
  
  const createVolumeChapter = async (volumeId: string, item: any, result: any) => {
    const parsedContent = result.item.classification?.parsedContent;
    const chapterTitle = parsedContent?.title || item.name.replace(/\.[^/.]+$/, '');
    const chapterContent = item.extractedText || item.content || '';
    
    addChapterToVolume(volumeId, chapterTitle, chapterContent);
    
    const volume = getVolume(volumeId);
    toast({
      title: "Chapter created",
      description: `"${chapterTitle}" added to ${volume?.title || 'selected volume'}`
    });
  };

  const handleAcceptClassification = async (item: any) => {
    const result = acceptClassification(item.id);
    if (result) {
      try {
        if (result.category === 'bible') {
          // Add to Bible with parsed content
          const section = result.suggestedSection || 'General';
          addCategory(section);
          
          const parsedContent = result.item.classification?.parsedContent;
          const entry = {
            title: parsedContent?.title || item.name,
            fields: parsedContent?.fields || [
              { label: 'Content', value: item.extractedText || item.content || 'No content available' },
              { label: 'Source', value: `Imported from ${item.source || 'classification'}` },
              { label: 'Tags', value: result.item.classification?.suggestedTags?.join(', ') || '' }
            ],
            pages: parsedContent?.sections?.map(section => ({
              id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              title: section.title,
              content: section.content
            })) || []
          };
          
          addOrUpdateEntry(section, entry);
          
          toast({
            title: "Bible entry created",
            description: `${entry.title} added to ${section} section with ${entry.fields.length} fields and ${entry.pages?.length || 0} pages`
          });
          
        } else if (result.category === 'volumes') {
          // Check if target volume is specified
          if (result.item.classification?.targetVolume) {
            const targetVolumeId = findVolumeByName(result.item.classification.targetVolume);
            if (targetVolumeId) {
              await createVolumeChapter(targetVolumeId, item, result);
            } else {
              // Show volume selection dialog
              setSelectedItemForVolume({ item, result });
              setVolumeSelectionDialogOpen(true);
            }
          } else {
            // Show volume selection dialog
            setSelectedItemForVolume({ item, result });
            setVolumeSelectionDialogOpen(true);
          }
        }
      } catch (error) {
        toast({
          title: "Error organizing content",
          description: "Failed to move content to the appropriate section",
          variant: "destructive"
        });
      }
    }
  };

  const handleAcceptAll = async () => {
    if (stats.classified === 0) return;
    
    const classifiedItems = items.filter(i => i.status === 'classified');
    let successCount = 0;
    
    for (const item of classifiedItems) {
      try {
        await handleAcceptClassification(item);
        successCount++;
      } catch (error) {
        console.error('Failed to accept classification for:', item.name, error);
      }
    }
    
    toast({
      title: "Batch organization complete",
      description: `${successCount} items moved to their appropriate sections`
    });
  };

  const handleVolumeSelection = async (volumeId: string) => {
    if (selectedItemForVolume) {
      await createVolumeChapter(volumeId, selectedItemForVolume.item, selectedItemForVolume.result);
      setVolumeSelectionDialogOpen(false);
      setSelectedItemForVolume(null);
    }
  };

  const handleRejectClassification = (itemId: string) => {
    updateItem(itemId, { status: 'rejected' });
    toast({
      title: "Classification rejected",
      description: "You can reclassify this item later"
    });
  };

  const handlePreview = (item: any) => {
    setSelectedItem(item);
    setPreviewDialogOpen(true);
  };

  const handleSaveInstructions = () => {
    saveInstructions(tempInstructions);
    setInstructionsDialogOpen(false);
    toast({
      title: "Instructions saved",
      description: "AI will use these instructions for future classifications"
    });
  };

  const handleOpenInstructions = () => {
    setTempInstructions(globalInstructions);
    setInstructionsDialogOpen(true);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FolderOpen className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-headline font-bold">Content Classification</h1>
        </div>
        <p className="text-muted-foreground">
          Automatically organize your content into Bible (lore & world-building) and Volumes (story content). 
          Drop PDFs to extract text and create structured entries automatically.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Loader2 className={`w-4 h-4 text-orange-500 ${batchProcessing ? 'animate-spin' : ''}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Extracting</p>
                <p className="text-2xl font-bold">{stats.extracting}</p>
              </div>
              <FileText className="w-4 h-4 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classified</p>
                <p className="text-2xl font-bold">{stats.classified}</p>
              </div>
              <Brain className="w-4 h-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bible Content</p>
                <p className="text-2xl font-bold">{stats.bible}</p>
              </div>
              <BookOpen className="w-4 h-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Volume Content</p>
                <p className="text-2xl font-bold">{stats.volumes}</p>
              </div>
              <Scroll className="w-4 h-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Instructions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              AI Classification Instructions
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleOpenInstructions}>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {globalInstructions ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current instructions:</p>
              <p className="text-sm bg-muted p-2 rounded-md">{globalInstructions}</p>
              <div className="text-xs text-muted-foreground">
                These instructions will guide the AI when classifying content. You can specify target volumes like "Volume 1" or "The Long Halloween".
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">
                No instructions set. The AI will use default classification logic. Set instructions to specify target volumes or sections.
              </p>
              <Button variant="outline" size="sm" onClick={handleOpenInstructions}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Instructions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card className={`relative ${dragActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov"
            onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
            className="hidden"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Drop files here to classify</h3>
          <p className="text-muted-foreground mb-4">
            Support for text, PDF (auto-extracted), images, and videos • Max 50MB per file
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button 
              variant="outline" 
              disabled={stats.pending === 0 || batchProcessing} 
              onClick={handleClassifyAll}
            >
              {batchProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Classify All ({stats.pending})
                </>
              )}
            </Button>
            {stats.classified > 0 && (
              <Button variant="outline" onClick={handleAcceptAll}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accept All ({stats.classified})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Classification Results */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Classification Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="bible">Bible ({stats.bible})</TabsTrigger>
                <TabsTrigger value="volumes">Volumes ({stats.volumes})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-3 mt-4">
                <ScrollArea className="h-[400px]">
                  {items.map((item) => (
                    <ClassificationItemCard
                      key={item.id}
                      item={item}
                      onClassify={() => handleClassifyItem(item)}
                      onAccept={() => handleAcceptClassification(item)}
                      onReject={() => handleRejectClassification(item.id)}
                      onRemove={() => removeItem(item.id)}
                      onPreview={() => handlePreview(item)}
                    />
                  ))}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="pending" className="space-y-3 mt-4">
                <ScrollArea className="h-[400px]">
                  {items.filter(i => i.status === 'pending').map((item) => (
                    <ClassificationItemCard
                      key={item.id}
                      item={item}
                      onClassify={() => handleClassifyItem(item)}
                      onAccept={() => handleAcceptClassification(item)}
                      onReject={() => handleRejectClassification(item.id)}
                      onRemove={() => removeItem(item.id)}
                      onPreview={() => handlePreview(item)}
                    />
                  ))}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="bible" className="space-y-3 mt-4">
                <ScrollArea className="h-[400px]">
                  {items.filter(i => i.classification?.category === 'bible').map((item) => (
                    <ClassificationItemCard
                      key={item.id}
                      item={item}
                      onClassify={() => handleClassifyItem(item)}
                      onAccept={() => handleAcceptClassification(item)}
                      onReject={() => handleRejectClassification(item.id)}
                      onRemove={() => removeItem(item.id)}
                      onPreview={() => handlePreview(item)}
                    />
                  ))}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="volumes" className="space-y-3 mt-4">
                <ScrollArea className="h-[400px]">
                  {items.filter(i => i.classification?.category === 'volumes').map((item) => (
                    <ClassificationItemCard
                      key={item.id}
                      item={item}
                      onClassify={() => handleClassifyItem(item)}
                      onAccept={() => handleAcceptClassification(item)}
                      onReject={() => handleRejectClassification(item.id)}
                      onRemove={() => removeItem(item.id)}
                      onPreview={() => handlePreview(item)}
                    />
                  ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getFileIcon(selectedItem.type)}
              {selectedItem?.name}
            </DialogTitle>
            <DialogDescription>
              Content preview and classification details
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Type:</Label>
                  <p className="capitalize">{selectedItem.type}</p>
                </div>
                <div>
                  <Label>Size:</Label>
                  <p>{selectedItem.size ? formatFileSize(selectedItem.size) : 'Unknown'}</p>
                </div>
                {selectedItem.extractedText && (
                  <div>
                    <Label>Extracted Text:</Label>
                    <p className="text-xs truncate">{selectedItem.extractedText.substring(0, 100)}...</p>
                  </div>
                )}
                <div>
                  <Label>Source:</Label>
                  <p className="capitalize">{selectedItem.source}</p>
                </div>
                <div>
                  <Label>Status:</Label>
                  <Badge variant={selectedItem.status === 'classified' ? 'default' : 'secondary'}>
                    {selectedItem.status}
                  </Badge>
                </div>
              </div>
              
              {selectedItem.classification && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold">Classification Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Category:</Label>
                      <Badge variant={selectedItem.classification.category === 'bible' ? 'secondary' : 'default'}>
                        {selectedItem.classification.category.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <Label>Confidence:</Label>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedItem.classification.confidence} className="flex-1" />
                        <span>{Math.round(selectedItem.classification.confidence)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {(selectedItem.classification.suggestedSection || selectedItem.classification.suggestedSubCategory || selectedItem.classification.targetVolume) && (
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {selectedItem.classification.suggestedSection && (
                        <div>
                          <Label>Suggested Bible Section:</Label>
                          <Badge variant="outline">{selectedItem.classification.suggestedSection}</Badge>
                        </div>
                      )}
                      {selectedItem.classification.suggestedSubCategory && (
                        <div>
                          <Label>Suggested Volume Type:</Label>
                          <Badge variant="outline">{selectedItem.classification.suggestedSubCategory}</Badge>
                        </div>
                      )}
                      {selectedItem.classification.targetVolume && (
                        <div>
                          <Label>Target Volume:</Label>
                          <Badge variant="outline">{selectedItem.classification.targetVolume}</Badge>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <Label>AI Reasoning:</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedItem.classification.reasoning}
                    </p>
                  </div>
                  
                  {selectedItem.classification.parsedContent && (
                    <div>
                      <Label>Parsed Structure:</Label>
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>Title: {selectedItem.classification.parsedContent.title}</p>
                        {selectedItem.classification.parsedContent.sections && (
                          <p>{selectedItem.classification.parsedContent.sections.length} sections identified</p>
                        )}
                        <p>{selectedItem.classification.parsedContent.fields?.length || 0} fields generated</p>
                      </div>
                    </div>
                  )}
                  {selectedItem.classification.suggestedTags && (
                    <div>
                      <Label>Suggested Tags:</Label>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {selectedItem.classification.suggestedTags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instructions Configuration Dialog */}
      <Dialog open={instructionsDialogOpen} onOpenChange={setInstructionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Classification Instructions</DialogTitle>
            <DialogDescription>
              Provide specific instructions to help the AI better classify your content into Bible (lore & reference) or Volumes (story content).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="e.g., 'Prioritize character backgrounds and world-building details for Bible. Story drafts, plot outlines, and narrative content should go to Volumes. For chapter content, save to Volume 1: The Long Halloween.'"
                value={tempInstructions}
                onChange={(e) => setTempInstructions(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Tips for better classification:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Mention specific keywords that indicate Bible vs Volume content</li>
                <li>Specify preferred sections (e.g., "Characters", "Locations" for Bible)</li>
                <li>Target specific volumes (e.g., "save to Volume 1", "add to The Long Halloween")</li>
                <li>Describe content types (e.g., "reference material", "story chapters")</li>
                <li>PDFs will be automatically text-extracted and parsed into structured content</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInstructionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInstructions}>
              Save Instructions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Volume Selection Dialog */}
      <Dialog open={volumeSelectionDialogOpen} onOpenChange={setVolumeSelectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Target Volume</DialogTitle>
            <DialogDescription>
              Choose which volume to add "{selectedItemForVolume?.item?.name}" to as a new chapter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {volumes.map((volume, index) => (
              <Button
                key={volume.id}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleVolumeSelection(volume.id)}
              >
                <div className="text-left">
                  <p className="font-semibold">Volume {index + 1}</p>
                  <p className="text-sm text-muted-foreground truncate">{volume.title}</p>
                  <p className="text-xs text-muted-foreground">{volume.chapters.length} chapters</p>
                </div>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVolumeSelectionDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ClassificationItemCardProps {
  item: ClassificationItem;
  onClassify: () => void;
  onAccept: () => void;
  onReject: () => void;
  onRemove: () => void;
  onPreview: () => void;
}

function ClassificationItemCard({ 
  item, 
  onClassify, 
  onAccept, 
  onReject, 
  onRemove, 
  onPreview 
}: ClassificationItemCardProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card mb-3">
      <div className="flex-shrink-0">
        {getFileIcon(item.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{item.name}</h4>
          <Badge variant={
            item.status === 'pending' ? 'secondary' :
            item.status === 'extracting' ? 'default' :
            item.status === 'classifying' ? 'default' :
            item.status === 'classified' ? 'default' : 'destructive'
          }>
            {item.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="capitalize">{item.type}</span>
          {item.size && <span>{formatFileSize(item.size)}</span>}
          <span>from {item.source}</span>
        </div>
        
        {item.classification && (
          <div className="mt-2 flex items-center gap-2">
            <ArrowRight className="w-3 h-3" />
            <Badge variant={item.classification.category === 'bible' ? 'secondary' : 'default'} className="text-xs">
              {item.classification.category.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(item.classification.confidence)}% confidence
            </span>
            {item.classification.targetVolume && (
              <Badge variant="outline" className="text-xs">
                → {item.classification.targetVolume}
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onPreview}>
          <Eye className="w-4 h-4" />
        </Button>
        
        {item.status === 'pending' && (
          <Button variant="ghost" size="sm" onClick={onClassify}>
            <Brain className="w-4 h-4" />
          </Button>
        )}
        
        {item.status === 'extracting' && (
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4 animate-pulse text-cyan-500" />
            <span className="text-xs text-cyan-500">PDF</span>
          </div>
        )}
        
        {item.status === 'classifying' && (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        )}
        
        {item.status === 'classified' && (
          <>
            <Button variant="ghost" size="sm" onClick={onAccept} className="text-green-600 hover:text-green-700">
              <Check className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onReject} className="text-orange-600 hover:text-orange-700">
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
        
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}