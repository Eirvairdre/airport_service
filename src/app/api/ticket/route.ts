import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/ticket - получить список всех билетов
export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        passenger: true,
        flight: {
          include: {
            departureAirport: true,
            arrivalAirport: true
          }
        }
      },
      orderBy: {
        ticket_id: 'desc'
      }
    });
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Ошибка при получении билетов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении билетов' },
      { status: 500 }
    );
  }
}

// POST /api/ticket - создать новый билет
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passenger_id, flight_id, seat_number, ticket_price, baggage_included } = body;

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

    // Генерируем новый ticket_id
    const maxTicket = await prisma.ticket.findFirst({
      orderBy: { ticket_id: 'desc' }
    });
    const newTicketId = (maxTicket?.ticket_id || 0) + 1;

    const ticket = await prisma.ticket.create({
      data: {
        ticket_id: newTicketId,
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

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании билета:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании билета' },
      { status: 500 }
    );
  }
} 