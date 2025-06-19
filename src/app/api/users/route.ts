import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { requireAdmin, createErrorResponse } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/users - получить всех пользователей
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    if (error instanceof Error && error.message.includes('Доступ запрещен')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse('Ошибка при получении пользователей', 500);
  }
}

// POST /api/users - создать нового пользователя
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const body = await request.json();
    const { email, password, name, role, position } = body;

    // Валидация
    if (!email || !password || !name || !role) {
      return createErrorResponse('Все поля обязательны для заполнения', 400);
    }

    if (password.length < 6) {
      return createErrorResponse('Пароль должен содержать минимум 6 символов', 400);
    }

    if (!['admin', 'user'].includes(role)) {
      return createErrorResponse('Неверная роль пользователя', 400);
    }

    // Проверка уникальности email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createErrorResponse('Пользователь с таким email уже существует', 400);
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        position: position || 'Сотрудник',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    if (error instanceof Error && error.message.includes('Доступ запрещен')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse('Ошибка при создании пользователя', 500);
  }
} 