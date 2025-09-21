'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  FolderTree,
  Hash,
  Brain,
  Link2,
  FileText,
  Zap,
  BookOpen,
  Archive,
  Star,
  Clock,
  Filter
} from 'lucide-react';
import { CodexEditor } from '@/components/codex-editor';

interface CodexNode {
  id: string;
  path: string;
  title: string;
  content: string;
  type: 'document' | 'reference' | 'concept' | 'character' | 'location' | 'event';
  tags: string[];
  mentions: string[];
  lastModified: Date;
  aiExtracted?: {
    summary: string;
    keyPoints: string[];
    connections: string[];
  };
}

interface PathHierarchy {
  path: string;
  children: PathHierarchy[];
  nodeCount: number;
}

export default function CodexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<CodexNode | null>(null);
  const [nodes, setNodes] = useState<CodexNode[]>([
    {
      id: '1',
      path: '/characters/batman/bruce-wayne',
      title: 'Bruce Wayne - The Dark Knight',
      content: 'Bruce Wayne is the secret identity of Batman, a billionaire industrialist who fights crime in Gotham City...',
      type: 'character',
      tags: ['batman', 'protagonist', 'wayne-enterprises'],
      mentions: ['/locations/gotham/wayne-manor', '/events/parents-death'],
      lastModified: new Date('2025-09-20'),
      aiExtracted: {
        summary: 'Billionaire vigilante operating as Batman in Gotham City',
        keyPoints: ['Secret identity', 'Wealthy industrialist', 'Crime fighter', 'Orphaned as child'],
        connections: ['Alfred Pennyworth', 'Wayne Enterprises', 'Gotham City', 'Bat Family']
      }
    },
    {
      id: '2',
      path: '/locations/gotham/arkham-asylum',
      title: 'Arkham Asylum',
      content: 'Arkham Asylum is a psychiatric hospital serving the Gotham City area, housing many of Batman\'s most dangerous foes...',
      type: 'location',
      tags: ['gotham', 'asylum', 'villains'],
      mentions: ['/characters/batman/bruce-wayne', '/characters/villains/joker'],
      lastModified: new Date('2025-09-19'),
      aiExtracted: {
        summary: 'Psychiatric facility for Gotham\'s criminal insane',
        keyPoints: ['High security', 'Houses supervillains', 'Frequent escapes', 'Gothic architecture'],
        connections: ['Joker', 'Two-Face', 'Scarecrow', 'Batman']
      }
    },
    {
      id: '3',
      path: '/concepts/aesthetic-language-theory',
      title: 'Aesthetic Language Theory',
      content: 'A philosophical framework exploring the intersection of language, aesthetics, and meaning formation...',
      type: 'concept',
      tags: ['philosophy', 'language', 'aesthetics'],
      mentions: ['/concepts/anti-essentialism'],
      lastModified: new Date('2025-09-21'),
      aiExtracted: {
        summary: 'Philosophical exploration of language and aesthetic meaning',
        keyPoints: ['Language as art', 'Meaning formation', 'Anti-essentialist stance', 'Creative expression'],
        connections: ['Post-structuralism', 'Literary theory', 'Semiotics']
      }
    }
  ]);
  const [hierarchy, setHierarchy] = useState<PathHierarchy[]>([]);
  const [activeTab, setActiveTab] = useState('explorer');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNode, setEditingNode] = useState<CodexNode | null>(null);

  useEffect(() => {
    // Build path hierarchy from nodes
    const buildHierarchy = (nodes: CodexNode[]): PathHierarchy[] => {
      const pathMap = new Map<string, PathHierarchy>();

      // Initialize with all paths
      nodes.forEach(node => {
        const parts = node.path.split('/').filter(Boolean);
        let currentPath = '';

        parts.forEach((part, index) => {
          const parentPath = currentPath;
          currentPath += '/' + part;

          if (!pathMap.has(currentPath)) {
            pathMap.set(currentPath, {
              path: currentPath,
              children: [],
              nodeCount: 0
            });
          }

          if (parentPath && pathMap.has(parentPath)) {
            const parent = pathMap.get(parentPath)!;
            const current = pathMap.get(currentPath)!;
            if (!parent.children.includes(current)) {
              parent.children.push(current);
            }
          }
        });

        // Increment node count for the exact path
        const nodeHierarchy = pathMap.get(node.path);
        if (nodeHierarchy) {
          nodeHierarchy.nodeCount++;
        }
      });

      // Return root level items
      return Array.from(pathMap.values()).filter(h => !h.path.includes('/', 1));
    };

    setHierarchy(buildHierarchy(nodes));
  }, [nodes]);

  const filteredNodes = nodes.filter(node =>
    node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderHierarchy = (items: PathHierarchy[], level = 0) => {
    return items.map(item => (
      <div key={item.path} className={`ml-${level * 4}`}>
        <div className="flex items-center space-x-2 py-1 px-2 hover:bg-accent rounded-md cursor-pointer">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{item.path.split('/').pop()}</span>
          {item.nodeCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {item.nodeCount}
            </Badge>
          )}
        </div>
        {item.children.length > 0 && renderHierarchy(item.children, level + 1)}
      </div>
    ));
  };

  const getTypeIcon = (type: CodexNode['type']) => {
    switch (type) {
      case 'character': return '👤';
      case 'location': return '🏛️';
      case 'concept': return '💭';
      case 'event': return '⚡';
      case 'reference': return '📎';
      default: return '📄';
    }
  };

  const getTypeColor = (type: CodexNode['type']) => {
    switch (type) {
      case 'character': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'location': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'concept': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'event': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'reference': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleCreateNode = () => {
    setEditingNode(null);
    setShowEditor(true);
  };

  const handleEditNode = (node: CodexNode) => {
    setEditingNode(node);
    setShowEditor(true);
  };

  const handleSaveNode = async (nodeData: any) => {
    try {
      const method = editingNode ? 'PUT' : 'POST';
      const url = editingNode
        ? `/api/codex/nodes/${editingNode.id}`
        : '/api/codex/nodes';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeData)
      });

      if (!response.ok) {
        throw new Error('Failed to save node');
      }

      const result = await response.json();

      if (editingNode) {
        // Update existing node
        setNodes(prev => prev.map(n =>
          n.id === editingNode.id ? result.node : n
        ));
      } else {
        // Add new node
        setNodes(prev => [...prev, result.node]);
      }

      setShowEditor(false);
      setEditingNode(null);
    } catch (error) {
      console.error('Error saving node:', error);
      // In a real app, show error notification
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Codex
              </h1>
              <p className="text-muted-foreground text-lg">
                Universal Content Management System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content, paths, @mentions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateNode}>
              <Plus className="h-4 w-4 mr-2" />
              New Node
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FolderTree className="h-5 w-5" />
                  <span>Path Explorer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {renderHierarchy(hierarchy)}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="explorer" className="flex items-center space-x-2">
                  <Archive className="h-4 w-4" />
                  <span>Explorer</span>
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </TabsTrigger>
                <TabsTrigger value="ai-insights" className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>AI Insights</span>
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center space-x-2">
                  <Link2 className="h-4 w-4" />
                  <span>Connections</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explorer" className="space-y-4">
                <div className="grid gap-4">
                  {filteredNodes.map(node => (
                    <Card
                      key={node.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedNode(node)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getTypeIcon(node.type)}</span>
                            <div>
                              <CardTitle className="text-lg">{node.title}</CardTitle>
                              <p className="text-sm text-muted-foreground font-mono">
                                {node.path}
                              </p>
                            </div>
                          </div>
                          <Badge className={getTypeColor(node.type)}>
                            {node.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {node.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {node.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                            {node.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{node.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{node.lastModified.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="search" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Search</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Content Type</label>
                          <select className="w-full p-2 border rounded-md">
                            <option>All Types</option>
                            <option>Character</option>
                            <option>Location</option>
                            <option>Concept</option>
                            <option>Event</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Path Filter</label>
                          <Input placeholder="/characters/batman/*" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">@Mentions</label>
                        <Input placeholder="Find content mentioning..." />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-insights" className="space-y-4">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="h-5 w-5" />
                        <span>Consistency Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <span className="text-sm">Character consistency across all references</span>
                          <Badge className="bg-green-500/20 text-green-400">98%</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <span className="text-sm">Timeline consistency needs review</span>
                          <Badge className="bg-yellow-500/20 text-yellow-400">3 conflicts</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <span className="text-sm">Missing connections detected</span>
                          <Badge className="bg-blue-500/20 text-blue-400">12 suggestions</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="connections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Link2 className="h-5 w-5" />
                      <span>Content Network</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Connection visualization coming soon</p>
                      <p className="text-sm">Explore relationships between content nodes</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Selected Node Detail Modal */}
        {selectedNode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getTypeIcon(selectedNode.type)}</span>
                    <div>
                      <CardTitle className="text-xl">{selectedNode.title}</CardTitle>
                      <p className="text-muted-foreground font-mono text-sm">
                        {selectedNode.path}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Content</h3>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedNode.content}</p>
                  </div>
                </div>

                {selectedNode.aiExtracted && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>AI Analysis</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Summary</p>
                        <p className="text-sm">{selectedNode.aiExtracted.summary}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Key Points</p>
                        <ul className="text-sm space-y-1">
                          {selectedNode.aiExtracted.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.tags.map(tag => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Mentions</h3>
                    <div className="space-y-1">
                      {selectedNode.mentions.map(mention => (
                        <div key={mention} className="text-sm text-primary hover:underline cursor-pointer">
                          @{mention}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Codex Editor */}
        <CodexEditor
          node={editingNode || undefined}
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            setEditingNode(null);
          }}
          onSave={handleSaveNode}
        />
      </div>
    </div>
  );
}