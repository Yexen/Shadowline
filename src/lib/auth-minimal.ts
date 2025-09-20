import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-for-testing',
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
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          console.log('Attempting login for:', credentials.email, 'with role:', credentials.role);

          // Special case for Author account
          if (credentials.email === 'yekta.kjs@gmail.com' &&
              credentials.password === 'LivFreya' &&
              credentials.role === 'author') {
            console.log('Author login successful');
            return {
              id: 'author-001',
              email: 'yekta.kjs@gmail.com',
              name: 'Yekta Jokar',
              role: 'author',
              status: 'approved',
              image: 'https://placehold.co/128x128.png',
            };
          }

          // For demo: allow any email/password for other roles
          if (credentials.role && credentials.role !== 'author') {
            console.log('Guest login successful for role:', credentials.role);
            return {
              id: `user-${Date.now()}`,
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: credentials.role,
              status: 'approved',
              image: 'https://placehold.co/128x128.png',
            };
          }

          console.log('Login failed for:', credentials.email);
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  debug: process.env.NODE_ENV === 'development',
};