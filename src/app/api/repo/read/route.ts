import { NextRequest, NextResponse } from 'next/server';
const GH = 'https://api.github.com';

export async function POST(req: NextRequest) {
  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const token = process.env.GITHUB_TOKEN!;

  try {
    const res = await fetch(`${GH}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'dev-console' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`read ${path}: ${res.status}`);
    const data = await res.json();
    const content = Buffer.from(data.content || '', 'base64').toString('utf8');
    return NextResponse.json({ path, content, sha: data.sha });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
