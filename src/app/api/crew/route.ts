import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/crew - получить список всех экипажей
export async function GET() {
  try {
    const crews = await prisma.crew.findMany({
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
      },
      orderBy: {
        crew_id: 'desc'
      }
    });
    
    return NextResponse.json(crews);
  } catch (error) {
    console.error('Ошибка при получении экипажей:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении экипажей' },
      { status: 500 }
    );
  }
}

// POST /api/crew - создать новый экипаж
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flight_id, members } = body;

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

    // Проверяем, что у рейса еще нет экипажа
    const existingCrew = await prisma.crew.findFirst({
      where: { flight_id: parseInt(flight_id) }
    });

    if (existingCrew) {
      return NextResponse.json(
        { error: 'У этого рейса уже есть экипаж' },
        { status: 400 }
      );
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

    // Генерируем новый crew_id
    const maxCrew = await prisma.crew.findFirst({
      orderBy: { crew_id: 'desc' }
    });
    const newCrewId = (maxCrew?.crew_id || 0) + 1;

    // Создаем экипаж и его членов в транзакции
    const crew = await prisma.$transaction(async (tx) => {
      // Создаем экипаж
      const newCrew = await tx.crew.create({
        data: {
          crew_id: newCrewId,
          flight_id: parseInt(flight_id)
        }
      });

      // Создаем членов экипажа
      for (const member of members) {
        await tx.crew_Member.create({
          data: {
            crew: { connect: { crew_id: newCrewId } },
            personnel: { connect: { personnel_id: parseInt(member.personnel_id) } },
            role: member.role || null
          }
        });
      }

      return newCrew;
    });

    // Получаем созданный экипаж с полными данными
    const createdCrew = await prisma.crew.findUnique({
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

    return NextResponse.json(createdCrew, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании экипажа:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании экипажа' },
      { status: 500 }
    );
  }
} 