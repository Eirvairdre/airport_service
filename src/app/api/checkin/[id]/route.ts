import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/checkin/[id] - получить регистрацию по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checkinId = parseInt(id);
    
    if (isNaN(checkinId)) {
      return NextResponse.json(
        { error: 'Неверный ID регистрации' },
        { status: 400 }
      );
    }

    const checkin = await prisma.checkin.findUnique({
      where: { checkin_id: checkinId },
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

    if (!checkin) {
      return NextResponse.json(
        { error: 'Регистрация не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(checkin);
  } catch (error) {
    console.error('Ошибка при получении регистрации:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении регистрации' },
      { status: 500 }
    );
  }
}

// PATCH /api/checkin/[id] - обновить регистрацию
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checkinId = parseInt(id);
    
    if (isNaN(checkinId)) {
      return NextResponse.json(
        { error: 'Неверный ID регистрации' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { ticket_id, baggage_count, baggages } = body;

    // Проверяем существование регистрации
    const existingCheckin = await prisma.checkin.findUnique({
      where: { checkin_id: checkinId }
    });

    if (!existingCheckin) {
      return NextResponse.json(
        { error: 'Регистрация не найдена' },
        { status: 404 }
      );
    }

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

    // Проверяем, что у другого билета нет уже регистрации (если меняется билет)
    if (parseInt(ticket_id) !== existingCheckin.ticket_id) {
      const otherCheckin = await prisma.checkin.findFirst({
        where: { 
          ticket_id: parseInt(ticket_id),
          checkin_id: { not: checkinId }
        }
      });

      if (otherCheckin) {
        return NextResponse.json(
          { error: 'У этого билета уже есть регистрация' },
          { status: 400 }
        );
      }
    }

    // Обновляем регистрацию и багаж в транзакции
    const checkin = await prisma.$transaction(async (tx: any) => {
      // Обновляем регистрацию
      const updatedCheckin = await tx.checkin.update({
        where: { checkin_id: checkinId },
        data: {
          ticket: { connect: { ticket_id: parseInt(ticket_id) } },
          baggage_count: parseInt(baggage_count)
        }
      });

      // Удаляем старый багаж
      await tx.baggage.deleteMany({
        where: { checkin_id: checkinId }
      });

      // Создаем новый багаж, если он указан
      if (baggages && baggages.length > 0) {
        for (const baggage of baggages) {
          const maxBaggage = await tx.baggage.findFirst({
            orderBy: { baggage_id: 'desc' }
          });
          const newBaggageId = (maxBaggage?.baggage_id || 0) + 1;

          await tx.baggage.create({
            data: {
              baggage_id: newBaggageId,
              checkin: { connect: { checkin_id: checkinId } },
              weight_kg: parseFloat(baggage.weight_kg),
              label_number: baggage.label_number
            }
          });
        }
      }

      return updatedCheckin;
    });

    // Получаем обновленную регистрацию с полными данными
    const updatedCheckin = await prisma.checkin.findUnique({
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

    return NextResponse.json(updatedCheckin);
  } catch (error) {
    console.error('Ошибка при обновлении регистрации:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении регистрации' },
      { status: 500 }
    );
  }
}

// DELETE /api/checkin/[id] - удалить регистрацию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checkinId = parseInt(id);
    
    if (isNaN(checkinId)) {
      return NextResponse.json(
        { error: 'Неверный ID регистрации' },
        { status: 400 }
      );
    }

    // Проверяем существование регистрации
    const existingCheckin = await prisma.checkin.findUnique({
      where: { checkin_id: checkinId },
      include: {
        baggages: true
      }
    });

    if (!existingCheckin) {
      return NextResponse.json(
        { error: 'Регистрация не найдена' },
        { status: 404 }
      );
    }

    // Удаляем регистрацию и связанный багаж в транзакции
    await prisma.$transaction(async (tx: any) => {
      // Удаляем багаж
      await tx.baggage.deleteMany({
        where: { checkin_id: checkinId }
      });

      // Удаляем регистрацию
      await tx.checkin.delete({
        where: { checkin_id: checkinId }
      });
    });

    return NextResponse.json({ message: 'Регистрация успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении регистрации:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении регистрации' },
      { status: 500 }
    );
  }
} 