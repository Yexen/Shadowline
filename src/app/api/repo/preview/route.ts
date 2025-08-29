import { NextRequest, NextResponse } from 'next/server';
import { isAllowedPath, normalizePath } from '@/lib/pathPolicy';

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

    // Determine file type and generate preview
    const extension = normalizedPath.split('.').pop()?.toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension || '');
    const isCode = ['ts', 'tsx', 'js', 'jsx', 'css', 'json', 'md', 'txt'].includes(extension || '');
    
    if (!isImage && !isCode) {
      return NextResponse.json({
        error: 'Preview not supported for this file type',
        type: 'unsupported'
      }, { status: 400 });
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

    const GH = 'https://api.github.com';
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

    // Check file size limit
    const maxSize = isImage ? 5 * 1024 * 1024 : 100 * 1024; // 5MB for images, 100KB for code
    if (data.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large for preview (max ${maxSize / 1024}KB)`, 
        size: data.size 
      }, { status: 413 });
    }

    if (isImage) {
      // For images, return the GitHub raw URL
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${process.env.GITHUB_BRANCH || 'main'}/${normalizedPath}`;
      return NextResponse.json({
        type: 'image',
        url: rawUrl,
        path: normalizedPath,
        size: data.size,
        extension
      });
    } else {
      // For code files, return content with syntax highlighting info
      const content = Buffer.from(data.content || '', 'base64').toString('utf8');
      
      // Truncate content for preview (first 50 lines)
      const lines = content.split('\n');
      const previewContent = lines.slice(0, 50).join('\n');
      const isTruncated = lines.length > 50;
      
      return NextResponse.json({
        type: 'code',
        content: previewContent,
        path: normalizedPath,
        size: data.size,
        extension,
        language: getLanguageFromExtension(extension || ''),
        isTruncated,
        totalLines: lines.length
      });
    }
  } catch (e: any) {
    console.error('preview API error:', e);
    return NextResponse.json(
      { error: e.message || String(e) }, 
      { status: 500 }
    );
  }
}

function getLanguageFromExtension(ext: string): string {
  const langMap: { [key: string]: string } = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'txt': 'plaintext'
  };
  return langMap[ext] || 'plaintext';
}