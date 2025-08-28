
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // don't prerender

function env(name: string, fallback?: string) {
  const val = process.env[name] ?? fallback;
  if (!val) throw new Error(`Missing env ${name}`);
  return val;
}

export async function GET() {
  try {
    const repo = env('GITHUB_REPO');       // e.g. "Yexen/Shadowline"
    const branch = env('GITHUB_BRANCH', 'main');
    const token = env('GITHUB_TOKEN');     // PAT with read access

    // 1) get tree SHA of the branch
    const br = await fetch(`https://api.github.com/repos/${repo}/branches/${branch}`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'shadowline-devconsole' },
      cache: 'no-store',
    });
    if (!br.ok) throw new Error(`branch ${br.status}: ${await br.text()}`);
    const bj = await br.json();
    const treeSha = bj?.commit?.commit?.tree?.sha || bj?.commit?.sha;
    if (!treeSha) throw new Error('Could not resolve tree SHA');

    // 2) fetch recursive tree
    const tr = await fetch(`https://api.github.com/repos/${repo}/git/trees/${treeSha}?recursive=1`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'shadowline-devconsole' },
      cache: 'no-store',
    });
    if (!tr.ok) throw new Error(`tree ${tr.status}: ${await tr.text()}`);
    const tj = await tr.json();

    const files: string[] = (tj?.tree || [])
      .filter((n: any) => n.type === 'blob' && typeof n.path === 'string')
      .map((n: any) => `/${n.path}`);

    return NextResponse.json({ files });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err), files: [] }, { status: 500 });
  }
}

  
