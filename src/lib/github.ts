import { Buffer } from 'buffer';

const OWNER  = process.env.GITHUB_OWNER!;
const REPO   = process.env.GITHUB_REPO!;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN  = process.env.GITHUB_TOKEN!;

const BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `token ${TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function getFileSha(path: string): Promise<string | null> {
  try {
    const data = await gh<any>(`/contents/${encodeURIComponent(path)}?ref=${BRANCH}`);
    return data.sha ?? null;
  } catch (e:any) {
    // 404 = doesn't exist -> return null
    if (String(e.message).includes('404')) return null;
    throw e;
  }
}

export async function writeFile(path: string, content: string, message: string) {
  const sha = await getFileSha(path);
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };
  return gh(`/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function readFile(path: string): Promise<string | null> {
  try {
    const data = await gh<any>(`/contents/${encodeURIComponent(path)}?ref=${BRANCH}`);
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf8');
    }
    return data.content ?? '';
  } catch (e:any) {
    if (String(e.message).includes('404')) return null;
    throw e;
  }
}

export async function deletePath(path: string, message = 'remove file') {
  const sha = await getFileSha(path);
  if (!sha) throw new Error('File not found');
  return gh(`/contents/${encodeURIComponent(path)}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
}

// “mkdir” in Git is just a placeholder file
export async function mkdirp(path: string) {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return writeFile(`${clean}/.gitkeep`, '', `mkdir ${clean}`);
}

// List (very light) – uses GitHub “contents” API
export async function list(path = ''): Promise<{name:string;type:'file'|'dir'}[]> {
  const arr = await gh<any[]>(`/contents/${encodeURIComponent(path) || ''}?ref=${BRANCH}`);
  return arr.map(x => ({ name: x.path, type: x.type === 'dir' ? 'dir' : 'file' }));
}
