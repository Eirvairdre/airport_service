import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { requireAdmin, createErrorResponse } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/users/[id] - получить пользователя по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return createErrorResponse('Неверный ID пользователя', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        createdAt: true,
      },
    });

    if (!user) {
      return createErrorResponse('Пользователь не найден', 404);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    if (error instanceof Error && error.message.includes('Доступ запрещен')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse('Ошибка при получении пользователя', 500);
  }
}

// PATCH /api/users/[id] - обновить пользователя
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return createErrorResponse('Неверный ID пользователя', 400);
    }

    const body = await request.json();
    const { email, password, name, role, position } = body;

    // Проверяем, что пользователь существует
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return createErrorResponse('Пользователь не найден', 404);
    }

    // Подготавливаем данные для обновления
    const updateData: any = {};
    
    if (email !== undefined) {
      // Проверяем уникальность email
      const emailExists = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
      });
      
      if (emailExists) {
        return createErrorResponse('Пользователь с таким email уже существует', 400);
      }
      updateData.email = email;
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return createErrorResponse('Пароль должен содержать минимум 6 символов', 400);
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) {
      if (!['admin', 'user'].includes(role)) {
        return createErrorResponse('Неверная роль пользователя', 400);
      }
      updateData.role = role;
    }
    if (position !== undefined) updateData.position = position;

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    if (error instanceof Error && error.message.includes('Доступ запрещен')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse('Ошибка при обновлении пользователя', 500);
  }
}

// DELETE /api/users/[id] - удалить пользователя
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return createErrorResponse('Неверный ID пользователя', 400);
    }

    // Проверяем, что пользователь существует
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return createErrorResponse('Пользователь не найден', 404);
    }

    // Проверяем, что это не последний администратор
    if (user.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' },
      });

      if (adminCount <= 1) {
        return createErrorResponse('Невозможно удалить последнего администратора', 400);
      }
    }

    // Удаляем пользователя
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    if (error instanceof Error && error.message.includes('Доступ запрещен')) {
      return createErrorResponse(error.message, 403);
    }
    return createErrorResponse('Ошибка при удалении пользователя', 500);
  }
} 