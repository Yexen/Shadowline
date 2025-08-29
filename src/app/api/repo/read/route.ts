import { NextRequest, NextResponse } from 'next/server';
import { isAllowedPath, normalizePath } from '@/lib/pathPolicy';

const GH = 'https://api.github.com';

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid path' }, { status: 400 });
    }

    // Normalize and validate the path
    const normalizedPath = normalizePath(path);
    
    if (!isAllowedPath(normalizedPath)) {
      return NextResponse.json(
        { error: 'Path not allowed' },
        { status: 403 }
      );
    }

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const token = process.env.GITHUB_TOKEN!;

    if (!owner || !repo || !token) {
      return NextResponse.json(
        { error: 'Missing GitHub configuration' },
        { status: 500 }
      );
    }

    const res = await fetch(`${GH}/repos/${owner}/${repo}/contents/${encodeURIComponent(normalizedPath)}`, {
      headers: { 
        Authorization: `Bearer ${token}`, 
        'User-Agent': 'shadowline-editor',
        'Accept': 'application/vnd.github+json'
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    
    if (data.type !== 'file') {
      return NextResponse.json({ error: 'Path is not a file' }, { status: 400 });
    }

    // Check file size limit (1MB)
    const maxSize = 1024 * 1024;
    if (data.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large (max 1MB)', 
        size: data.size 
      }, { status: 413 });
    }

    const content = Buffer.from(data.content || '', 'base64').toString('utf8');
    
    return NextResponse.json({ 
      path: normalizedPath, 
      content, 
      sha: data.sha,
      size: data.size
    });
  } catch (e: any) {
    console.error('read API error:', e);
    return NextResponse.json(
      { error: e.message || String(e) }, 
      { status: 500 }
    );
  }
}
