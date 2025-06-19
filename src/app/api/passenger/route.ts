import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/passenger - получить список всех пассажиров
export async function GET() {
  try {
    const passengers = await prisma.passenger.findMany({
      include: {
        tickets: {
          include: {
            flight: {
              include: {
                departureAirport: true,
                arrivalAirport: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(passengers);
  } catch (error) {
    console.error('Ошибка при получении пассажиров:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении пассажиров' },
      { status: 500 }
    );
  }
}

// POST /api/passenger - создать нового пассажира
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, passport_number, nationality, birth_date } = body;

    // Валидация обязательных полей
    if (!name || !passport_number) {
      return NextResponse.json(
        { error: 'ФИО и номер паспорта обязательны' },
        { status: 400 }
      );
    }

    // Проверяем уникальность номера паспорта
    const existingPassenger = await prisma.passenger.findFirst({
      where: { passport_number }
    });

    if (existingPassenger) {
      return NextResponse.json(
        { error: 'Пассажир с таким номером паспорта уже существует' },
        { status: 400 }
      );
    }

    // Генерируем новый passenger_id
    const maxPassenger = await prisma.passenger.findFirst({
      orderBy: { passenger_id: 'desc' }
    });
    const newPassengerId = (maxPassenger?.passenger_id || 0) + 1;

    const passenger = await prisma.passenger.create({
      data: {
        passenger_id: newPassengerId,
        name,
        passport_number,
        nationality: nationality || null,
        birth_date: birth_date ? new Date(birth_date) : null,
      },
      include: {
        tickets: {
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
    });

    return NextResponse.json(passenger, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании пассажира:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании пассажира' },
      { status: 500 }
    );
  }
} 