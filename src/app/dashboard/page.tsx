import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import DashboardCharts from "@/components/DashboardCharts";
import HorizontalWidgets from "@/components/HorizontalWidgets";
import FlightCountryPieChart from "@/components/FlightCountryPieChart";
import RealTimeStats from "@/components/RealTimeStats";
import DashboardAlerts from "@/components/DashboardAlerts";
import QuickActions from "@/components/QuickActions";
import DashboardAdminButton from "./DashboardAdminButton";
import LogoutButton from "./LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TopAirportsBarChart from "@/components/TopAirportsBarChart";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default async function DashboardPage() {
  // Проверяю, что пользователь залогинен
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  const isAdmin = session.user?.role === 'admin';

  // Собираю общую статистику по всем таблицам
  const [flights, airlines, airports, passengers, personnel, incidents, maintenance, tickets, crews, checkins] = await Promise.all([
    prisma.flight.count(),
    prisma.airline.count(),
    prisma.airport.count(),
    prisma.passenger.count(),
    prisma.personnel.count(),
    prisma.incident.count(),
    prisma.maintenance.count(),
    prisma.ticket.count(),
    prisma.crew.count(),
    prisma.checkin.count(),
  ]);

  // Ближайшие рейсы - показываю только те, что еще не вылетели
  const nearestFlights = await prisma.flight.findMany({
    orderBy: { scheduled_departure: "asc" },
    take: 5,
    include: { 
      airline: true, 
      departureAirport: true, 
      arrivalAirport: true 
    },
    where: { 
      scheduled_departure: { 
        gte: new Date() 
      } 
    },
  });

  // Последние инциденты - самые свежие проблемы
  const lastIncidents = await prisma.incident.findMany({
    orderBy: { incident_time: "desc" },
    take: 5,
    include: { 
      flight: { 
        include: { 
          airline: true,
          departureAirport: true,
          arrivalAirport: true
        } 
      }, 
      personnel: true 
    },
  });

  // Самолеты, которые сейчас на техобслуживании
  const needMaintenance = await prisma.maintenance.findMany({
    where: { end_time: null },
    include: { 
      aircraft: { 
        include: { 
          airline: true,
          aircraft_type: true
        } 
      }, 
      personnel: true 
    },
    take: 5,
  });

  // Последние регистрации пассажиров
  const recentCheckins = await prisma.checkin.findMany({
    orderBy: { checkin_time: "desc" },
    take: 5,
    include: {
      ticket: {
        include: {
          passenger: true,
          flight: {
            include: {
              airline: true,
              departureAirport: true,
              arrivalAirport: true
            }
          }
        }
      }
    }
  });

  // Функция для конвертации данных в JSON - нужно для передачи в компоненты
  const serializeData = (data: any): any => {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.error('Error serializing data:', error);
      return data;
    }
  };

  // Подготавливаю данные для передачи в компоненты
  const serializedRecentCheckins = serializeData(recentCheckins);
  const serializedNearestFlights = serializeData(nearestFlights);
  const serializedLastIncidents = serializeData(lastIncidents);
  const serializedNeedMaintenance = serializeData(needMaintenance);

  // Считаю статистику по статусам рейсов для круговой диаграммы
  const flightStatusCounts = await prisma.flight.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  const statusLabels = ["Scheduled", "Delayed", "Cancelled", "Completed"];
  const statusColors = ["#3b82f6", "#f59e42", "#ef4444", "#22c55e"];
  const statusData = statusLabels.map(
    (s: string) => flightStatusCounts.find((f: any) => f.status === s)?._count.status || 0
  );

  // Считаю статистику по уровням инцидентов
  const incidentSeverityCounts = await prisma.incident.groupBy({
    by: ["severity"],
    _count: { severity: true },
  });
  const severityLabels = ["Low", "Medium", "High", "Critical"];
  const severityColors = ["#22c55e", "#facc15", "#f97316", "#ef4444"];
  const severityData = severityLabels.map(
    (s: string) => incidentSeverityCounts.find((i: any) => i.severity === s)?._count.severity || 0
  );

  // Массив статистик для виджетов
  const stats = [
    { label: "Рейсы", value: flights, href: "/admin/flights", color: "blue", adminOnly: true },
    { label: "Авиакомпании", value: airlines, href: "/admin/airlines", color: "green", adminOnly: true },
    { label: "Аэропорты", value: airports, href: "/admin/airports", color: "purple", adminOnly: true },
    { label: "Пассажиры", value: passengers, href: "/admin/passengers", color: "orange", adminOnly: true },
    { label: "Билеты", value: tickets, href: "/admin/tickets", color: "red", adminOnly: true },
    { label: "Персонал", value: personnel, href: "/admin/personnel", color: "indigo", adminOnly: true },
    { label: "Экипажи", value: crews, href: "/admin/crews", color: "pink", adminOnly: true },
    { label: "Регистрации", value: checkins, href: "/admin/checkins", color: "teal", adminOnly: true },
  ];

  // --- ДАННЫЕ ДЛЯ ДИАГРАММЫ ПО СТРАНАМ ---
  // Получаю список всех стран из аэропортов
  const countryRows = await prisma.airport.findMany({ 
    select: { country: true }, 
    distinct: ["country"] 
  });
  const countries = countryRows.map((r: any) => r.country).filter(Boolean);
  
  // Считаю вылеты и прилеты по каждой стране
  const countryData: Record<string, { departures: number; arrivals: number }> = {};
  for (const country of countries) {
    // Найти все аэропорты этой страны
    const airports = await prisma.airport.findMany({ where: { country } });
    const airportIds = airports.map((a: any) => a.airport_id);
    // Вылеты: рейсы, где departure_airport_id — один из этих аэропортов
    const departures = await prisma.flight.count({ 
      where: { departure_airport_id: { in: airportIds } } 
    });
    // Прилеты: рейсы, где arrival_airport_id — один из этих аэропортов
    const arrivals = await prisma.flight.count({ 
      where: { arrival_airport_id: { in: airportIds } } 
    });
    countryData[country] = { departures, arrivals };
  }

  // --- ТОП-5 АЭРОПОРТОВ ПО ПАССАЖИРАМ ---
  // Группирую билеты по рейсам, чтобы потом посчитать по аэропортам
  const ticketsByAirport = await prisma.ticket.groupBy({
    by: ["flight_id"],
    _count: { flight_id: true },
  });
  // Получаю flight_id -> departure_airport_id
  const flightsForTop = await prisma.flight.findMany({
    select: { flight_id: true, departure_airport_id: true },
  });
  const airportPassengerMap: Record<number, number> = {};
  for (const t of ticketsByAirport) {
    const flight = flightsForTop.find((f: { flight_id: number; departure_airport_id: number | null }) => f.flight_id === t.flight_id);
    if (flight && flight.departure_airport_id) {
      airportPassengerMap[flight.departure_airport_id] = (airportPassengerMap[flight.departure_airport_id] || 0) + t._count.flight_id;
    }
  }
  // Сортируем и берём топ-5
  const topAirports = Object.entries(airportPassengerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  // Получаем имена аэропортов
  const airportIds = topAirports.map(([id]) => Number(id));
  const airportNames = await prisma.airport.findMany({
    where: { airport_id: { in: airportIds } },
    select: { airport_id: true, name: true },
  });
  const airportIdToName: Record<number, string> = {};
  for (const a of airportNames) {
    airportIdToName[a.airport_id] = a.name || `ID ${a.airport_id}`;
  }
  const topAirportsData = topAirports.map(([id, count]) => ({
    name: airportIdToName[Number(id)] || `ID ${id}`,
    count: count as number,
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Дэшборд аэропорта</h1>
          {session && (
            <p className="text-sm text-gray-600 mt-1">
              Пользователь: {session.user?.name || session.user?.email} 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdmin ? 'Администратор' : 'Пользователь'}
              </span>
            </p>
          )}
        </div>
        <LogoutButton />
      </div>
      
      {/* Алерты и уведомления */}
      <DashboardAlerts 
        incidents={serializedLastIncidents}
        maintenance={serializedNeedMaintenance}
        flights={serializedNearestFlights}
      />
      
      {/* Быстрые действия - разные для админов и обычных пользователей */}
      <QuickActions isAdmin={isAdmin} />
      
      {/* Виджеты с прокруткой */}
      <HorizontalWidgets
        nearestFlights={serializedNearestFlights}
        lastIncidents={serializedLastIncidents}
        needMaintenance={serializedNeedMaintenance}
        recentCheckins={serializedRecentCheckins}
      />
      
      {/* Плитки разделов - только административные функции для админов */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Link 
              key={s.label} 
              href={s.href} 
              className={`block bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-l-4 border-${s.color}-500`}
            >
              <div className={`text-3xl font-bold text-${s.color}-600 mb-2`}>{s.value}</div>
              <div className="text-gray-700 text-sm font-medium">{s.label}</div>
            </Link>
          ))}
          <DashboardAdminButton />
        </div>
      )}
      
      {/* Графики */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <DashboardCharts
          statusData={statusData}
          statusColors={statusColors}
          severityData={severityData}
          severityColors={severityColors}
        />
        <div className="flex flex-col gap-4">
          <FlightCountryPieChart countries={countries} data={countryData} />
          <TopAirportsBarChart data={topAirportsData} />
        </div>
      </div>
      
      {/* Статистика в реальном времени */}
      <RealTimeStats 
        nearestFlights={serializedNearestFlights}
        lastIncidents={serializedLastIncidents}
        needMaintenance={serializedNeedMaintenance}
      />
    </div>
  );
} 