import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/airport/[id] - получить аэропорт по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID аэропорта' },
        { status: 400 }
      );
    }

    const airport = await prisma.airport.findUnique({
      where: { airport_id: id },
      include: {
        terminals: true,
        stands: true,
        departureFlights: {
          include: {
            airline: true,
            arrivalAirport: true
          }
        },
        arrivalFlights: {
          include: {
            airline: true,
            departureAirport: true
          }
        }
      }
    });

    if (!airport) {
      return NextResponse.json(
        { error: 'Аэропорт не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(airport);
  } catch (error) {
    console.error('Ошибка при получении аэропорта:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении аэропорта' },
      { status: 500 }
    );
  }
}

// PATCH /api/airport/[id] - обновить аэропорт
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID аэропорта' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, city, country, iata_code, icao_code } = body;

    // Проверяем существование аэропорта
    const existingAirport = await prisma.airport.findUnique({
      where: { airport_id: id }
    });

    if (!existingAirport) {
      return NextResponse.json(
        { error: 'Аэропорт не найден' },
        { status: 404 }
      );
    }

    const airport = await prisma.airport.update({
      where: { airport_id: id },
      data: {
        name: name || undefined,
        city: city || undefined,
        country: country || undefined,
        iata_code: iata_code || null,
        icao_code: icao_code || null,
      }
    });

    return NextResponse.json(airport);
  } catch (error) {
    console.error('Ошибка при обновлении аэропорта:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении аэропорта' },
      { status: 500 }
    );
  }
}

// DELETE /api/airport/[id] - удалить аэропорт
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID аэропорта' },
        { status: 400 }
      );
    }

    // Проверяем существование аэропорта
    const existingAirport = await prisma.airport.findUnique({
      where: { airport_id: id },
      include: {
        departureFlights: true,
        arrivalFlights: true,
        terminals: true,
        stands: true
      }
    });

    if (!existingAirport) {
      return NextResponse.json(
        { error: 'Аэропорт не найден' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные данные
    if (existingAirport.departureFlights.length > 0 || 
        existingAirport.arrivalFlights.length > 0 ||
        existingAirport.terminals.length > 0 ||
        existingAirport.stands.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить аэропорт, связанный с рейсами, терминалами или стоянками' },
        { status: 400 }
      );
    }

    await prisma.airport.delete({
      where: { airport_id: id }
    });

    return NextResponse.json({ message: 'Аэропорт успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении аэропорта:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении аэропорта' },
      { status: 500 }
    );
  }
} 