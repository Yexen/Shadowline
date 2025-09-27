'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, PanelRightClose, PanelRightOpen, Folder, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodexNode {
  id: string;
  path: string;
  title: string;
  type: 'document' | 'character' | 'location' | 'concept' | 'event' | 'folder';
}

interface TreeNode {
  path: string;
  name: string;
  children: TreeNode[];
  nodeId?: string; // If this path has a document
  type: 'folder' | 'document';
  icon?: string;
}

interface PathTreeSidebarProps {
  nodes: CodexNode[];
  currentPath: string;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
}

export function PathTreeSidebar({
  nodes,
  currentPath,
  collapsed,
  onToggle,
  onNavigate
}: PathTreeSidebarProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(['/']) // Root is expanded by default
  );

  // Build tree structure from nodes
  const buildTree = (nodes: CodexNode[]): TreeNode[] => {
    const tree: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // First, create all nodes and folders
    nodes.forEach(node => {
      const segments = node.path.split('/').filter(Boolean);
      let currentPath = '';

      segments.forEach((segment, index) => {
        const parentPath = currentPath;
        currentPath = currentPath + '/' + segment;

        if (!nodeMap.has(currentPath)) {
          const treeNode: TreeNode = {
            path: currentPath,
            name: segment,
            children: [],
            type: index === segments.length - 1 ? 'document' : 'folder',
            nodeId: index === segments.length - 1 ? node.id : undefined,
            icon: getTypeIcon(node.type)
          };

          nodeMap.set(currentPath, treeNode);

          // Add to parent or root
          if (parentPath && nodeMap.has(parentPath)) {
            nodeMap.get(parentPath)!.children.push(treeNode);
          } else if (parentPath === '') {
            tree.push(treeNode);
          }
        }
      });
    });

    return tree;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'character': return '👤';
      case 'location': return '🏛️';
      case 'concept': return '💭';
      case 'event': return '⚡';
      default: return '📄';
    }
  };

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedPaths.has(node.path);
      const isCurrent = node.path === currentPath;
      const hasChildren = node.children.length > 0;

      return (
        <div key={node.path} className="select-none">
          <div
            className={`flex items-center gap-1 py-1 px-2 hover:bg-muted/50 rounded-sm cursor-pointer transition-colors ${
              isCurrent ? 'bg-primary/10 text-primary' : ''
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => {
              if (node.type === 'document') {
                onNavigate(node.path);
              } else if (hasChildren) {
                toggleExpanded(node.path);
              }
            }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.path);
                }}
                className="p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}

            <span className="mr-1">
              {node.type === 'folder' ? (
                <Folder className="w-4 h-4" />
              ) : (
                <span className="text-sm">{node.icon}</span>
              )}
            </span>

            <span className="text-sm truncate flex-1">
              {node.name}
            </span>

            {isCurrent && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>

          {hasChildren && isExpanded && (
            <div>
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const tree = buildTree(nodes);

  if (collapsed) {
    return (
      <div className="w-8 border-l border-border bg-background/50 flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="m-1 p-1 h-6 w-6"
          title="Expand path tree"
        >
          <PanelRightOpen className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-background/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Path Tree</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1 h-6 w-6"
            title="Collapse sidebar"
          >
            <PanelRightClose className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-2">
        {tree.length > 0 ? (
          renderTree(tree)
        ) : (
          <div className="text-center text-muted-foreground text-sm py-8">
            No pages yet
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="p-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            // TODO: Implement create new page
            console.log('Create new page');
          }}
        >
          + New Page
        </Button>
      </div>
    </div>
  );
}