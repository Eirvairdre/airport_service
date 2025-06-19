import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET /api/incident/[id] - получить конкретный инцидент
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incidentId = parseInt(params.id);
    if (isNaN(incidentId)) {
      return NextResponse.json(
        { error: 'Invalid incident ID' },
        { status: 400 }
      );
    }

    const incident = await prisma.incident.findUnique({
      where: { incident_id: incidentId },
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

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/incident/[id] - обновить инцидент
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incidentId = parseInt(params.id);
    if (isNaN(incidentId)) {
      return NextResponse.json(
        { error: 'Invalid incident ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { flight_id, personnel_id, incident_time, description, severity } = body;

    // Проверка существования инцидента
    const existingIncident = await prisma.incident.findUnique({
      where: { incident_id: incidentId }
    });

    if (!existingIncident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Валидация
    if (description !== undefined && (!description || !description.trim())) {
      return NextResponse.json(
        { error: 'Описание инцидента обязательно' },
        { status: 400 }
      );
    }

    // Проверка существования связанных записей
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

    const updateData: any = {};
    
    if (flight_id !== undefined) {
      updateData.flight_id = flight_id ? parseInt(flight_id) : null;
    }
    if (personnel_id !== undefined) {
      updateData.personnel_id = personnel_id ? parseInt(personnel_id) : null;
    }
    if (incident_time !== undefined) {
      updateData.incident_time = new Date(incident_time);
    }
    if (description !== undefined) {
      updateData.description = description.trim();
    }
    if (severity !== undefined) {
      updateData.severity = severity;
    }

    const incident = await prisma.incident.update({
      where: { incident_id: incidentId },
      data: updateData,
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

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/incident/[id] - удалить инцидент
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incidentId = parseInt(params.id);
    if (isNaN(incidentId)) {
      return NextResponse.json(
        { error: 'Invalid incident ID' },
        { status: 400 }
      );
    }

    // Проверка существования инцидента
    const existingIncident = await prisma.incident.findUnique({
      where: { incident_id: incidentId }
    });

    if (!existingIncident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    await prisma.incident.delete({
      where: { incident_id: incidentId }
    });

    return NextResponse.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 