import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Получаю список всех записей техобслуживания
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const maintenance = await prisma.maintenance.findMany({
      include: {
        aircraft: {
          include: {
            aircraft_type: {
              select: {
                model: true,
                manufacturer: true,
              }
            }
          }
        },
        personnel: {
          select: {
            name: true,
            position_id: true,
          }
        }
      },
      orderBy: {
        start_time: 'desc'
      },
      skip: offset,
      take: limit
    });

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Создаю новую запись техобслуживания
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { aircraft_id, personnel_id, start_time, end_time, description } = body;

    // Проверяю, что все обязательные поля заполнены
    if (!aircraft_id) {
      return NextResponse.json(
        { error: 'ID воздушного судна обязательно' },
        { status: 400 }
      );
    }

    if (!personnel_id) {
      return NextResponse.json(
        { error: 'ID персонала обязательно' },
        { status: 400 }
      );
    }

    if (!start_time) {
      return NextResponse.json(
        { error: 'Время начала обслуживания обязательно' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Описание обслуживания обязательно' },
        { status: 400 }
      );
    }

    // Проверяю, что самолет и персонал существуют
    const aircraft = await prisma.aircraft.findUnique({
      where: { aircraft_id: parseInt(aircraft_id) }
    });
    if (!aircraft) {
      return NextResponse.json(
        { error: 'Воздушное судно не найдено' },
        { status: 404 }
      );
    }

    const personnel = await prisma.personnel.findUnique({
      where: { personnel_id: parseInt(personnel_id) }
    });
    if (!personnel) {
      return NextResponse.json(
        { error: 'Персонал не найден' },
        { status: 404 }
      );
    }

    // Проверяю логику времени - конец должен быть после начала
    const startTime = new Date(start_time);
    if (end_time) {
      const endTime = new Date(end_time);
      if (startTime >= endTime) {
        return NextResponse.json(
          { error: 'Время окончания должно быть позже времени начала' },
          { status: 400 }
        );
      }
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        aircraft_id: parseInt(aircraft_id),
        personnel_id: parseInt(personnel_id),
        start_time: startTime,
        end_time: end_time ? new Date(end_time) : null,
        description: description.trim()
      },
      include: {
        aircraft: {
          include: {
            aircraft_type: {
              select: {
                model: true,
                manufacturer: true,
              }
            }
          }
        },
        personnel: {
          select: {
            name: true,
            position_id: true,
          }
        }
      }
    });

    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 