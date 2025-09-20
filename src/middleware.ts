import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = new URL(request.url);

  // Dev console protection
  if (url.pathname.startsWith('/dev/console')) {
    const key = url.searchParams.get('key');
    if (key !== process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  // Skip auth protection in development mode for easier testing
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Auth protection for main app routes
  if (url.pathname.startsWith('/(main)') || url.pathname === '/home') {
    // Check for Firebase auth cookies (common names)
    const hasAuthSession = request.cookies.get('session')?.value ||
                          request.cookies.get('firebase-auth')?.value ||
                          request.cookies.get('__session')?.value ||
                          request.cookies.get('firebase-token')?.value;

    // Check for bypass token for head writer
    const hasBypassToken = request.cookies.get('gotham-bypassed-user')?.value;

    // If no session found, redirect to auth page
    if (!hasAuthSession && !hasBypassToken &&
        !url.pathname.startsWith('/auth') &&
        !url.pathname.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // API route protection (minimal in development)
  if (url.pathname.startsWith('/api/')) {
    // Skip auth for public API routes and NextAuth routes
    const publicRoutes = ['/api/debug', '/api/health', '/api/auth'];
    const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));

    if (!isPublicRoute && process.env.NODE_ENV === 'production') {
      // Check for authorization header or session
      const authHeader = request.headers.get('authorization');
      const hasSession = request.cookies.get('session')?.value ||
                        request.cookies.get('firebase-auth')?.value ||
                        request.cookies.get('__session')?.value;

      if (!authHeader && !hasSession) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dev/console/:path*',
    '/(main)/:path*',
    '/home',
    '/api/:path*'
  ],
};