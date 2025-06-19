import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/airport - получить список всех аэропортов
export async function GET() {
  try {
    const airports = await prisma.airport.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(airports);
  } catch (error) {
    console.error('Ошибка при получении аэропортов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении аэропортов' },
      { status: 500 }
    );
  }
}

// POST /api/airport - создать новый аэропорт
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, city, country, iata_code, icao_code } = body;

    // Валидация обязательных полей
    if (!name || !city || !country) {
      return NextResponse.json(
        { error: 'Название, город и страна обязательны' },
        { status: 400 }
      );
    }

    const airport = await prisma.airport.create({
      data: {
        name,
        city,
        country,
        iata_code: iata_code || null,
        icao_code: icao_code || null,
      }
    });

    return NextResponse.json(airport, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании аэропорта:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании аэропорта' },
      { status: 500 }
    );
  }
} 