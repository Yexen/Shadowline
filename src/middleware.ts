import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  const want = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY; // reuse the same key

  // protect both /dev/console and /admin/console if they exist
  if (url.pathname.startsWith('/dev/console') || url.pathname.startsWith('/admin/console')) {
    if (!key || key !== want) return new NextResponse('Unauthorized', { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dev/console/:path*', '/admin/console/:path*'],
};
