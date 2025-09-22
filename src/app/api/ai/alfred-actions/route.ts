import { NextRequest, NextResponse } from 'next/server';

interface ActionRequest {
  action: 'read' | 'create' | 'update' | 'delete' | 'list';
  section: 'bible' | 'maps' | 'codex' | 'organization' | 'messages' | 'volumes';
  data?: any;
  id?: string;
  query?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { action, section, data, id, query }: ActionRequest = await request.json();

    // This is a comprehensive API for Alfred to interact with all sections
    switch (section) {
      case 'bible':
        return handleBibleActions(action, data, id, query);
      
      case 'maps':
        return handleMapActions(action, data, id, query);
      
      case 'codex':
        return handleCodexActions(action, data, id, query);
      
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

async function handleCodexActions(action: string, data: any, id?: string, query?: string) {
  // Handle Codex system interactions
  switch (action) {
    case 'list':
      return NextResponse.json({
        success: true,
        data: {
          nodes: ['Story Arcs', 'Character Profiles', 'Timeline Events'],
          message: 'Retrieved Codex nodes'
        }
      });
    
    case 'read':
      return NextResponse.json({
        success: true,
        data: {
          content: `Codex content for "${query || 'Main Story'}"`,
          message: `Retrieved Codex content`
        }
      });
    
    case 'create':
      return NextResponse.json({
        success: true,
        data: { id: 'new-codex-' + Date.now() },
        message: `Created new Codex entry: ${data?.title || 'Untitled'}`
      });
    
    case 'update':
      return NextResponse.json({
        success: true,
        message: `Updated Codex entry ${id}`
      });
    
    case 'delete':
      return NextResponse.json({
        success: true,
        message: `Deleted Codex entry ${id}`
      });
  }
  
  return NextResponse.json({ error: 'Invalid Codex action' }, { status: 400 });
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