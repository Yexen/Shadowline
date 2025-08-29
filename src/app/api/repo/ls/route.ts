import { NextRequest, NextResponse } from 'next/server';
import { isAllowedPath, normalizePath } from '@/lib/pathPolicy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedPath = searchParams.get('path') ?? '/';
    
    // Normalize and validate the path
    const normalizedPath = normalizePath(requestedPath);
    
    if (!isAllowedPath(normalizedPath)) {
      return NextResponse.json(
        { ok: false, error: 'Path not allowed' },
        { status: 403 }
      );
    }

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const token = process.env.GITHUB_TOKEN!;

    if (!owner || !repo || !token) {
      return NextResponse.json(
        { ok: false, error: 'Missing GitHub configuration' },
        { status: 500 }
      );
    }

    const GH = 'https://api.github.com';
    const apiPath = normalizedPath === '/' ? '' : encodeURIComponent(normalizedPath);
    
    const res = await fetch(`${GH}/repos/${owner}/${repo}/contents/${apiPath}`, {
      headers: { 
        Authorization: `Bearer ${token}`, 
        'User-Agent': 'shadowline-editor',
        'Accept': 'application/vnd.github+json'
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ ok: true, tree: [] });
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    const tree = Array.isArray(data) ? data : [data];
    
    const files = tree
      .filter(item => item.type === 'file' || item.type === 'dir')
      .map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
      }));

    return NextResponse.json({
      ok: true,
      tree: files,
      path: normalizedPath
    });
  } catch (e: any) {
    console.error('ls API error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'ls failed' },
      { status: 500 }
    );
  }
}
