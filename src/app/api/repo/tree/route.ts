import { NextResponse } from 'next/server';

const GH = 'https://api.github.com';

export async function GET() {
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN!;
  try {
    // 1) get branch SHA
    const refRes = await fetch(`${GH}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'dev-console' },
      cache: 'no-store',
    });
    if (!refRes.ok) throw new Error(`refs: ${refRes.status}`);
    const ref = await refRes.json();
    const sha = ref.object.sha;

    // 2) get full tree
    const treeRes = await fetch(`${GH}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'dev-console' },
      cache: 'no-store',
    });
    if (!treeRes.ok) throw new Error(`tree: ${treeRes.status}`);
    const tree = await treeRes.json();

    // only files
    const files = (tree.tree || [])
      .filter((n: any) => n.type === 'blob')
      .map((n: any) => n.path as string);

    return NextResponse.json({ sha, branch, files });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
