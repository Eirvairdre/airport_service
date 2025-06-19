import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// Получаю список всех инцидентов
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

    const incidents = await prisma.incident.findMany({
      include: {
        flight: {
          include: {
            departureAirport: {
              select: {
                name: true,
                iata_code: true,
              }
            },
            arrivalAirport: {
              select: {
                name: true,
                iata_code: true,
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
        incident_time: 'desc'
      },
      skip: offset,
      take: limit
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Создаю новый инцидент
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Incoming body:', body); // Смотрю, что приходит в запросе
    const { flight_id, personnel_id, incident_time, description, severity } = body;

    // Проверяю обязательные поля
    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Описание инцидента обязательно' },
        { status: 400 }
      );
    }

    if (!incident_time) {
      return NextResponse.json(
        { error: 'Время инцидента обязательно' },
        { status: 400 }
      );
    }

    // Проверяю, что рейс и персонал существуют, если указаны
    if (flight_id) {
      const flight = await prisma.flight.findUnique({
        where: { flight_id: parseInt(flight_id) }
      });
      if (!flight) {
        return NextResponse.json(
          { error: 'Рейс не найден' },
          { status: 404 }
        );
      }
    }

    if (personnel_id) {
      const personnel = await prisma.personnel.findUnique({
        where: { personnel_id: parseInt(personnel_id) }
      });
      if (!personnel) {
        return NextResponse.json(
          { error: 'Персонал не найден' },
          { status: 404 }
        );
      }
    }

    // Подготавливаю данные для создания записи
    const dataToCreate = {
      flight_id: flight_id ? parseInt(flight_id) : null,
      personnel_id: personnel_id ? parseInt(personnel_id) : null,
      incident_time: new Date(incident_time),
      description: description.trim(),
      severity: severity || 'Medium'
    };
    
    console.log('Data to create:', dataToCreate); // Смотрю, что буду создавать

    const incident = await prisma.incident.create({
      data: dataToCreate,
      include: {
        flight: {
          include: {
            departureAirport: {
              select: {
                name: true,
                iata_code: true,
              }
            },
            arrivalAirport: {
              select: {
                name: true,
                iata_code: true,
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

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 