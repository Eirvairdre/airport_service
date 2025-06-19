import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/aircraft-type - получить список всех типов воздушных судов
export async function GET() {
  try {
    const aircraftTypes = await prisma.aircraft_Type.findMany({
      orderBy: {
        manufacturer: 'asc'
      }
    });
    
    return NextResponse.json(aircraftTypes);
  } catch (error) {
    console.error('Ошибка при получении типов воздушных судов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении типов воздушных судов' },
      { status: 500 }
    );
  }
}

// POST /api/aircraft-type - создать новый тип воздушного судна
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, manufacturer, seats, max_range_km } = body;

    // Валидация обязательных полей
    if (!model || !manufacturer) {
      return NextResponse.json(
        { error: 'Модель и производитель обязательны' },
        { status: 400 }
      );
    }

    // Генерируем новый aircraft_type_id
    const maxAircraftType = await prisma.aircraft_Type.findFirst({
      orderBy: { aircraft_type_id: 'desc' }
    });
    const newAircraftTypeId = (maxAircraftType?.aircraft_type_id || 0) + 1;

    const aircraftType = await prisma.aircraft_Type.create({
      data: {
        aircraft_type_id: newAircraftTypeId,
        model,
        manufacturer,
        seats: seats ? parseInt(seats) : null,
        max_range_km: max_range_km ? parseInt(max_range_km) : null,
      }
    });

    return NextResponse.json(aircraftType, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании типа воздушного судна:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании типа воздушного судна' },
      { status: 500 }
    );
  }
} 