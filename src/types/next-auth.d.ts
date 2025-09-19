import { UserRole, UserStatus } from '@/types/auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: UserRole;
      status: UserStatus;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: UserRole;
    status: UserStatus;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    status: UserStatus;
  }
}