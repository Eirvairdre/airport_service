import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/crew/[id] - получить экипаж по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const crewId = parseInt(id);
    
    if (isNaN(crewId)) {
      return NextResponse.json(
        { error: 'Неверный ID экипажа' },
        { status: 400 }
      );
    }

    const crew = await prisma.crew.findUnique({
      where: { crew_id: crewId },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true
          }
        },
        members: {
          include: {
            personnel: true
          }
        }
      }
    });

    if (!crew) {
      return NextResponse.json(
        { error: 'Экипаж не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(crew);
  } catch (error) {
    console.error('Ошибка при получении экипажа:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении экипажа' },
      { status: 500 }
    );
  }
}

// PATCH /api/crew/[id] - обновить экипаж
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const crewId = parseInt(id);
    
    if (isNaN(crewId)) {
      return NextResponse.json(
        { error: 'Неверный ID экипажа' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { flight_id, members } = body;

    // Проверяем существование экипажа
    const existingCrew = await prisma.crew.findUnique({
      where: { crew_id: crewId }
    });

    if (!existingCrew) {
      return NextResponse.json(
        { error: 'Экипаж не найден' },
        { status: 404 }
      );
    }

    // Валидация обязательных полей
    if (!flight_id || !members || members.length === 0) {
      return NextResponse.json(
        { error: 'Рейс и члены экипажа обязательны' },
        { status: 400 }
      );
    }

    // Проверяем существование рейса
    const flight = await prisma.flight.findUnique({
      where: { flight_id: parseInt(flight_id) }
    });

    if (!flight) {
      return NextResponse.json(
        { error: 'Рейс не найден' },
        { status: 400 }
      );
    }

    // Проверяем, что у рейса нет другого экипажа (если меняется рейс)
    if (parseInt(flight_id) !== existingCrew.flight_id) {
      const otherCrew = await prisma.crew.findFirst({
        where: { 
          flight_id: parseInt(flight_id),
          crew_id: { not: crewId }
        }
      });

      if (otherCrew) {
        return NextResponse.json(
          { error: 'У этого рейса уже есть экипаж' },
          { status: 400 }
        );
      }
    }

    // Проверяем существование всех сотрудников
    for (const member of members) {
      const personnel = await prisma.personnel.findUnique({
        where: { personnel_id: parseInt(member.personnel_id) }
      });

      if (!personnel) {
        return NextResponse.json(
          { error: `Сотрудник с ID ${member.personnel_id} не найден` },
          { status: 400 }
        );
      }
    }

    // Обновляем экипаж и его членов в транзакции
    const crew = await prisma.$transaction(async (tx: any) => {
      // Обновляем экипаж
      const updatedCrew = await tx.crew.update({
        where: { crew_id: crewId },
        data: {
          flight_id: parseInt(flight_id)
        }
      });

      // Удаляем старых членов экипажа
      await tx.crew_Member.deleteMany({
        where: { crew_id: crewId }
      });

      // Создаем новых членов экипажа
      for (const member of members) {
        await tx.crew_Member.create({
          data: {
            crew: { connect: { crew_id: crewId } },
            personnel: { connect: { personnel_id: parseInt(member.personnel_id) } },
            role: member.role || null
          }
        });
      }

      return updatedCrew;
    });

    // Получаем обновленный экипаж с полными данными
    const updatedCrew = await prisma.crew.findUnique({
      where: { crew_id: crew.crew_id },
      include: {
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true
          }
        },
        members: {
          include: {
            personnel: true
          }
        }
      }
    });

    return NextResponse.json(updatedCrew);
  } catch (error) {
    console.error('Ошибка при обновлении экипажа:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении экипажа' },
      { status: 500 }
    );
  }
}

// DELETE /api/crew/[id] - удалить экипаж
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const crewId = parseInt(id);
    
    if (isNaN(crewId)) {
      return NextResponse.json(
        { error: 'Неверный ID экипажа' },
        { status: 400 }
      );
    }

    // Проверяем существование экипажа
    const existingCrew = await prisma.crew.findUnique({
      where: { crew_id: crewId },
      include: {
        members: true
      }
    });

    if (!existingCrew) {
      return NextResponse.json(
        { error: 'Экипаж не найден' },
        { status: 404 }
      );
    }

    // Удаляем экипаж и его членов в транзакции
    await prisma.$transaction(async (tx: any) => {
      // Удаляем членов экипажа
      await tx.crew_Member.deleteMany({
        where: { crew_id: crewId }
      });

      // Удаляем экипаж
      await tx.crew.delete({
        where: { crew_id: crewId }
      });
    });

    return NextResponse.json({ message: 'Экипаж успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении экипажа:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении экипажа' },
      { status: 500 }
    );
  }
} 