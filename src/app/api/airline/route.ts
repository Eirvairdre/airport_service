import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/airline - получить список всех авиакомпаний
export async function GET() {
  try {
    const airlines = await prisma.airline.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(airlines);
  } catch (error) {
    console.error('Ошибка при получении авиакомпаний:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении авиакомпаний' },
      { status: 500 }
    );
  }
}

// POST /api/airline - создать новую авиакомпанию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, iata_code, country } = body;

    // Валидация обязательных полей
    if (!name || !iata_code || !country) {
      return NextResponse.json(
        { error: 'Название, IATA код и страна обязательны' },
        { status: 400 }
      );
    }

    // Проверяем уникальность IATA кода
    const existingAirline = await prisma.airline.findFirst({
      where: { iata_code: iata_code.toUpperCase() }
    });

    if (existingAirline) {
      return NextResponse.json(
        { error: 'Авиакомпания с таким IATA кодом уже существует' },
        { status: 400 }
      );
    }

    // Генерируем новый airline_id
    const maxAirline = await prisma.airline.findFirst({
      orderBy: {
        airline_id: 'desc'
      }
    });
    
    const newAirlineId = maxAirline ? maxAirline.airline_id + 1 : 1;

    const airline = await prisma.airline.create({
      data: {
        airline_id: newAirlineId,
        name,
        iata_code: iata_code.toUpperCase(),
        country,
      }
    });

    return NextResponse.json(airline, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании авиакомпании:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании авиакомпании' },
      { status: 500 }
    );
  }
} 