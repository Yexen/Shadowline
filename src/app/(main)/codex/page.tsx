'use client';

import { useState, useEffect } from 'react';
import { PathBreadcrumb } from '@/components/codex/path-breadcrumb';
import { PathTreeSidebar } from '@/components/codex/path-tree-sidebar';
import { BlockEditor } from '@/components/codex/block-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, MapPin, Lightbulb, Calendar, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const handleCharacterImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    try {
      const importedCharacters = await importCharacterFromFiles(files);

      if (importedCharacters.length > 0) {
        // Add characters to Codex
        setNodes(prev => [...prev, ...importedCharacters]);

        // Add characters to Bible with bidirectional sync
        for (const character of importedCharacters) {
          if (character.bibleEntry) {
            addEntry('Characters', character.bibleEntry);
          }
        }

        toast({
          title: 'Characters Imported',
          description: `Successfully imported ${importedCharacters.length} character(s) to both Codex and Bible.`,
        });

        // Navigate to the first imported character
        if (importedCharacters.length === 1) {
          setCurrentPath(importedCharacters[0].path);
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
      // Reset file input
      event.target.value = '';
    }
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
              onCharacterImport={handleCharacterImport}
              isImporting={isImporting}
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
    </div>
  );
}

function CodexHomePage({ nodes, onNavigate, onCharacterImport, isImporting }: {
  nodes: CodexNode[],
  onNavigate: (path: string) => void,
  onCharacterImport: (event: React.ChangeEvent<HTMLInputElement>) => void,
  isImporting: boolean
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
              return (
                <Card
                  key={node.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => onNavigate(node.path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">{node.title}</CardTitle>
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