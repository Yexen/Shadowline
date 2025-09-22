import { NextRequest, NextResponse } from 'next/server';
import { codexService } from '@/lib/codex-system';

export const runtime = 'edge';

// GET /api/codex/stats - Get Codex statistics and health
export async function GET(req: NextRequest) {
  try {
    const stats = codexService.getStats();
    const hierarchy = codexService.getPathHierarchy();

    // Run consistency check
    const consistencyIssues = await codexService.runConsistencyCheck();

    const healthScore = Math.max(0, 100 - (consistencyIssues.length * 5));

    return NextResponse.json({
      stats,
      hierarchy: hierarchy.filter(h => !h.path.includes('/', 1)), // Root level only
      consistency: {
        score: stats.consistencyScore,
        issues: consistencyIssues,
        issueCount: consistencyIssues.length,
        healthScore
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Codex stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats', details: error.message },
      { status: 500 }
    );
  }
}