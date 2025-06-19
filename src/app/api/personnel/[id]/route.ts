import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/personnel/[id] - получить сотрудника по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID сотрудника' },
        { status: 400 }
      );
    }

    const personnel = await prisma.personnel.findUnique({
      where: { personnel_id: id },
      include: {
        crew_members: {
          include: {
            crew: {
              include: {
                flight: {
                  include: {
                    departureAirport: true,
                    arrivalAirport: true
                  }
                }
              }
            }
          }
        },
        maintenances: {
          include: {
            aircraft: true
          }
        },
        incidents: {
          include: {
            flight: true
          }
        }
      }
    });

    if (!personnel) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Ошибка при получении сотрудника:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении сотрудника' },
      { status: 500 }
    );
  }
}

// PATCH /api/personnel/[id] - обновить сотрудника
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID сотрудника' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, position_id, license_number, hired_date } = body;

    // Проверяем существование сотрудника
    const existingPersonnel = await prisma.personnel.findUnique({
      where: { personnel_id: id }
    });

    if (!existingPersonnel) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      );
    }

    // Валидация обязательных полей
    if (!name) {
      return NextResponse.json(
        { error: 'ФИО обязательно' },
        { status: 400 }
      );
    }

    // Если меняется номер лицензии, проверяем уникальность
    if (license_number && license_number !== existingPersonnel.license_number) {
      const duplicatePersonnel = await prisma.personnel.findFirst({
        where: { 
          license_number,
          personnel_id: { not: id }
        }
      });

      if (duplicatePersonnel) {
        return NextResponse.json(
          { error: 'Сотрудник с таким номером лицензии уже существует' },
          { status: 400 }
        );
      }
    }

    const personnel = await prisma.personnel.update({
      where: { personnel_id: id },
      data: {
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

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Ошибка при обновлении сотрудника:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении сотрудника' },
      { status: 500 }
    );
  }
}

// DELETE /api/personnel/[id] - удалить сотрудника
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID сотрудника' },
        { status: 400 }
      );
    }

    // Проверяем существование сотрудника
    const existingPersonnel = await prisma.personnel.findUnique({
      where: { personnel_id: id },
      include: {
        crew_members: true,
        maintenances: true,
        incidents: true
      }
    });

    if (!existingPersonnel) {
      return NextResponse.json(
        { error: 'Сотрудник не найден' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные данные
    if (existingPersonnel.crew_members.length > 0 || 
        existingPersonnel.maintenances.length > 0 || 
        existingPersonnel.incidents.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить сотрудника, связанного с экипажами, техобслуживанием или инцидентами' },
        { status: 400 }
      );
    }

    await prisma.personnel.delete({
      where: { personnel_id: id }
    });

    return NextResponse.json({ message: 'Сотрудник успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении сотрудника:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении сотрудника' },
      { status: 500 }
    );
  }
} 