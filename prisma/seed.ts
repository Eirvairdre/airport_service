import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Создаю админа для входа в систему
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password,
      name: 'Администратор',
      position: 'admin',
      role: 'admin',
    },
  });
  console.log('Админ создан: admin@admin.com / admin123');

  // Добавляю основные аэропорты России
  const airports = await Promise.all([
    prisma.airport.upsert({
      where: { airport_id: 1 },
      update: {},
      create: {
        airport_id: 1,
        name: 'Шереметьево',
        city: 'Москва',
        country: 'Россия',
        iata_code: 'SVO',
        icao_code: 'UUEE'
      },
    }),
    prisma.airport.upsert({
      where: { airport_id: 2 },
      update: {},
      create: {
        airport_id: 2,
        name: 'Пулково',
        city: 'Санкт-Петербург',
        country: 'Россия',
        iata_code: 'LED',
        icao_code: 'ULLI'
      },
    }),
    prisma.airport.upsert({
      where: { airport_id: 3 },
      update: {},
      create: {
        airport_id: 3,
        name: 'Домодедово',
        city: 'Москва',
        country: 'Россия',
        iata_code: 'DME',
        icao_code: 'UUDD'
      },
    }),
    prisma.airport.upsert({
      where: { airport_id: 4 },
      update: {},
      create: {
        airport_id: 4,
        name: 'Кольцово',
        city: 'Екатеринбург',
        country: 'Россия',
        iata_code: 'SVX',
        icao_code: 'USSS'
      },
    }),
    prisma.airport.upsert({
      where: { airport_id: 5 },
      update: {},
      create: {
        airport_id: 5,
        name: 'Толмачёво',
        city: 'Новосибирск',
        country: 'Россия',
        iata_code: 'OVB',
        icao_code: 'UNNT'
      },
    }),
  ]);
  console.log('Аэропорты созданы');

  // Популярные типы самолетов
  const aircraftTypes = await Promise.all([
    prisma.aircraft_Type.upsert({
      where: { aircraft_type_id: 1 },
      update: {},
      create: {
        aircraft_type_id: 1,
        model: 'A320N',
        manufacturer: 'Airbus',
        seats: 180,
        max_range_km: 6100
      },
    }),
    prisma.aircraft_Type.upsert({
      where: { aircraft_type_id: 2 },
      update: {},
      create: {
        aircraft_type_id: 2,
        model: 'B737-800',
        manufacturer: 'Boeing',
        seats: 189,
        max_range_km: 5765
      },
    }),
    prisma.aircraft_Type.upsert({
      where: { aircraft_type_id: 3 },
      update: {},
      create: {
        aircraft_type_id: 3,
        model: 'SSJ-100',
        manufacturer: 'Sukhoi',
        seats: 98,
        max_range_km: 4500
      },
    }),
    prisma.aircraft_Type.upsert({
      where: { aircraft_type_id: 4 },
      update: {},
      create: {
        aircraft_type_id: 4,
        model: 'E190',
        manufacturer: 'Embraer',
        seats: 114,
        max_range_km: 4260
      },
    }),
    prisma.aircraft_Type.upsert({
      where: { aircraft_type_id: 5 },
      update: {},
      create: {
        aircraft_type_id: 5,
        model: 'CRJ-200',
        manufacturer: 'Bombardier',
        seats: 50,
        max_range_km: 3045
      },
    }),
  ]);
  console.log('Типы воздушных судов созданы');

  // Российские авиакомпании
  const airlines = await Promise.all([
    prisma.airline.upsert({
      where: { airline_id: 1 },
      update: {},
      create: {
        airline_id: 1,
        name: 'Аэрофлот',
        iata_code: 'SU',
        country: 'Россия'
      },
    }),
    prisma.airline.upsert({
      where: { airline_id: 2 },
      update: {},
      create: {
        airline_id: 2,
        name: 'S7 Airlines',
        iata_code: 'S7',
        country: 'Россия'
      },
    }),
    prisma.airline.upsert({
      where: { airline_id: 3 },
      update: {},
      create: {
        airline_id: 3,
        name: 'Уральские авиалинии',
        iata_code: 'U6',
        country: 'Россия'
      },
    }),
    prisma.airline.upsert({
      where: { airline_id: 4 },
      update: {},
      create: {
        airline_id: 4,
        name: 'Победа',
        iata_code: 'DP',
        country: 'Россия'
      },
    }),
    prisma.airline.upsert({
      where: { airline_id: 5 },
      update: {},
      create: {
        airline_id: 5,
        name: 'Red Wings',
        iata_code: 'WZ',
        country: 'Россия'
      },
    }),
  ]);
  console.log('Авиакомпании созданы');

  // Создаем воздушные суда
  const aircraft = await Promise.all([
    prisma.aircraft.upsert({
      where: { aircraft_id: 1 },
      update: {},
      create: {
        aircraft_id: 1,
        aircraft_type_id: 1,
        tail_number: 'SU-123',
        airline_id: 1
      },
    }),
    prisma.aircraft.upsert({
      where: { aircraft_id: 2 },
      update: {},
      create: {
        aircraft_id: 2,
        aircraft_type_id: 2,
        tail_number: 'S7-456',
        airline_id: 2
      },
    }),
    prisma.aircraft.upsert({
      where: { aircraft_id: 3 },
      update: {},
      create: {
        aircraft_id: 3,
        aircraft_type_id: 3,
        tail_number: 'U6-789',
        airline_id: 3
      },
    }),
    prisma.aircraft.upsert({
      where: { aircraft_id: 4 },
      update: {},
      create: {
        aircraft_id: 4,
        aircraft_type_id: 4,
        tail_number: 'DP-321',
        airline_id: 4
      },
    }),
    prisma.aircraft.upsert({
      where: { aircraft_id: 5 },
      update: {},
      create: {
        aircraft_id: 5,
        aircraft_type_id: 5,
        tail_number: 'WZ-654',
        airline_id: 5
      },
    }),
  ]);
  console.log('Воздушные суда созданы');

  // Создаем персонал
  const personnel = await Promise.all([
    prisma.personnel.upsert({
      where: { personnel_id: 1 },
      update: {},
      create: {
        personnel_id: 1,
        name: 'Иван Иванов',
        position_id: 1,
        license_number: 'LIC-001',
        hired_date: new Date('2020-01-01')
      },
    }),
    prisma.personnel.upsert({
      where: { personnel_id: 2 },
      update: {},
      create: {
        personnel_id: 2,
        name: 'Петр Петров',
        position_id: 2,
        license_number: 'LIC-002',
        hired_date: new Date('2021-02-01')
      },
    }),
    prisma.personnel.upsert({
      where: { personnel_id: 3 },
      update: {},
      create: {
        personnel_id: 3,
        name: 'Сергей Сергеев',
        position_id: 3,
        license_number: 'LIC-003',
        hired_date: new Date('2022-03-01')
      },
    }),
    prisma.personnel.upsert({
      where: { personnel_id: 4 },
      update: {},
      create: {
        personnel_id: 4,
        name: 'Алексей Алексеев',
        position_id: 4,
        license_number: 'LIC-004',
        hired_date: new Date('2023-04-01')
      },
    }),
    prisma.personnel.upsert({
      where: { personnel_id: 5 },
      update: {},
      create: {
        personnel_id: 5,
        name: 'Дмитрий Дмитриев',
        position_id: 5,
        license_number: 'LIC-005',
        hired_date: new Date('2024-05-01')
      },
    }),
  ]);
  console.log('Персонал создан');

  // Создаем пассажиров
  const passengers = await Promise.all([
    prisma.passenger.upsert({
      where: { passenger_id: 1 },
      update: {},
      create: {
        passenger_id: 1,
        name: 'Анна Смирнова',
        passport_number: '1234567890',
        nationality: 'Россия',
        birth_date: new Date('1990-01-01')
      },
    }),
    prisma.passenger.upsert({
      where: { passenger_id: 2 },
      update: {},
      create: {
        passenger_id: 2,
        name: 'Мария Кузнецова',
        passport_number: '2345678901',
        nationality: 'Россия',
        birth_date: new Date('1985-02-02')
      },
    }),
    prisma.passenger.upsert({
      where: { passenger_id: 3 },
      update: {},
      create: {
        passenger_id: 3,
        name: 'Елена Попова',
        passport_number: '3456789012',
        nationality: 'Россия',
        birth_date: new Date('1995-03-03')
      },
    }),
    prisma.passenger.upsert({
      where: { passenger_id: 4 },
      update: {},
      create: {
        passenger_id: 4,
        name: 'Ольга Васильева',
        passport_number: '4567890123',
        nationality: 'Россия',
        birth_date: new Date('2000-04-04')
      },
    }),
    prisma.passenger.upsert({
      where: { passenger_id: 5 },
      update: {},
      create: {
        passenger_id: 5,
        name: 'Татьяна Михайлова',
        passport_number: '5678901234',
        nationality: 'Россия',
        birth_date: new Date('1988-05-05')
      },
    }),
  ]);
  console.log('Пассажиры созданы');

  // Создаем рейсы
  const flights = await Promise.all([
    prisma.flight.upsert({
      where: { flight_id: 1 },
      update: {},
      create: {
        flight_id: 1,
        aircraft_id: 1,
        airline_id: 1,
        departure_airport_id: 1,
        arrival_airport_id: 2,
        scheduled_departure: new Date('2025-06-20T10:00:00Z'),
        scheduled_arrival: new Date('2025-06-20T11:30:00Z'),
        flight_number: 'SU-128',
        status: 'Scheduled'
      },
    }),
    prisma.flight.upsert({
      where: { flight_id: 2 },
      update: {},
      create: {
        flight_id: 2,
        aircraft_id: 2,
        airline_id: 2,
        departure_airport_id: 2,
        arrival_airport_id: 3,
        scheduled_departure: new Date('2025-06-21T14:00:00Z'),
        scheduled_arrival: new Date('2025-06-21T15:00:00Z'),
        flight_number: 'S7-456',
        status: 'Scheduled'
      },
    }),
    prisma.flight.upsert({
      where: { flight_id: 3 },
      update: {},
      create: {
        flight_id: 3,
        aircraft_id: 3,
        airline_id: 3,
        departure_airport_id: 3,
        arrival_airport_id: 4,
        scheduled_departure: new Date('2025-06-22T16:00:00Z'),
        scheduled_arrival: new Date('2025-06-22T18:00:00Z'),
        flight_number: 'U6-789',
        status: 'Scheduled'
      },
    }),
    prisma.flight.upsert({
      where: { flight_id: 4 },
      update: {},
      create: {
        flight_id: 4,
        aircraft_id: 4,
        airline_id: 4,
        departure_airport_id: 4,
        arrival_airport_id: 5,
        scheduled_departure: new Date('2025-06-23T19:00:00Z'),
        scheduled_arrival: new Date('2025-06-23T21:00:00Z'),
        flight_number: 'DP-321',
        status: 'Scheduled'
      },
    }),
    prisma.flight.upsert({
      where: { flight_id: 5 },
      update: {},
      create: {
        flight_id: 5,
        aircraft_id: 5,
        airline_id: 5,
        departure_airport_id: 5,
        arrival_airport_id: 1,
        scheduled_departure: new Date('2025-06-24T22:00:00Z'),
        scheduled_arrival: new Date('2025-06-25T00:00:00Z'),
        flight_number: 'WZ-654',
        status: 'Scheduled'
      },
    }),
  ]);
  console.log('Рейсы созданы');

  // Создаем билеты
  const tickets = await Promise.all([
    prisma.ticket.upsert({
      where: { ticket_id: 1 },
      update: {},
      create: {
        ticket_id: 1,
        passenger_id: 1,
        flight_id: 1,
        seat_number: '1A',
        ticket_price: 10000,
        baggage_included: true
      },
    }),
    prisma.ticket.upsert({
      where: { ticket_id: 2 },
      update: {},
      create: {
        ticket_id: 2,
        passenger_id: 2,
        flight_id: 2,
        seat_number: '2B',
        ticket_price: 12000,
        baggage_included: false
      },
    }),
    prisma.ticket.upsert({
      where: { ticket_id: 3 },
      update: {},
      create: {
        ticket_id: 3,
        passenger_id: 3,
        flight_id: 3,
        seat_number: '3C',
        ticket_price: 9000,
        baggage_included: true
      },
    }),
    prisma.ticket.upsert({
      where: { ticket_id: 4 },
      update: {},
      create: {
        ticket_id: 4,
        passenger_id: 4,
        flight_id: 4,
        seat_number: '4D',
        ticket_price: 15000,
        baggage_included: false
      },
    }),
    prisma.ticket.upsert({
      where: { ticket_id: 5 },
      update: {},
      create: {
        ticket_id: 5,
        passenger_id: 5,
        flight_id: 5,
        seat_number: '5E',
        ticket_price: 8000,
        baggage_included: true
      },
    }),
  ]);
  console.log('Билеты созданы');

  // Создаем экипажи и члены экипажа
  for (let i = 1; i <= 5; i++) {
    await prisma.crew.upsert({
      where: { crew_id: i },
      update: {},
      create: {
        crew_id: i,
        flight_id: i
      },
    });
    await prisma.crew_Member.upsert({
      where: { crew_id_personnel_id: { crew_id: i, personnel_id: i } },
      update: {},
      create: {
        crew_id: i,
        personnel_id: i,
        role: 'Пилот'
      },
    });
  }
  console.log('Экипажи созданы');

  // Создаем инциденты
  for (let i = 1; i <= 5; i++) {
    await prisma.incident.upsert({
      where: { incident_id: i },
      update: {},
      create: {
        incident_id: i,
        flight_id: i,
        personnel_id: i,
        incident_time: new Date(`2025-06-2${i}T12:00:00Z`),
        description: `Инцидент №${i}`,
        severity: i % 2 === 0 ? 'High' : 'Medium',
      },
    });
  }
  console.log('Инциденты созданы');

  // Создаем техобслуживание
  for (let i = 1; i <= 5; i++) {
    await prisma.maintenance.upsert({
      where: { maintenance_id: i },
      update: {},
      create: {
        maintenance_id: i,
        aircraft_id: i,
        personnel_id: i,
        start_time: new Date(`2025-06-2${i}T08:00:00Z`),
        end_time: new Date(`2025-06-2${i}T10:00:00Z`),
        description: `Плановое обслуживание №${i}`,
      },
    });
  }
  console.log('Техобслуживание создано');

  // Создаем регистрации
  for (let i = 1; i <= 5; i++) {
    await prisma.checkin.upsert({
      where: { checkin_id: i },
      update: {},
      create: {
        checkin_id: i,
        ticket_id: i,
        checkin_time: new Date(`2025-06-2${i}T07:00:00Z`),
        baggage_count: 1,
      },
    });
  }
  console.log('Регистрации созданы');

  // Создаем багаж
  for (let i = 1; i <= 5; i++) {
    await prisma.baggage.upsert({
      where: { baggage_id: i },
      update: {},
      create: {
        baggage_id: i,
        checkin_id: i,
        weight_kg: 23.5,
        label_number: `BG${i}`,
      },
    });
  }
  console.log('Багаж создан');

  console.log('Все тестовые данные успешно созданы!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 