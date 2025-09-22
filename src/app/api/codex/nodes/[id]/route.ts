import { NextRequest, NextResponse } from 'next/server';
import { codexService } from '@/lib/codex-system';

export const runtime = 'edge';

// GET /api/codex/nodes/[id] - Get specific node
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if id is actually a path (starts with /)
    let node;
    if (id.startsWith('/') || id.includes('%2F')) {
      // Decode URL-encoded path
      const decodedPath = decodeURIComponent(id);
      node = codexService.getNodeByPath(decodedPath);
    } else {
      // Treat as node ID
      const allNodes = codexService.search({ query: '', sortBy: 'relevance' });
      node = allNodes.find(n => n.id === id);
    }

    if (!node) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }

    // Get related nodes
    const relatedByReferences = node.relationships.references
      .map(path => codexService.getNodeByPath(path))
      .filter(Boolean);

    const relatedByReferencing = node.relationships.referencedBy
      .map(path => codexService.getNodeByPath(path))
      .filter(Boolean);

    const similarNodes = node.relationships.similar
      .map(path => codexService.getNodeByPath(path))
      .filter(Boolean);

    return NextResponse.json({
      node,
      relationships: {
        references: relatedByReferences,
        referencedBy: relatedByReferencing,
        similar: similarNodes
      }
    });

  } catch (error: any) {
    console.error('Codex get node error:', error);
    return NextResponse.json(
      { error: 'Failed to get node', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/codex/nodes/[id] - Update node
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const updatedNode = await codexService.updateNode(id, body);

    if (!updatedNode) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      node: updatedNode,
      message: 'Node updated successfully'
    });

  } catch (error: any) {
    console.error('Codex update error:', error);
    return NextResponse.json(
      { error: 'Failed to update node', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/codex/nodes/[id] - Delete node
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const success = codexService.deleteNode(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Node deleted successfully'
    });

  } catch (error: any) {
    console.error('Codex delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete node', details: error.message },
      { status: 500 }
    );
  }
}