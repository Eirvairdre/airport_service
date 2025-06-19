import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/flight - получить список всех рейсов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const airline_id = searchParams.get('airline_id');

    // Базовые условия фильтрации
    const where: any = {};

    // Фильтр по дате
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      where.OR = [
        {
          scheduled_departure: {
            gte: startDate,
            lt: endDate
          }
        },
        {
          scheduled_arrival: {
            gte: startDate,
            lt: endDate
          }
        }
      ];
    }

    // Фильтр по статусу
    if (status) {
      where.status = status;
    }

    // Фильтр по авиакомпании
    if (airline_id) {
      where.airline_id = parseInt(airline_id);
    }

    const flights = await prisma.flight.findMany({
      where,
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
        schedules: true
      },
      orderBy: {
        scheduled_departure: 'asc'
      }
    });
    
    return NextResponse.json(flights);
  } catch (error) {
    console.error('Ошибка при получении рейсов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении рейсов' },
      { status: 500 }
    );
  }
}

// POST /api/flight - создать новый рейс
export async function POST(request: NextRequest) {
  try {
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

    console.log('Полученные данные:', body);
    console.log('scheduled_departure (исходный):', scheduled_departure, typeof scheduled_departure);
    console.log('scheduled_arrival (исходный):', scheduled_arrival, typeof scheduled_arrival);

    // Валидация обязательных полей
    if (!flight_number || !departure_airport_id || !arrival_airport_id || !scheduled_departure || !scheduled_arrival) {
      return NextResponse.json(
        { error: 'Номер рейса, аэропорты и время обязательны' },
        { status: 400 }
      );
    }

    // Проверяем, что аэропорты разные
    if (departure_airport_id === arrival_airport_id) {
      return NextResponse.json(
        { error: 'Аэропорты отправления и прибытия должны быть разными' },
        { status: 400 }
      );
    }

    // Валидация дат
    let departureDate: Date;
    let arrivalDate: Date;
    
    try {
      departureDate = new Date(scheduled_departure);
      arrivalDate = new Date(scheduled_arrival);
      
      console.log('departureDate после new Date():', departureDate);
      console.log('arrivalDate после new Date():', arrivalDate);
      console.log('departureDate.getTime():', departureDate.getTime());
      console.log('arrivalDate.getTime():', arrivalDate.getTime());
      
    } catch (dateError) {
      console.error('Ошибка при создании объектов Date:', dateError);
      return NextResponse.json(
        { error: 'Неверный формат даты' },
        { status: 400 }
      );
    }
    
    if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
      console.error('Даты невалидны после преобразования');
      return NextResponse.json(
        { error: 'Неверный формат даты' },
        { status: 400 }
      );
    }

    if (departureDate >= arrivalDate) {
      return NextResponse.json(
        { error: 'Время прибытия должно быть позже времени отправления' },
        { status: 400 }
      );
    }

    // Генерируем новый flight_id
    const maxFlight = await prisma.flight.findFirst({
      orderBy: { flight_id: 'desc' }
    });
    const newFlightId = (maxFlight?.flight_id || 0) + 1;

    // Подготавливаем данные для создания
    const flightData: any = {
      flight_id: newFlightId,
      flight_number,
      departure_airport_id: parseInt(departure_airport_id),
      arrival_airport_id: parseInt(arrival_airport_id),
      scheduled_departure: departureDate,
      scheduled_arrival: arrivalDate,
      status: status || 'Scheduled'
    };

    // Добавляем опциональные поля только если они не пустые
    if (aircraft_id && aircraft_id !== '') {
      flightData.aircraft_id = parseInt(aircraft_id);
    }
    if (airline_id && airline_id !== '') {
      flightData.airline_id = parseInt(airline_id);
    }
    if (gate_id && gate_id !== '') {
      flightData.gate_id = parseInt(gate_id);
    }
    if (stand_id && stand_id !== '') {
      flightData.stand_id = parseInt(stand_id);
    }

    console.log('Данные для создания рейса:', flightData);

    const flight = await prisma.flight.create({
      data: flightData,
      include: {
        aircraft: {
          include: {
            aircraft_type: true,
            airline: true
          }
        },
        airline: true,
        departureAirport: true,
        arrivalAirport: true,
        gate: true,
        stand: true
      }
    });

    return NextResponse.json(flight);
  } catch (error: any) {
    console.error('Ошибка создания рейса:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка создания рейса' },
      { status: 500 }
    );
  }
} 