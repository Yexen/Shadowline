import { NextResponse } from 'next/server';

const OWNER  = process.env.GITHUB_OWNER!;
const REPO   = process.env.GITHUB_REPO!;
const TOKEN  = process.env.GITHUB_TOKEN!;
const BRANCH = process.env.GITHUB_BRANCH || 'main';

function gh(path: string, init: RequestInit = {}) {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
}

export async function POST(req: Request) {
  try {
    const { receipt } = await req.json() as {
      receipt: {
        snapshots: { path: string; existed: boolean; prevContentB64?: string }[];
        message?: string;
      }
    };
    if (!receipt?.snapshots?.length) {
      return NextResponse.json({ error: 'Invalid receipt' }, { status: 400 });
    }

    let log = 'Undo:\n';

    for (const s of receipt.snapshots) {
      if (s.existed) {
        // restore previous content
        const res = await gh(`/contents/${encodeURIComponent(s.path)}`, {
          method: 'PUT',
          body: JSON.stringify({
            message: receipt.message || `revert ${s.path}`,
            content: s.prevContentB64!,
            branch: BRANCH,
          }),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.message || `restore failed: ${s.path}`);
        log += `restored ${s.path}\n`;
      } else {
        // file was newly created → delete it
        // need current sha to delete:
        const cur = await gh(`/contents/${encodeURIComponent(s.path)}?ref=${BRANCH}`);
        if (cur.status === 200) {
          const json = await cur.json();
          const del = await gh(`/contents/${encodeURIComponent(s.path)}`, {
            method: 'DELETE',
            body: JSON.stringify({
              message: receipt.message || `revert remove ${s.path}`,
              sha: json.sha,
              branch: BRANCH,
            }),
          });
          const dj = await del.json();
          if (!del.ok) throw new Error(dj?.message || `delete failed: ${s.path}`);
          log += `removed ${s.path}\n`;
        }
      }
    }

    return NextResponse.json({ ok: true, log });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'undo error' }, { status: 500 });
  }
}
