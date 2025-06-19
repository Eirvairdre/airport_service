import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/aircraft-type/[id] - получить тип воздушного судна по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID типа воздушного судна' },
        { status: 400 }
      );
    }

    const aircraftType = await prisma.aircraft_Type.findUnique({
      where: { aircraft_type_id: id },
      include: {
        aircrafts: {
          include: {
            airline: true
          }
        }
      }
    });

    if (!aircraftType) {
      return NextResponse.json(
        { error: 'Тип воздушного судна не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(aircraftType);
  } catch (error) {
    console.error('Ошибка при получении типа воздушного судна:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении типа воздушного судна' },
      { status: 500 }
    );
  }
}

// PATCH /api/aircraft-type/[id] - обновить тип воздушного судна
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID типа воздушного судна' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { model, manufacturer, seats, max_range_km } = body;

    // Проверяем существование типа воздушного судна
    const existingAircraftType = await prisma.aircraft_Type.findUnique({
      where: { aircraft_type_id: id }
    });

    if (!existingAircraftType) {
      return NextResponse.json(
        { error: 'Тип воздушного судна не найден' },
        { status: 404 }
      );
    }

    // Валидация обязательных полей
    if (!model || !manufacturer) {
      return NextResponse.json(
        { error: 'Модель и производитель обязательны' },
        { status: 400 }
      );
    }

    const aircraftType = await prisma.aircraft_Type.update({
      where: { aircraft_type_id: id },
      data: {
        model,
        manufacturer,
        seats: seats ? parseInt(seats) : null,
        max_range_km: max_range_km ? parseInt(max_range_km) : null,
      }
    });

    return NextResponse.json(aircraftType);
  } catch (error) {
    console.error('Ошибка при обновлении типа воздушного судна:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении типа воздушного судна' },
      { status: 500 }
    );
  }
}

// DELETE /api/aircraft-type/[id] - удалить тип воздушного судна
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID типа воздушного судна' },
        { status: 400 }
      );
    }

    // Проверяем существование типа воздушного судна
    const existingAircraftType = await prisma.aircraft_Type.findUnique({
      where: { aircraft_type_id: id },
      include: {
        aircrafts: true
      }
    });

    if (!existingAircraftType) {
      return NextResponse.json(
        { error: 'Тип воздушного судна не найден' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные воздушные суда
    if (existingAircraftType.aircrafts.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить тип воздушного судна, связанный с воздушными судами' },
        { status: 400 }
      );
    }

    await prisma.aircraft_Type.delete({
      where: { aircraft_type_id: id }
    });

    return NextResponse.json({ message: 'Тип воздушного судна успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении типа воздушного судна:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении типа воздушного судна' },
      { status: 500 }
    );
  }
} 