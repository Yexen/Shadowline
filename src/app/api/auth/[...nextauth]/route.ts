// NextAuth temporarily disabled to prevent conflicts with simple auth
// import NextAuth from 'next-auth';
// import { authOptions } from '@/lib/auth-minimal';

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'NextAuth disabled' }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ message: 'NextAuth disabled' }, { status: 404 });
}