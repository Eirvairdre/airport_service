import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // сессия на 30 дней
  },
  providers: [
    CredentialsProvider({
      name: 'Вход по email и паролю',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@admin.com' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Введите email и пароль');
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) {
          throw new Error('Пользователь не найден');
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Неверный пароль');
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    // Добавляю роль пользователя в сессию
    async session({ session, token, user }: any) {
      if (user) {
        session.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      } else if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
        };
      }
      return session;
    },
    // Сохраняю роль в токене
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Получаю текущего пользователя из запроса
export async function getCurrentUser(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  console.log('Token in getCurrentUser:', token);
  return token;
}

// Проверяю, что пользователь - админ
export async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);
  console.log('User in requireAdmin:', user);
  console.log('User role:', user?.role);
  
  if (!user || user.role !== 'admin') {
    throw new Error('Доступ запрещен. Требуются права администратора.');
  }
  
  return user;
}

// Создаю ответ с ошибкой
export function createErrorResponse(message: string, status: number = 403) {
  return NextResponse.json(
    { error: message },
    { status }
  );
} 