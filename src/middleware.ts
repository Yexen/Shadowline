import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/dev/console')) {
    const key = url.searchParams.get('key');
    if (key !== process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dev/console/:path*'],
};

