import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/passenger/[id] - получить пассажира по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID пассажира' },
        { status: 400 }
      );
    }

    const passenger = await prisma.passenger.findUnique({
      where: { passenger_id: id },
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

    if (!passenger) {
      return NextResponse.json(
        { error: 'Пассажир не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(passenger);
  } catch (error) {
    console.error('Ошибка при получении пассажира:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении пассажира' },
      { status: 500 }
    );
  }
}

// PATCH /api/passenger/[id] - обновить пассажира
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID пассажира' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, passport_number, nationality, birth_date } = body;

    // Проверяем существование пассажира
    const existingPassenger = await prisma.passenger.findUnique({
      where: { passenger_id: id }
    });

    if (!existingPassenger) {
      return NextResponse.json(
        { error: 'Пассажир не найден' },
        { status: 404 }
      );
    }

    // Валидация обязательных полей
    if (!name || !passport_number) {
      return NextResponse.json(
        { error: 'ФИО и номер паспорта обязательны' },
        { status: 400 }
      );
    }

    // Если меняется номер паспорта, проверяем уникальность
    if (passport_number !== existingPassenger.passport_number) {
      const duplicatePassenger = await prisma.passenger.findFirst({
        where: { 
          passport_number,
          passenger_id: { not: id }
        }
      });

      if (duplicatePassenger) {
        return NextResponse.json(
          { error: 'Пассажир с таким номером паспорта уже существует' },
          { status: 400 }
        );
      }
    }

    const passenger = await prisma.passenger.update({
      where: { passenger_id: id },
      data: {
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

    return NextResponse.json(passenger);
  } catch (error) {
    console.error('Ошибка при обновлении пассажира:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении пассажира' },
      { status: 500 }
    );
  }
}

// DELETE /api/passenger/[id] - удалить пассажира
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID пассажира' },
        { status: 400 }
      );
    }

    // Проверяем существование пассажира
    const existingPassenger = await prisma.passenger.findUnique({
      where: { passenger_id: id },
      include: {
        tickets: true
      }
    });

    if (!existingPassenger) {
      return NextResponse.json(
        { error: 'Пассажир не найден' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные билеты
    if (existingPassenger.tickets.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить пассажира, связанного с билетами' },
        { status: 400 }
      );
    }

    await prisma.passenger.delete({
      where: { passenger_id: id }
    });

    return NextResponse.json({ message: 'Пассажир успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении пассажира:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении пассажира' },
      { status: 500 }
    );
  }
} 