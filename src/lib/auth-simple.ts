import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserRole } from '@/types/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Special case for Author account (hardcoded for now)
        if (credentials.email === 'yekta.kjs@gmail.com' &&
            credentials.password === 'LivFreya' &&
            credentials.role === 'author') {
          return {
            id: 'author-001',
            email: 'yekta.kjs@gmail.com',
            name: 'Yekta Jokar',
            role: 'author',
            status: 'approved',
            image: 'https://placehold.co/128x128.png',
          };
        }

        // For demo purposes, allow any email/password combination for other roles
        if (credentials.role && credentials.role !== 'author') {
          return {
            id: `user-${Date.now()}`,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            role: credentials.role,
            status: 'approved',
            image: 'https://placehold.co/128x128.png',
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    signUp: '/signup',
  },
};