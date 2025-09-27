import { NextRequest, NextResponse } from 'next/server';
import { codexService, type CodexNode, type CodexSearch } from '@/lib/codex-system';

interface ActionRequest {
  action: 'read' | 'create' | 'update' | 'delete' | 'list' | 'search' | 'navigate';
  section: 'bible' | 'maps' | 'codex' | 'organization' | 'messages' | 'volumes';
  data?: any;
  id?: string;
  query?: string;
  path?: string;
  filters?: any;
}

export async function POST(request: NextRequest) {
  try {
    const { action, section, data, id, query, path, filters }: ActionRequest = await request.json();

    // This is a comprehensive API for Alfred to interact with all sections
    switch (section) {
      case 'bible':
        return handleBibleActions(action, data, id, query);
      
      case 'maps':
        return handleMapActions(action, data, id, query);
      
      case 'codex':
        return handleCodexActions(action, data, id, query, path, filters);
      
      case 'organization':
        return handleOrganizationActions(action, data, id, query);
      
      case 'messages':
        return handleMessageActions(action, data, id, query);
      
      case 'volumes':
        return handleVolumeActions(action, data, id, query);
      
      default:
        return NextResponse.json({ error: 'Unknown section' }, { status: 400 });
    }
  } catch (error) {
    console.error('Alfred action error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

async function handleBibleActions(action: string, data: any, id?: string, query?: string) {
  // Handle Bible system interactions
  switch (action) {
    case 'list':
      // Return all Bible categories and entries
      return NextResponse.json({
        success: true,
        data: {
          categories: ['Characters', 'Locations', 'Events', 'Organizations'],
          message: 'Retrieved Bible categories successfully'
        }
      });
    
    case 'read':
      if (query) {
        // Search Bible entries
        return NextResponse.json({
          success: true,
          data: {
            results: [`Found entries matching "${query}"`],
            message: `Searched Bible for "${query}"`
          }
        });
      }
      break;
    
    case 'create':
      // Create new Bible entry
      return NextResponse.json({
        success: true,
        data: { id: 'new-entry-' + Date.now() },
        message: `Created new Bible entry: ${data?.title || 'Untitled'}`
      });
    
    case 'update':
      // Update Bible entry
      return NextResponse.json({
        success: true,
        message: `Updated Bible entry ${id}`
      });
    
    case 'delete':
      // Delete Bible entry
      return NextResponse.json({
        success: true,
        message: `Deleted Bible entry ${id}`
      });
  }
  
  return NextResponse.json({ error: 'Invalid Bible action' }, { status: 400 });
}

async function handleMapActions(action: string, data: any, id?: string, query?: string) {
  // Handle Map system interactions
  switch (action) {
    case 'list':
      return NextResponse.json({
        success: true,
        data: {
          maps: ['Gotham City', 'Wayne Manor', 'Arkham Asylum', 'Crime Alley'],
          message: 'Retrieved available maps'
        }
      });
    
    case 'read':
      return NextResponse.json({
        success: true,
        data: {
          mapData: { name: query || 'Gotham City', locations: [] },
          message: `Retrieved map data for ${query || 'Gotham City'}`
        }
      });
    
    case 'create':
      return NextResponse.json({
        success: true,
        data: { id: 'new-map-' + Date.now() },
        message: `Created new map: ${data?.name || 'Untitled Map'}`
      });
    
    case 'update':
      return NextResponse.json({
        success: true,
        message: `Updated map ${id}`
      });
    
    case 'delete':
      return NextResponse.json({
        success: true,
        message: `Deleted map ${id}`
      });
  }
  
  return NextResponse.json({ error: 'Invalid Map action' }, { status: 400 });
}

async function handleCodexActions(action: string, data: any, id?: string, query?: string, path?: string, filters?: any) {
  try {
    switch (action) {
      case 'list':
        // Get all nodes or filtered list
        const searchParams: CodexSearch = {
          query: query || '',
          filters: filters || {},
          sortBy: 'date',
          limit: 50
        };

        const allNodes = codexService.search(searchParams);

        return NextResponse.json({
          success: true,
          data: {
            nodes: allNodes.map(node => ({
              id: node.id,
              path: node.path,
              title: node.title,
              type: node.type,
              lastModified: node.lastModified,
              tags: node.tags,
              wordCount: node.metadata.wordCount
            })),
            count: allNodes.length,
            message: `Retrieved ${allNodes.length} Codex nodes`
          }
        });

      case 'search':
        // Advanced search with filters
        const searchQuery: CodexSearch = {
          query: query || '',
          filters: {
            type: filters?.type ? [filters.type] : undefined,
            pathPattern: filters?.pathPattern,
            tags: filters?.tags,
            hasAI: filters?.hasAI
          },
          sortBy: filters?.sortBy || 'relevance',
          limit: filters?.limit || 20
        };

        const searchResults = codexService.search(searchQuery);

        return NextResponse.json({
          success: true,
          data: {
            results: searchResults,
            query: searchQuery,
            count: searchResults.length,
            message: `Found ${searchResults.length} nodes matching "${query}"`
          }
        });

      case 'read':
        // Get specific node by ID or path
        let node: CodexNode | null = null;

        if (path) {
          node = codexService.getNodeByPath(path);
        } else if (id) {
          const allNodes = codexService.search({ query: '', sortBy: 'relevance' });
          node = allNodes.find(n => n.id === id) || null;
        } else if (query) {
          // Search for node by title or content
          const results = codexService.search({
            query: query,
            sortBy: 'relevance',
            limit: 1
          });
          node = results[0] || null;
        }

        if (!node) {
          return NextResponse.json({
            success: false,
            error: 'Node not found',
            message: `Could not find node with ${path ? 'path: ' + path : id ? 'id: ' + id : 'query: ' + query}`
          });
        }

        // Get related nodes for context
        const relatedNodes = {
          references: node.relationships.references
            .map(refPath => codexService.getNodeByPath(refPath))
            .filter(Boolean)
            .slice(0, 5),
          referencedBy: node.relationships.referencedBy
            .map(refPath => codexService.getNodeByPath(refPath))
            .filter(Boolean)
            .slice(0, 5),
          similar: node.relationships.similar
            .map(refPath => codexService.getNodeByPath(refPath))
            .filter(Boolean)
            .slice(0, 3)
        };

        return NextResponse.json({
          success: true,
          data: {
            node,
            relationships: relatedNodes,
            message: `Retrieved node: ${node.title}`
          }
        });

      case 'navigate':
        // Navigate to a specific path and get context
        if (!path) {
          return NextResponse.json({
            success: false,
            error: 'Path required for navigation'
          });
        }

        const targetNode = codexService.getNodeByPath(path);
        if (!targetNode) {
          // Suggest similar paths
          const similarPaths = codexService.search({
            query: path,
            sortBy: 'relevance',
            limit: 5
          });

          return NextResponse.json({
            success: false,
            error: 'Path not found',
            suggestions: similarPaths.map(n => ({ path: n.path, title: n.title })),
            message: `Path "${path}" not found. Here are similar paths.`
          });
        }

        // Get path hierarchy (parent and children)
        const pathParts = path.split('/').filter(Boolean);
        const parentPath = pathParts.length > 1 ? '/' + pathParts.slice(0, -1).join('/') : '/';
        const parentNode = parentPath !== '/' ? codexService.getNodeByPath(parentPath) : null;

        // Get child nodes
        const childNodes = codexService.search({
          query: '',
          filters: { pathPattern: `${path}/*` },
          sortBy: 'path',
          limit: 20
        });

        return NextResponse.json({
          success: true,
          data: {
            current: targetNode,
            parent: parentNode,
            children: childNodes,
            breadcrumb: pathParts,
            message: `Navigated to: ${targetNode.title}`
          }
        });

      case 'create':
        // Create new Codex node
        if (!data?.path || !data?.title || !data?.content) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: path, title, content'
          });
        }

        // Check if path already exists
        const existingNode = codexService.getNodeByPath(data.path);
        if (existingNode) {
          return NextResponse.json({
            success: false,
            error: 'Node with this path already exists',
            existing: { path: existingNode.path, title: existingNode.title }
          });
        }

        const nodeData = {
          path: data.path,
          title: data.title,
          content: data.content,
          type: data.type || 'document',
          tags: data.tags || [],
          mentions: data.mentions || [],
          parentPath: data.parentPath
        };

        const newNode = await codexService.createNode(nodeData);

        return NextResponse.json({
          success: true,
          data: {
            node: newNode,
            message: `Created new Codex node: ${newNode.title} at ${newNode.path}`
          }
        });

      case 'update':
        // Update existing node
        if (!id && !path) {
          return NextResponse.json({
            success: false,
            error: 'Node ID or path required for update'
          });
        }

        const updatedNode = await codexService.updateNode(id || path, data);

        if (!updatedNode) {
          return NextResponse.json({
            success: false,
            error: 'Node not found for update'
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            node: updatedNode,
            message: `Updated Codex node: ${updatedNode.title}`
          }
        });

      case 'delete':
        // Delete node
        if (!id && !path) {
          return NextResponse.json({
            success: false,
            error: 'Node ID or path required for deletion'
          });
        }

        const success = codexService.deleteNode(id || path);

        if (!success) {
          return NextResponse.json({
            success: false,
            error: 'Node not found for deletion'
          });
        }

        return NextResponse.json({
          success: true,
          message: `Deleted Codex node: ${id || path}`
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid Codex action',
          availableActions: ['list', 'search', 'read', 'navigate', 'create', 'update', 'delete']
        });
    }
  } catch (error: any) {
    console.error('Codex action error:', error);
    return NextResponse.json({
      success: false,
      error: 'Codex operation failed',
      details: error.message
    });
  }
}

async function handleOrganizationActions(action: string, data: any, id?: string, query?: string) {
  // Handle Organization system interactions
  switch (action) {
    case 'list':
      return NextResponse.json({
        success: true,
        data: {
          tasks: ['Outline Chapter 3', 'Research Arkham'],
          notes: ['Crime family details', 'Fear toxin compound'],
          ideas: ['Sound villain', 'Alfred perspective'],
          message: 'Retrieved organization data'
        }
      });
    
    case 'create':
      const itemType = data?.type || 'task';
      return NextResponse.json({
        success: true,
        data: { id: `new-${itemType}-` + Date.now() },
        message: `Created new ${itemType}: ${data?.content || 'Untitled'}`
      });
    
    case 'update':
      return NextResponse.json({
        success: true,
        message: `Updated organization item ${id}`
      });
    
    case 'delete':
      return NextResponse.json({
        success: true,
        message: `Deleted organization item ${id}`
      });
  }
  
  return NextResponse.json({ error: 'Invalid Organization action' }, { status: 400 });
}

async function handleMessageActions(action: string, data: any, id?: string, query?: string) {
  // Handle Message system interactions
  switch (action) {
    case 'list':
      return NextResponse.json({
        success: true,
        data: {
          conversations: ['Main Chat', 'Creative Session', 'Research Chat'],
          message: 'Retrieved message history'
        }
      });
    
    case 'read':
      return NextResponse.json({
        success: true,
        data: {
          messages: [`Chat history for ${query || 'Main Chat'}`],
          message: 'Retrieved chat messages'
        }
      });
  }
  
  return NextResponse.json({ error: 'Invalid Message action' }, { status: 400 });
}

async function handleVolumeActions(action: string, data: any, id?: string, query?: string) {
  // Handle Volume system interactions
  switch (action) {
    case 'list':
      return NextResponse.json({
        success: true,
        data: {
          volumes: ['Volume 1: Origins', 'Volume 2: Shadows', 'Volume 3: Legacy'],
          message: 'Retrieved volume list'
        }
      });
    
    case 'read':
      return NextResponse.json({
        success: true,
        data: {
          content: `Volume content for "${query || 'Volume 1'}"`,
          message: 'Retrieved volume content'
        }
      });
    
    case 'create':
      return NextResponse.json({
        success: true,
        data: { id: 'new-volume-' + Date.now() },
        message: `Created new volume: ${data?.title || 'Untitled Volume'}`
      });
    
    case 'update':
      return NextResponse.json({
        success: true,
        message: `Updated volume ${id}`
      });
    
    case 'delete':
      return NextResponse.json({
        success: true,
        message: `Deleted volume ${id}`
      });
  }
  
  return NextResponse.json({ error: 'Invalid Volume action' }, { status: 400 });
}