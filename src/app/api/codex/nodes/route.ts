import { NextRequest, NextResponse } from 'next/server';
import { codexService, type CodexNode, type CodexSearch } from '@/lib/codex-system';

export const runtime = 'edge';

// GET /api/codex/nodes - Search and list nodes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const searchQuery: CodexSearch = {
      query: searchParams.get('q') || '',
      filters: {
        type: searchParams.get('type')?.split(',') as CodexNode['type'][] || undefined,
        pathPattern: searchParams.get('path') || undefined,
        tags: searchParams.get('tags')?.split(',') || undefined,
        hasAI: searchParams.get('hasAI') ? searchParams.get('hasAI') === 'true' : undefined,
      },
      sortBy: (searchParams.get('sort') as CodexSearch['sortBy']) || 'relevance',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    };

    // Handle date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      searchQuery.filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    const results = codexService.search(searchQuery);

    return NextResponse.json({
      nodes: results,
      count: results.length,
      query: searchQuery
    });

  } catch (error: any) {
    console.error('Codex search error:', error);
    return NextResponse.json(
      { error: 'Failed to search nodes', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/codex/nodes - Create new node
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.path || !body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: path, title, content' },
        { status: 400 }
      );
    }

    // Check if path already exists
    const existingNode = codexService.getNodeByPath(body.path);
    if (existingNode) {
      return NextResponse.json(
        { error: 'Node with this path already exists' },
        { status: 409 }
      );
    }

    const nodeData = {
      path: body.path,
      title: body.title,
      content: body.content,
      type: body.type || 'document',
      tags: body.tags || [],
      mentions: body.mentions || [],
      parentPath: body.parentPath
    };

    const newNode = await codexService.createNode(nodeData);

    return NextResponse.json({
      node: newNode,
      message: 'Node created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Codex create error:', error);
    return NextResponse.json(
      { error: 'Failed to create node', details: error.message },
      { status: 500 }
    );
  }
}