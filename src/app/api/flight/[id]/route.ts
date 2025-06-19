import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/flight/[id] - получить рейс по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID рейса' },
        { status: 400 }
      );
    }

    const flight = await prisma.flight.findUnique({
      where: { flight_id: id },
      include: {
        aircraft: {
          include: {
            aircraft_type: true
          }
        },
        airline: true,
        gate: {
          include: {
            terminal: {
              include: {
                airport: true
              }
            }
          }
        },
        stand: {
          include: {
            airport: true
          }
        },
        departureAirport: true,
        arrivalAirport: true,
        schedules: true,
        tickets: {
          include: {
            passenger: true
          }
        },
        crew: {
          include: {
            members: {
              include: {
                personnel: true
              }
            }
          }
        },
        incidents: {
          include: {
            personnel: true
          }
        }
      }
    });

    if (!flight) {
      return NextResponse.json(
        { error: 'Рейс не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(flight);
  } catch (error) {
    console.error('Ошибка при получении рейса:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении рейса' },
      { status: 500 }
    );
  }
}

// PATCH /api/flight/[id] - обновить рейс
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID рейса' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      aircraft_id,
      airline_id,
      gate_id,
      stand_id,
      departure_airport_id,
      arrival_airport_id,
      scheduled_departure,
      scheduled_arrival,
      flight_number,
      status
    } = body;

    // Проверяем существование рейса
    const existingFlight = await prisma.flight.findUnique({
      where: { flight_id: id }
    });

    if (!existingFlight) {
      return NextResponse.json(
        { error: 'Рейс не найден' },
        { status: 404 }
      );
    }

    // Валидация данных
    if (departure_airport_id && arrival_airport_id && departure_airport_id === arrival_airport_id) {
      return NextResponse.json(
        { error: 'Аэропорты отправления и прибытия должны быть разными' },
        { status: 400 }
      );
    }

    if (scheduled_departure && scheduled_arrival) {
      const departureTime = new Date(scheduled_departure);
      const arrivalTime = new Date(scheduled_arrival);
      
      if (arrivalTime <= departureTime) {
        return NextResponse.json(
          { error: 'Время прибытия должно быть позже времени отправления' },
          { status: 400 }
        );
      }
    }

    // Проверяем уникальность номера рейса в этот день (если изменился номер или дата)
    if (flight_number && flight_number !== existingFlight.flight_number) {
      const departureTime = scheduled_departure ? new Date(scheduled_departure) : existingFlight.scheduled_departure;
      const existingFlightWithNumber = await prisma.flight.findFirst({
        where: {
          flight_number,
          flight_id: { not: id },
          scheduled_departure: {
            gte: new Date(departureTime.getFullYear(), departureTime.getMonth(), departureTime.getDate()),
            lt: new Date(departureTime.getFullYear(), departureTime.getMonth(), departureTime.getDate() + 1)
          }
        }
      });

      if (existingFlightWithNumber) {
        return NextResponse.json(
          { error: 'Рейс с таким номером уже существует в этот день' },
          { status: 400 }
        );
      }
    }

    const flight = await prisma.flight.update({
      where: { flight_id: id },
      data: {
        aircraft_id: aircraft_id ? parseInt(aircraft_id) : null,
        airline_id: airline_id ? parseInt(airline_id) : null,
        gate_id: gate_id ? parseInt(gate_id) : null,
        stand_id: stand_id ? parseInt(stand_id) : null,
        departure_airport_id: departure_airport_id ? parseInt(departure_airport_id) : undefined,
        arrival_airport_id: arrival_airport_id ? parseInt(arrival_airport_id) : undefined,
        scheduled_departure: scheduled_departure ? new Date(scheduled_departure) : undefined,
        scheduled_arrival: scheduled_arrival ? new Date(scheduled_arrival) : undefined,
        flight_number: flight_number || undefined,
        status: status || undefined,
      },
      include: {
        aircraft: {
          include: {
            aircraft_type: true
          }
        },
        airline: true,
        gate: {
          include: {
            terminal: {
              include: {
                airport: true
              }
            }
          }
        },
        stand: {
          include: {
            airport: true
          }
        },
        departureAirport: true,
        arrivalAirport: true
      }
    });

    return NextResponse.json(flight);
  } catch (error) {
    console.error('Ошибка при обновлении рейса:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении рейса' },
      { status: 500 }
    );
  }
}

// DELETE /api/flight/[id] - удалить рейс
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID рейса' },
        { status: 400 }
      );
    }

    // Проверяем существование рейса
    const existingFlight = await prisma.flight.findUnique({
      where: { flight_id: id },
      include: {
        tickets: true,
        crew: true,
        incidents: true
      }
    });

    if (!existingFlight) {
      return NextResponse.json(
        { error: 'Рейс не найден' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные данные
    if (existingFlight.tickets.length > 0 || 
        existingFlight.crew.length > 0 || 
        existingFlight.incidents.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить рейс, связанный с билетами, экипажем или инцидентами' },
        { status: 400 }
      );
    }

    await prisma.flight.delete({
      where: { flight_id: id }
    });

    return NextResponse.json({ message: 'Рейс успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении рейса:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении рейса' },
      { status: 500 }
    );
  }
} 