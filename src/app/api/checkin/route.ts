import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/checkin - получить все регистрации
export async function GET() {
  try {
    const checkins = await prisma.checkin.findMany({
      include: {
        ticket: {
          include: {
            passenger: true,
            flight: {
              include: {
                departureAirport: true,
                arrivalAirport: true
              }
            }
          }
        },
        baggages: true
      },
      orderBy: {
        checkin_time: 'desc'
      }
    });

    return NextResponse.json(checkins);
  } catch (error) {
    console.error('Ошибка при получении регистраций:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении регистраций' },
      { status: 500 }
    );
  }
}

// POST /api/checkin - создать новую регистрацию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticket_id, baggage_count, baggages } = body;

    // Валидация обязательных полей
    if (!ticket_id || baggage_count === undefined) {
      return NextResponse.json(
        { error: 'ID билета и количество багажа обязательны' },
        { status: 400 }
      );
    }

    // Проверяем существование билета
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id: parseInt(ticket_id) }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Билет не найден' },
        { status: 400 }
      );
    }

    // Проверяем, что у билета нет уже регистрации
    const existingCheckin = await prisma.checkin.findFirst({
      where: { ticket_id: parseInt(ticket_id) }
    });

    if (existingCheckin) {
      return NextResponse.json(
        { error: 'У этого билета уже есть регистрация' },
        { status: 400 }
      );
    }

    // Генерируем новый ID для регистрации
    const maxCheckin = await prisma.checkin.findFirst({
      orderBy: { checkin_id: 'desc' }
    });
    const newCheckinId = (maxCheckin?.checkin_id || 0) + 1;

    // Создаем регистрацию и багаж в транзакции
    const checkin = await prisma.$transaction(async (tx: any) => {
      // Создаем регистрацию
      const newCheckin = await tx.checkin.create({
        data: {
          checkin_id: newCheckinId,
          ticket: { connect: { ticket_id: parseInt(ticket_id) } },
          checkin_time: new Date(),
          baggage_count: parseInt(baggage_count)
        }
      });

      // Создаем багаж, если он указан
      if (baggages && baggages.length > 0) {
        for (const baggage of baggages) {
          const maxBaggage = await tx.baggage.findFirst({
            orderBy: { baggage_id: 'desc' }
          });
          const newBaggageId = (maxBaggage?.baggage_id || 0) + 1;

          await tx.baggage.create({
            data: {
              baggage_id: newBaggageId,
              checkin: { connect: { checkin_id: newCheckinId } },
              weight_kg: parseFloat(baggage.weight_kg),
              label_number: baggage.label_number
            }
          });
        }
      }

      return newCheckin;
    });

    // Получаем созданную регистрацию с полными данными
    const createdCheckin = await prisma.checkin.findUnique({
      where: { checkin_id: checkin.checkin_id },
      include: {
        ticket: {
          include: {
            passenger: true,
            flight: {
              include: {
                departureAirport: true,
                arrivalAirport: true
              }
            }
          }
        },
        baggages: true
      }
    });

    return NextResponse.json(createdCheckin, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании регистрации:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании регистрации' },
      { status: 500 }
    );
  }
} 