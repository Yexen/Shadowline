import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-minimal';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };