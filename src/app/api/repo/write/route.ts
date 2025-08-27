
import { NextRequest, NextResponse } from 'next/server';
const GH = 'https://api.github.com';

export async function POST(req: NextRequest) {
  const { path, content, message, sha } = await req.json();
  if (!path || typeof content !== 'string') {
    return NextResponse.json({ error: 'Missing path/content' }, { status: 400 });
  }

  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN!;

  try {
    const res = await fetch(`${GH}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'dev-console',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message || `dev-console: update ${path}`,
        content: Buffer.from(content, 'utf8').toString('base64'),
        branch,
        sha, // include when updating an existing file
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || `write ${path}: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json({ ok: true, commit: data.commit?.sha });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
