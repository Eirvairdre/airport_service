import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/aircraft/[id] - получить воздушное судно по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID воздушного судна' },
        { status: 400 }
      );
    }

    const aircraft = await prisma.aircraft.findUnique({
      where: { aircraft_id: id },
      include: {
        aircraft_type: true,
        airline: true,
        flights: {
          include: {
            airline: true,
            departureAirport: true,
            arrivalAirport: true
          }
        },
        maintenances: {
          include: {
            personnel: true
          }
        }
      }
    });

    if (!aircraft) {
      return NextResponse.json(
        { error: 'Воздушное судно не найдено' },
        { status: 404 }
      );
    }

    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Ошибка при получении воздушного судна:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении воздушного судна' },
      { status: 500 }
    );
  }
}

// PATCH /api/aircraft/[id] - обновить воздушное судно
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID воздушного судна' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { aircraft_type_id, tail_number, airline_id } = body;

    // Проверяем существование воздушного судна
    const existingAircraft = await prisma.aircraft.findUnique({
      where: { aircraft_id: id }
    });

    if (!existingAircraft) {
      return NextResponse.json(
        { error: 'Воздушное судно не найдено' },
        { status: 404 }
      );
    }

    // Если меняется номер борта, проверяем уникальность
    if (tail_number && tail_number !== existingAircraft.tail_number) {
      const duplicateAircraft = await prisma.aircraft.findFirst({
        where: { 
          tail_number,
          aircraft_id: { not: id }
        }
      });

      if (duplicateAircraft) {
        return NextResponse.json(
          { error: 'Воздушное судно с таким номером борта уже существует' },
          { status: 400 }
        );
      }
    }

    const aircraft = await prisma.aircraft.update({
      where: { aircraft_id: id },
      data: {
        aircraft_type_id: aircraft_type_id ? parseInt(aircraft_type_id) : null,
        tail_number: tail_number || undefined,
        airline_id: airline_id ? parseInt(airline_id) : null,
      },
      include: {
        aircraft_type: true,
        airline: true
      }
    });

    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Ошибка при обновлении воздушного судна:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении воздушного судна' },
      { status: 500 }
    );
  }
}

// DELETE /api/aircraft/[id] - удалить воздушное судно
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID воздушного судна' },
        { status: 400 }
      );
    }

    // Проверяем существование воздушного судна
    const existingAircraft = await prisma.aircraft.findUnique({
      where: { aircraft_id: id },
      include: {
        flights: true,
        maintenances: true
      }
    });

    if (!existingAircraft) {
      return NextResponse.json(
        { error: 'Воздушное судно не найдено' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные данные
    if (existingAircraft.flights.length > 0 || existingAircraft.maintenances.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить воздушное судно, связанное с рейсами или техобслуживанием' },
        { status: 400 }
      );
    }

    await prisma.aircraft.delete({
      where: { aircraft_id: id }
    });

    return NextResponse.json({ message: 'Воздушное судно успешно удалено' });
  } catch (error) {
    console.error('Ошибка при удалении воздушного судна:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении воздушного судна' },
      { status: 500 }
    );
  }
} 