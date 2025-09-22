'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  X,
  Eye,
  Hash,
  AtSign,
  Brain,
  FileText,
  Link2,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { type CodexNode } from '@/lib/codex-system';

interface CodexEditorProps {
  node?: CodexNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: Partial<CodexNode>) => Promise<void>;
}

const NODE_TYPES = [
  { value: 'document', label: 'Document', icon: '📄', description: 'General content document' },
  { value: 'character', label: 'Character', icon: '👤', description: 'Character profile or info' },
  { value: 'location', label: 'Location', icon: '🏛️', description: 'Place or setting' },
  { value: 'concept', label: 'Concept', icon: '💭', description: 'Abstract idea or theory' },
  { value: 'event', label: 'Event', icon: '⚡', description: 'Specific occurrence or happening' },
  { value: 'timeline', label: 'Timeline', icon: '📅', description: 'Chronological sequence' },
  { value: 'reference', label: 'Reference', icon: '📎', description: 'External reference or citation' },
  { value: 'relationship', label: 'Relationship', icon: '🔗', description: 'Connection between entities' }
] as const;

export function CodexEditor({ node, isOpen, onClose, onSave }: CodexEditorProps) {
  const [formData, setFormData] = useState({
    path: node?.path || '',
    title: node?.title || '',
    content: node?.content || '',
    type: node?.type || 'document',
    tags: node?.tags?.join(', ') || '',
    mentions: node?.mentions?.join(', ') || '',
    parentPath: node?.parentPath || ''
  });

  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState({
    tags: [] as string[],
    mentions: [] as string[],
    relatedPaths: [] as string[]
  });

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && formData.content) {
      generateAiSuggestions();
    }
  }, [isOpen, formData.content]);

  const generateAiSuggestions = async () => {
    // Mock AI suggestions - in production, this would call actual AI services
    const content = formData.content.toLowerCase();

    const suggestedTags = [];
    const suggestedMentions = [];
    const suggestedPaths = [];

    // Simple keyword-based suggestions
    if (content.includes('batman') || content.includes('bruce')) {
      suggestedTags.push('batman', 'gotham');
      suggestedMentions.push('/characters/batman/bruce-wayne');
    }
    if (content.includes('gotham')) {
      suggestedTags.push('gotham', 'city');
      suggestedMentions.push('/locations/gotham');
    }
    if (content.includes('philosophy') || content.includes('theory')) {
      suggestedTags.push('philosophy', 'theory');
    }
    if (content.includes('alfred')) {
      suggestedMentions.push('/characters/batman/alfred-pennyworth');
    }

    // Suggest related paths based on current path
    if (formData.path.includes('/characters/')) {
      suggestedPaths.push('/characters/', '/relationships/');
    } else if (formData.path.includes('/locations/')) {
      suggestedPaths.push('/locations/', '/events/');
    }

    setAiSuggestions({
      tags: suggestedTags,
      mentions: suggestedMentions,
      relatedPaths: suggestedPaths
    });
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.path.trim()) {
      errors.push('Path is required');
    } else if (!formData.path.startsWith('/')) {
      errors.push('Path must start with /');
    }

    if (!formData.title.trim()) {
      errors.push('Title is required');
    }

    if (!formData.content.trim()) {
      errors.push('Content is required');
    }

    if (formData.path.includes(' ')) {
      errors.push('Path cannot contain spaces');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const nodeData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        mentions: formData.mentions.split(',').map(m => m.trim()).filter(Boolean)
      };

      await onSave(nodeData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSuggestedTag = (tag: string) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
    if (!currentTags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: currentTags.length > 0 ? `${prev.tags}, ${tag}` : tag
      }));
    }
  };

  const addSuggestedMention = (mention: string) => {
    const currentMentions = formData.mentions ? formData.mentions.split(',').map(m => m.trim()) : [];
    if (!currentMentions.includes(mention)) {
      setFormData(prev => ({
        ...prev,
        mentions: currentMentions.length > 0 ? `${prev.mentions}, ${mention}` : mention
      }));
    }
  };

  const insertAtCursor = (text: string) => {
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = formData.content.substring(0, start) + text + formData.content.substring(end);

    setFormData(prev => ({ ...prev, content: newContent }));

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const renderPreview = () => {
    const content = formData.content;

    // Simple markdown-like rendering for preview
    const processedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/@([a-zA-Z0-9\/\-_]+)/g, '<span class="text-primary font-medium">@$1</span>')
      .replace(/#([a-zA-Z0-9\-_]+)/g, '<span class="text-blue-400">#$1</span>')
      .replace(/\n/g, '<br>');

    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  };

  if (!isOpen) return null;

  const selectedNodeType = NODE_TYPES.find(type => type.value === formData.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-6xl w-full max-h-[95vh] overflow-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {node ? 'Edit Node' : 'Create Node'}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {selectedNodeType?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Validation Errors</span>
              </div>
              <ul className="text-sm text-destructive space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* Main Content Area */}
            <div className="col-span-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="path">Path *</Label>
                  <Input
                    id="path"
                    placeholder="/characters/batman/bruce-wayne"
                    value={formData.path}
                    onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NODE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="content">Content *</Label>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{formData.content.split(' ').length} words</span>
                    <span>•</span>
                    <span>{Math.ceil(formData.content.split(' ').length / 200)} min read</span>
                  </div>
                </div>

                {isPreview ? (
                  <div className="min-h-[300px] p-4 border rounded-lg bg-muted/20">
                    {renderPreview()}
                  </div>
                ) : (
                  <Textarea
                    ref={contentRef}
                    id="content"
                    placeholder="Enter your content here... Use @path for mentions and #tag for tags"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[300px] resize-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="batman, gotham, character"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="mentions">Mentions</Label>
                  <Input
                    id="mentions"
                    placeholder="/characters/batman, /locations/gotham"
                    value={formData.mentions}
                    onChange={(e) => setFormData(prev => ({ ...prev, mentions: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>AI Suggestions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiSuggestions.tags.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Suggested Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiSuggestions.tags.map(tag => (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => addSuggestedTag(tag)}
                          >
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiSuggestions.mentions.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Suggested Mentions</Label>
                      <div className="space-y-1 mt-1">
                        {aiSuggestions.mentions.map(mention => (
                          <Button
                            key={mention}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs w-full justify-start"
                            onClick={() => addSuggestedMention(mention)}
                          >
                            <AtSign className="h-3 w-3 mr-1" />
                            {mention}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => insertAtCursor('@')}
                  >
                    <AtSign className="h-3 w-3 mr-2" />
                    Add Mention
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => insertAtCursor('**Bold Text**')}
                  >
                    <strong className="mr-2">B</strong>
                    Bold Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => insertAtCursor('*Italic Text*')}
                  >
                    <em className="mr-2">I</em>
                    Italic Text
                  </Button>
                </CardContent>
              </Card>

              {node && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Node Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(node.created).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modified:</span>
                      <span>{new Date(node.lastModified).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>{node.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completeness:</span>
                      <span>{node.metadata.completeness}%</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>Auto-save enabled</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {node ? 'Update Node' : 'Create Node'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}