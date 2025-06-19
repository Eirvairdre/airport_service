import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET /api/maintenance/[id] - получить конкретную запись обслуживания
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const maintenanceId = parseInt(params.id);
    if (isNaN(maintenanceId)) {
      return NextResponse.json(
        { error: 'Invalid maintenance ID' },
        { status: 400 }
      );
    }

    const maintenance = await prisma.maintenance.findUnique({
      where: { maintenance_id: maintenanceId },
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

    if (!maintenance) {
      return NextResponse.json(
        { error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/maintenance/[id] - обновить запись обслуживания
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const maintenanceId = parseInt(params.id);
    if (isNaN(maintenanceId)) {
      return NextResponse.json(
        { error: 'Invalid maintenance ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { aircraft_id, personnel_id, start_time, end_time, description } = body;

    // Проверка существования записи
    const existingMaintenance = await prisma.maintenance.findUnique({
      where: { maintenance_id: maintenanceId }
    });

    if (!existingMaintenance) {
      return NextResponse.json(
        { error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    // Валидация
    if (description !== undefined && (!description || !description.trim())) {
      return NextResponse.json(
        { error: 'Описание обслуживания обязательно' },
        { status: 400 }
      );
    }

    // Проверка существования связанных записей
    if (aircraft_id) {
      const aircraft = await prisma.aircraft.findUnique({
        where: { aircraft_id: parseInt(aircraft_id) }
      });
      if (!aircraft) {
        return NextResponse.json(
          { error: 'Воздушное судно не найдено' },
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

    // Проверка времени
    if (start_time && end_time) {
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);
      if (startTime >= endTime) {
        return NextResponse.json(
          { error: 'Время окончания должно быть позже времени начала' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    
    if (aircraft_id !== undefined) {
      updateData.aircraft_id = parseInt(aircraft_id);
    }
    if (personnel_id !== undefined) {
      updateData.personnel_id = parseInt(personnel_id);
    }
    if (start_time !== undefined) {
      updateData.start_time = new Date(start_time);
    }
    if (end_time !== undefined) {
      updateData.end_time = end_time ? new Date(end_time) : null;
    }
    if (description !== undefined) {
      updateData.description = description.trim();
    }

    const maintenance = await prisma.maintenance.update({
      where: { maintenance_id: maintenanceId },
      data: updateData,
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

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/maintenance/[id] - удалить запись обслуживания
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const maintenanceId = parseInt(params.id);
    if (isNaN(maintenanceId)) {
      return NextResponse.json(
        { error: 'Invalid maintenance ID' },
        { status: 400 }
      );
    }

    // Проверка существования записи
    const existingMaintenance = await prisma.maintenance.findUnique({
      where: { maintenance_id: maintenanceId }
    });

    if (!existingMaintenance) {
      return NextResponse.json(
        { error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    await prisma.maintenance.delete({
      where: { maintenance_id: maintenanceId }
    });

    return NextResponse.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 