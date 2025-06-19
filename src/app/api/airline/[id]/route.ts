import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/airline/[id] - получить авиакомпанию по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID авиакомпании' },
        { status: 400 }
      );
    }

    const airline = await prisma.airline.findUnique({
      where: { airline_id: id },
      include: {
        aircrafts: {
          include: {
            aircraft_type: true
          }
        },
        flights: {
          include: {
            departureAirport: true,
            arrivalAirport: true
          }
        }
      }
    });

    if (!airline) {
      return NextResponse.json(
        { error: 'Авиакомпания не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(airline);
  } catch (error) {
    console.error('Ошибка при получении авиакомпании:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении авиакомпании' },
      { status: 500 }
    );
  }
}

// PATCH /api/airline/[id] - обновить авиакомпанию
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID авиакомпании' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, iata_code, country } = body;

    // Проверяем существование авиакомпании
    const existingAirline = await prisma.airline.findUnique({
      where: { airline_id: id }
    });

    if (!existingAirline) {
      return NextResponse.json(
        { error: 'Авиакомпания не найдена' },
        { status: 404 }
      );
    }

    // Если меняется IATA код, проверяем уникальность
    if (iata_code && iata_code !== existingAirline.iata_code) {
      const duplicateAirline = await prisma.airline.findFirst({
        where: { 
          iata_code: iata_code.toUpperCase(),
          airline_id: { not: id }
        }
      });

      if (duplicateAirline) {
        return NextResponse.json(
          { error: 'Авиакомпания с таким IATA кодом уже существует' },
          { status: 400 }
        );
      }
    }

    const airline = await prisma.airline.update({
      where: { airline_id: id },
      data: {
        name: name || undefined,
        iata_code: iata_code ? iata_code.toUpperCase() : undefined,
        country: country || undefined,
      }
    });

    return NextResponse.json(airline);
  } catch (error) {
    console.error('Ошибка при обновлении авиакомпании:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении авиакомпании' },
      { status: 500 }
    );
  }
}

// DELETE /api/airline/[id] - удалить авиакомпанию
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID авиакомпании' },
        { status: 400 }
      );
    }

    // Проверяем существование авиакомпании
    const existingAirline = await prisma.airline.findUnique({
      where: { airline_id: id },
      include: {
        aircrafts: true,
        flights: true
      }
    });

    if (!existingAirline) {
      return NextResponse.json(
        { error: 'Авиакомпания не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные данные
    if (existingAirline.aircrafts.length > 0 || existingAirline.flights.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить авиакомпанию, связанную с самолетами или рейсами' },
        { status: 400 }
      );
    }

    await prisma.airline.delete({
      where: { airline_id: id }
    });

    return NextResponse.json({ message: 'Авиакомпания успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении авиакомпании:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении авиакомпании' },
      { status: 500 }
    );
  }
} 