import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      id: number;
      email: string;
      name?: string;
      role: string;
    } & DefaultSession['user'];
  }
  interface User extends DefaultUser {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    role: string;
  }
} 