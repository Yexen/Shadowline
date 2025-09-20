import { NextAuthOptions } from 'next-auth';
import { PostgresAdapter } from '@auth/pg-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Pool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '@/types/auth';

// Create a connection pool for Vercel Postgres
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

export const authOptions: NextAuthOptions = {
  // Only use adapter if database URL is available
  ...(process.env.POSTGRES_URL || process.env.DATABASE_URL ? { adapter: PostgresAdapter(pool) } : {}),
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

        try {
          // Special case for Author account (hardcoded like before)
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

          // Query database for regular users (skip if no database connection)
          if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
            return null;
          }

          const { rows } = await pool.query(
            'SELECT id, email, name, password_hash, role, status, avatar_url, created_at FROM users WHERE email = $1',
            [credentials.email.toLowerCase()]
          );

          if (rows.length === 0) {
            return null;
          }

          const user = rows[0];

          // Check if user is approved
          if (user.status !== 'approved') {
            throw new Error('Account pending approval');
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            image: user.avatar_url,
          };
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
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.role = token.role as UserRole;
        session.user.status = token.status as any;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
};