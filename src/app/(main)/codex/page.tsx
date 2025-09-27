'use client';

import { useState, useEffect } from 'react';
import { PathBreadcrumb } from '@/components/codex/path-breadcrumb';
import { PathTreeSidebar } from '@/components/codex/path-tree-sidebar';
import { BlockEditor } from '@/components/codex/block-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, MapPin, Lightbulb, Calendar, Plus, Upload, Trash2, Move, MoreHorizontal, Edit, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { importCharacterFromFiles, type ImportedCharacter } from '@/lib/character-importer';
import { useBible } from '@/hooks/use-bible';
import { SyncManager } from '@/lib/sync-manager';

interface CodexNode {
  id: string;
  path: string;
  title: string;
  content: string;
  type: 'document' | 'character' | 'location' | 'concept' | 'event';
  lastModified: Date;
}

export default function CodexPage() {
  const [currentPath, setCurrentPath] = useState('/');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentNode, setCurrentNode] = useState<CodexNode | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importPath, setImportPath] = useState('/characters/');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [movePath, setMovePath] = useState('');
  const { toast } = useToast();
  const { addEntry, updateEntry, entries } = useBible();

  // Initialize sync manager
  const syncManager = new SyncManager(
    (nodeId: string, updates: Partial<CodexNode>) => {
      setNodes(prev => prev.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      ));
    },
    (category: string, entryTitle: string, updates: any) => {
      updateEntry(category, entryTitle, updates);
    },
    (category: string, entry: any) => {
      addEntry(category, entry);
    }
  );
  const [nodes, setNodes] = useState<CodexNode[]>([
    {
      id: '1',
      path: '/characters/batman/bruce-wayne',
      title: 'Bruce Wayne - The Dark Knight',
      content: `# Bruce Wayne - The Dark Knight

Born into wealth but orphaned at age 8, Bruce Wayne transformed his tragedy into purpose, becoming Gotham's greatest protector.

## Identity
- **Real Name**: Bruce Wayne
- **Aliases**: Batman, The Dark Knight, World's Greatest Detective
- **Age**: 35-40 (varies by continuity)

## Relationships
- @alfred-pennyworth - Butler, father figure, and closest confidant
- @commissioner-gordon - Trusted ally in the GCPD
- @joker - Greatest enemy and philosophical opposite

## Background
The murder of his parents Thomas and Martha Wayne in Crime Alley forever changed young Bruce. After years of training around the world, he returned to Gotham to wage war on crime as Batman.

## Resources
- Wayne Enterprises - Multi-billion dollar corporation
- Wayne Manor - Ancestral home and secret base
- The Batcave - High-tech command center beneath Wayne Manor`,
      type: 'character',
      lastModified: new Date('2025-09-20')
    },
    {
      id: '2',
      path: '/characters/batman/alfred-pennyworth',
      title: 'Alfred Pennyworth',
      content: `# Alfred Pennyworth

The loyal butler of Wayne Manor and surrogate father to Bruce Wayne.

## Identity
- **Real Name**: Alfred Thaddeus Crane Pennyworth
- **Occupation**: Butler, Medical Assistant, Technical Support
- **Background**: Former British Intelligence

## Role
More than just a butler, Alfred serves as:
- Medical support for Batman's injuries
- Technical assistance with gadgets and vehicles
- Emotional anchor and moral compass
- Guardian of Bruce Wayne's secret identity`,
      type: 'character',
      lastModified: new Date('2025-09-19')
    },
    {
      id: '3',
      path: '/locations/gotham/arkham-asylum',
      title: 'Arkham Asylum',
      content: `# Arkham Asylum

## Overview
Arkham Asylum is Gotham City's psychiatric hospital for the criminally insane.

## Notable Inmates
- The Joker
- Two-Face
- Scarecrow
- Poison Ivy
- The Riddler

## Architecture
Gothic revival architecture with:
- High security wings
- Solitary confinement cells
- Medical facilities
- Underground tunnels (frequent escape routes)`,
      type: 'location',
      lastModified: new Date('2025-09-18')
    }
  ]);

  // Load current node based on path
  useEffect(() => {
    const node = nodes.find(n => n.path === currentPath);
    setCurrentNode(node || null);
  }, [currentPath, nodes]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleContentChange = (content: string) => {
    if (currentNode) {
      const updatedNode = { ...currentNode, content, lastModified: new Date() };

      setNodes(prev => prev.map(node =>
        node.id === currentNode.id ? updatedNode : node
      ));

      // Sync changes to Bible for character nodes
      if (updatedNode.type === 'character') {
        syncManager.syncCodexToBible(updatedNode);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      setShowImportDialog(true);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleImportConfirm = async () => {
    if (!selectedFiles) return;

    setIsImporting(true);
    setShowImportDialog(false);

    try {
      const importedCharacters = await importCharacterFromFiles(selectedFiles);

      if (importedCharacters.length > 0) {
        // Update paths with user-specified path
        const updatedCharacters = importedCharacters.map(char => {
          const pathSuffix = char.path.split('/').pop() || char.title.toLowerCase().replace(/\s+/g, '-');
          const newPath = importPath.endsWith('/') ? importPath + pathSuffix : importPath + '/' + pathSuffix;
          return { ...char, path: newPath };
        });

        // Add characters to Codex
        setNodes(prev => [...prev, ...updatedCharacters]);

        // Add characters to Bible with bidirectional sync
        for (const character of updatedCharacters) {
          if (character.bibleEntry) {
            addEntry('Characters', character.bibleEntry);
          }
        }

        toast({
          title: 'Characters Imported',
          description: `Successfully imported ${updatedCharacters.length} character(s) to ${importPath}`,
        });

        // Navigate to the first imported character
        if (updatedCharacters.length === 1) {
          setCurrentPath(updatedCharacters[0].path);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'No valid character data found in the uploaded files.',
        });
      }
    } catch (error) {
      console.error('Character import error:', error);
      toast({
        variant: 'destructive',
        title: 'Import Error',
        description: 'Failed to import character files. Please try again.',
      });
    } finally {
      setIsImporting(false);
      setSelectedFiles(null);
    }
  };

  const handleSelectNode = (nodeId: string, checked: boolean) => {
    const newSelected = new Set(selectedNodes);
    if (checked) {
      newSelected.add(nodeId);
    } else {
      newSelected.delete(nodeId);
    }
    setSelectedNodes(newSelected);
  };

  const handleDeleteSelected = () => {
    const nodesToDelete = Array.from(selectedNodes);
    setNodes(prev => prev.filter(node => !nodesToDelete.includes(node.id)));
    setSelectedNodes(new Set());

    toast({
      title: 'Nodes Deleted',
      description: `Deleted ${nodesToDelete.length} node(s) from Codex.`,
    });
  };

  const handleMoveSelected = () => {
    setMovePath(currentPath);
    setShowMoveDialog(true);
  };

  const handleMoveConfirm = () => {
    const nodesToMove = Array.from(selectedNodes);

    setNodes(prev => prev.map(node => {
      if (nodesToMove.includes(node.id)) {
        const pathSuffix = node.path.split('/').pop() || node.title.toLowerCase().replace(/\s+/g, '-');
        const newPath = movePath.endsWith('/') ? movePath + pathSuffix : movePath + '/' + pathSuffix;
        return { ...node, path: newPath };
      }
      return node;
    }));

    setSelectedNodes(new Set());
    setShowMoveDialog(false);

    toast({
      title: 'Nodes Moved',
      description: `Moved ${nodesToMove.length} node(s) to ${movePath}`,
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Path Breadcrumb */}
          <PathBreadcrumb
            path={currentPath}
            onNavigate={handleNavigate}
          />

          {/* Page Title */}
          {currentNode && (
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 text-foreground">
                {currentNode.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Last modified {currentNode.lastModified.toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Content */}
          {currentPath === '/' ? (
            <CodexHomePage
              nodes={nodes}
              onNavigate={handleNavigate}
              onCharacterImport={handleFileSelect}
              isImporting={isImporting}
              selectedNodes={selectedNodes}
              onSelectNode={handleSelectNode}
              onDeleteSelected={handleDeleteSelected}
              onMoveSelected={handleMoveSelected}
            />
          ) : currentNode ? (
            <BlockEditor
              initialContent={currentNode.content}
              onChange={handleContentChange}
            />
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
              <p>The path <code className="bg-muted px-2 py-1 rounded">{currentPath}</code> doesn't exist.</p>
            </div>
          )}
        </div>
      </div>

      {/* Path Tree Sidebar */}
      <PathTreeSidebar
        nodes={nodes}
        currentPath={currentPath}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={handleNavigate}
      />

      {/* Import Path Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Characters</DialogTitle>
            <DialogDescription>
              Choose where to import the selected character files in your Codex.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="import-path">Import Path</Label>
              <Input
                id="import-path"
                value={importPath}
                onChange={(e) => setImportPath(e.target.value)}
                placeholder="/characters/"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Characters will be imported to this path. Use forward slashes for hierarchy.
              </p>
            </div>

            {selectedFiles && (
              <div>
                <Label>Selected Files</Label>
                <div className="mt-1 p-2 border rounded text-sm">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index}>{file.name}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportConfirm} disabled={!importPath.trim()}>
              Import Characters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Selected Nodes</DialogTitle>
            <DialogDescription>
              Choose the new path for the selected nodes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="move-path">New Path</Label>
              <Input
                id="move-path"
                value={movePath}
                onChange={(e) => setMovePath(e.target.value)}
                placeholder="/new/location/"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Selected Nodes ({selectedNodes.size})</Label>
              <div className="mt-1 p-2 border rounded text-sm max-h-32 overflow-y-auto">
                {Array.from(selectedNodes).map(nodeId => {
                  const node = nodes.find(n => n.id === nodeId);
                  return node ? (
                    <div key={nodeId} className="flex justify-between">
                      <span>{node.title}</span>
                      <span className="text-muted-foreground">{node.path}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveConfirm} disabled={!movePath.trim()}>
              Move Nodes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CodexHomePage({
  nodes,
  onNavigate,
  onCharacterImport,
  isImporting,
  selectedNodes,
  onSelectNode,
  onDeleteSelected,
  onMoveSelected
}: {
  nodes: CodexNode[],
  onNavigate: (path: string) => void,
  onCharacterImport: (event: React.ChangeEvent<HTMLInputElement>) => void,
  isImporting: boolean,
  selectedNodes: Set<string>,
  onSelectNode: (nodeId: string, checked: boolean) => void,
  onDeleteSelected: () => void,
  onMoveSelected: () => void
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'character': return Users;
      case 'location': return MapPin;
      case 'concept': return Lightbulb;
      case 'event': return Calendar;
      default: return BookOpen;
    }
  };

  const getTypeStats = () => {
    const stats = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { type: 'character', count: stats.character || 0, icon: Users, label: 'Characters' },
      { type: 'location', count: stats.location || 0, icon: MapPin, label: 'Locations' },
      { type: 'concept', count: stats.concept || 0, icon: Lightbulb, label: 'Concepts' },
      { type: 'event', count: stats.event || 0, icon: Calendar, label: 'Events' },
    ];
  };

  const recentNodes = nodes
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
          Codex
        </h1>
        <p className="text-muted-foreground text-lg">
          Your world-building knowledge base
        </p>
      </div>

      {/* Stats Overview */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getTypeStats().map(({ type, count, icon: Icon, label }) => (
            <Card key={type} className="text-center">
              <CardContent className="pt-6">
                <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Activity</h2>
          <div className="flex gap-2">
            {selectedNodes.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMoveSelected}
                >
                  <Move className="w-4 h-4 mr-2" />
                  Move ({selectedNodes.size})
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteSelected}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedNodes.size})
                </Button>
              </>
            )}
            <input
              type="file"
              accept=".html"
              multiple
              onChange={onCharacterImport}
              className="hidden"
              id="character-import-input"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('character-import-input')?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Character
                </>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </div>
        </div>

        {recentNodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNodes.map((node) => {
              const Icon = getTypeIcon(node.type);
              const isSelected = selectedNodes.has(node.id);

              return (
                <Card
                  key={node.id}
                  className={`relative transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectNode(node.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Icon className="w-4 h-4 text-primary" />
                      <CardTitle
                        className="text-sm cursor-pointer flex-1"
                        onClick={() => onNavigate(node.path)}
                      >
                        {node.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onNavigate(node.path)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSelectNode(node.id, !isSelected)}>
                            <FolderOpen className="w-4 h-4 mr-2" />
                            {isSelected ? 'Deselect' : 'Select'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">{node.path}</p>
                    <p className="text-xs text-muted-foreground">
                      Modified {node.lastModified.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
              <p className="text-muted-foreground mb-4">Start building your world by creating your first page</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Page
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}