// src/lib/pathPolicy.ts
export type Op =
  | { type: 'write'; path: string; content: string; message?: string }
  | { type: 'mkdir'; path: string; message?: string }
  | { type: 'delete'; path: string; message?: string };

export const RULES = {
  pagesPrefix: 'src/app/(main)/',
  componentsPrefix: 'src/components/',
  publicPrefix: 'public/',
};

const clean = (p: string) => p.replace(/^\/+/, '');

export function normalizePath(requested: string): string {
  const p = clean(requested);

  // If user asked a route like "about" or "/about" → convert to page file.
  if (!p.includes('.') && !p.startsWith(RULES.publicPrefix)) {
    // treat as route name
    return `${RULES.pagesPrefix}${p.replace(/^\/+/, '').replace(/\/+$/, '')}/page.tsx`;
  }

  // If it looks like a page route but missing segment
  if (p.startsWith('src/app/') && !/\/page\.tsx$/.test(p)) {
    return p.replace(/\/?$/, '/page.tsx');
  }

  return p;
}

export function isAllowedPath(path: string) {
  const p = clean(path);
  return (
    p.startsWith(RULES.pagesPrefix) ||
    p.startsWith(RULES.componentsPrefix) ||
    p.startsWith(RULES.publicPrefix)
  );
}

export function validateOps(ops: Op[]) {
  const errors: string[] = [];
  const fixed: Op[] = ops.map(op => {
    if (op.type === 'write' || op.type === 'mkdir' || op.type === 'delete') {
      const want = normalizePath(op.path);
      if (!isAllowedPath(want)) {
        errors.push(`Path not allowed: ${op.path} → ${want}`);
      }
      return { ...op, path: want };
    }
    errors.push(`Unknown op type: ${(op as any).type}`);
    return op;
  });
  return { fixed, errors };
}
