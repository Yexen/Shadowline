
import { NextRequest, NextResponse } from 'next/server';
import { isAllowedPath, normalizePath } from '@/lib/pathPolicy';

const GH = 'https://api.github.com';

export async function POST(req: NextRequest) {
  try {
    const { path, content, message, sha } = await req.json();
    
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid path' }, { status: 400 });
    }
    
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid content' }, { status: 400 });
    }

    // Normalize and validate the path
    const normalizedPath = normalizePath(path);
    
    if (!isAllowedPath(normalizedPath)) {
      return NextResponse.json(
        { error: 'Path not allowed' },
        { status: 403 }
      );
    }

    // Check content size limit (1MB)
    const maxSize = 1024 * 1024;
    const contentSize = Buffer.byteLength(content, 'utf8');
    if (contentSize > maxSize) {
      return NextResponse.json(
        { error: 'Content too large (max 1MB)', size: contentSize },
        { status: 413 }
      );
    }

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const token = process.env.GITHUB_TOKEN!;

    if (!owner || !repo || !token) {
      return NextResponse.json(
        { error: 'Missing GitHub configuration' },
        { status: 500 }
      );
    }

    const res = await fetch(`${GH}/repos/${owner}/${repo}/contents/${encodeURIComponent(normalizedPath)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'shadowline-editor',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({
        message: message || `shadowline-editor: update ${normalizedPath}`,
        content: Buffer.from(content, 'utf8').toString('base64'),
        branch,
        ...(sha && { sha }), // include when updating an existing file
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 409) {
        return NextResponse.json(
          { error: 'Conflict: file has been modified, please refresh and try again' },
          { status: 409 }
        );
      }
      if (res.status === 422) {
        return NextResponse.json(
          { error: 'Invalid request: check file path and content' },
          { status: 422 }
        );
      }
      throw new Error(err?.message || `GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ 
      ok: true, 
      commit: data.commit?.sha,
      path: normalizedPath,
      size: contentSize
    });
  } catch (e: any) {
    console.error('write API error:', e);
    return NextResponse.json(
      { error: e.message || String(e) }, 
      { status: 500 }
    );
  }
}
