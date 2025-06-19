import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FlightsPage() {
  // Проверяем авторизацию
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Получаем рейсы с информацией об авиакомпаниях и аэропортах
  const flights = await prisma.flight.findMany({
    orderBy: { scheduled_departure: "asc" },
    include: {
      airline: true,
      departureAirport: true,
      arrivalAirport: true,
      aircraft: {
        include: {
          aircraft_type: true
        }
      }
    },
    where: {
      scheduled_departure: {
        gte: new Date()
      }
    }
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Delayed': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'По расписанию';
      case 'Delayed': return 'Задержан';
      case 'Cancelled': return 'Отменен';
      case 'Completed': return 'Завершен';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Расписание рейсов</h1>
            <p className="text-gray-600 mt-1">Актуальное расписание вылетов и прилетов</p>
          </div>
          <Link 
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Назад в дэшборд
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ближайшие рейсы ({flights.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Рейс
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Авиакомпания
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Откуда
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Куда
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Вылет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Прилет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Воздушное судно
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flights.map((flight) => (
                  <tr key={flight.flight_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {flight.flight_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {flight.airline?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {flight.airline?.iata_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {flight.departureAirport?.city}
                      </div>
                      <div className="text-sm text-gray-500">
                        {flight.departureAirport?.iata_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {flight.arrivalAirport?.city}
                      </div>
                      <div className="text-sm text-gray-500">
                        {flight.arrivalAirport?.iata_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(flight.scheduled_departure)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(flight.scheduled_arrival)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(flight.status)}`}>
                        {getStatusText(flight.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {flight.aircraft?.tail_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {flight.aircraft?.aircraft_type?.model}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {flights.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Нет запланированных рейсов</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 