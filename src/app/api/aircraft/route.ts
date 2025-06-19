import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/aircraft - получить список всех воздушных судов
export async function GET() {
  try {
    const aircraft = await prisma.aircraft.findMany({
      include: {
        aircraft_type: true,
        airline: true
      },
      orderBy: {
        tail_number: 'asc'
      }
    });
    
    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Ошибка при получении воздушных судов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении воздушных судов' },
      { status: 500 }
    );
  }
}

// POST /api/aircraft - создать новое воздушное судно
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aircraft_type_id, tail_number, airline_id } = body;

    // Валидация обязательных полей
    if (!tail_number) {
      return NextResponse.json(
        { error: 'Номер борта обязателен' },
        { status: 400 }
      );
    }

    // Проверяем уникальность номера борта
    const existingAircraft = await prisma.aircraft.findFirst({
      where: { tail_number }
    });

    if (existingAircraft) {
      return NextResponse.json(
        { error: 'Воздушное судно с таким номером борта уже существует' },
        { status: 400 }
      );
    }

    // Генерируем новый aircraft_id
    const maxAircraft = await prisma.aircraft.findFirst({
      orderBy: { aircraft_id: 'desc' }
    });
    const newAircraftId = (maxAircraft?.aircraft_id || 0) + 1;

    const aircraft = await prisma.aircraft.create({
      data: {
        aircraft_id: newAircraftId,
        aircraft_type_id: aircraft_type_id ? parseInt(aircraft_type_id) : null,
        tail_number,
        airline_id: airline_id ? parseInt(airline_id) : null,
      },
      include: {
        aircraft_type: true,
        airline: true
      }
    });

    return NextResponse.json(aircraft, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании воздушного судна:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании воздушного судна' },
      { status: 500 }
    );
  }
} 