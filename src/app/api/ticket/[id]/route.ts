import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/ticket/[id] - получить билет по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID билета' },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id: id },
      include: {
        passenger: true,
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true
          }
        },
        checkins: true
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Билет не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Ошибка при получении билета:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении билета' },
      { status: 500 }
    );
  }
}

// PATCH /api/ticket/[id] - обновить билет
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID билета' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { passenger_id, flight_id, seat_number, ticket_price, baggage_included } = body;

    // Проверяем существование билета
    const existingTicket = await prisma.ticket.findUnique({
      where: { ticket_id: id }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Билет не найден' },
        { status: 404 }
      );
    }

    // Валидация обязательных полей
    if (!passenger_id || !flight_id) {
      return NextResponse.json(
        { error: 'Пассажир и рейс обязательны' },
        { status: 400 }
      );
    }

    // Проверяем существование пассажира
    const passenger = await prisma.passenger.findUnique({
      where: { passenger_id: parseInt(passenger_id) }
    });

    if (!passenger) {
      return NextResponse.json(
        { error: 'Пассажир не найден' },
        { status: 400 }
      );
    }

    // Проверяем существование рейса
    const flight = await prisma.flight.findUnique({
      where: { flight_id: parseInt(flight_id) }
    });

    if (!flight) {
      return NextResponse.json(
        { error: 'Рейс не найден' },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.update({
      where: { ticket_id: id },
      data: {
        passenger_id: parseInt(passenger_id),
        flight_id: parseInt(flight_id),
        seat_number: seat_number || null,
        ticket_price: ticket_price ? parseFloat(ticket_price) : null,
        baggage_included: baggage_included || false,
      },
      include: {
        passenger: true,
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true
          }
        }
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Ошибка при обновлении билета:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении билета' },
      { status: 500 }
    );
  }
}

// DELETE /api/ticket/[id] - удалить билет
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID билета' },
        { status: 400 }
      );
    }

    // Проверяем существование билета
    const existingTicket = await prisma.ticket.findUnique({
      where: { ticket_id: id },
      include: {
        checkins: true
      }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Билет не найден' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные регистрации
    if (existingTicket.checkins.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить билет, связанный с регистрациями' },
        { status: 400 }
      );
    }

    await prisma.ticket.delete({
      where: { ticket_id: id }
    });

    return NextResponse.json({ message: 'Билет успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении билета:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении билета' },
      { status: 500 }
    );
  }
} 