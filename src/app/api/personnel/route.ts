import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/personnel - получить список всего персонала
export async function GET() {
  try {
    const personnel = await prisma.personnel.findMany({
      include: {
        crew_members: true,
        maintenances: true,
        incidents: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Ошибка при получении персонала:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении персонала' },
      { status: 500 }
    );
  }
}

// POST /api/personnel - создать нового сотрудника
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, position_id, license_number, hired_date } = body;

    // Валидация обязательных полей
    if (!name) {
      return NextResponse.json(
        { error: 'ФИО обязательно' },
        { status: 400 }
      );
    }

    // Проверяем уникальность номера лицензии (если указан)
    if (license_number) {
      const existingPersonnel = await prisma.personnel.findFirst({
        where: { license_number }
      });

      if (existingPersonnel) {
        return NextResponse.json(
          { error: 'Сотрудник с таким номером лицензии уже существует' },
          { status: 400 }
        );
      }
    }

    // Генерируем новый personnel_id
    const maxPersonnel = await prisma.personnel.findFirst({
      orderBy: { personnel_id: 'desc' }
    });
    const newPersonnelId = (maxPersonnel?.personnel_id || 0) + 1;

    const personnel = await prisma.personnel.create({
      data: {
        personnel_id: newPersonnelId,
        name,
        position_id: position_id ? parseInt(position_id) : null,
        license_number: license_number || null,
        hired_date: hired_date ? new Date(hired_date) : null,
      },
      include: {
        crew_members: true,
        maintenances: true,
        incidents: true
      }
    });

    return NextResponse.json(personnel, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании сотрудника:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании сотрудника' },
      { status: 500 }
    );
  }
} 