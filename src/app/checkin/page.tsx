import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CheckinPage() {
  // Проверяем авторизацию
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Получаем билеты, которые можно зарегистрировать
  const tickets = await prisma.ticket.findMany({
    where: {
      checkins: {
        none: {} // Только билеты без регистраций
      },
      flight: {
        scheduled_departure: {
          gte: new Date() // Только будущие рейсы
        }
      }
    },
    include: {
      passenger: true,
      flight: {
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true,
          aircraft: {
            include: {
              aircraft_type: true
            }
          }
        }
      }
    },
    orderBy: {
      flight: {
        scheduled_departure: 'asc'
      }
    },
    take: 20
  });

  // Функция для полной сериализации данных (включая Decimal объекты)
  const serializeData = (data: any): any => {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.error('Error serializing data:', error);
      return data;
    }
  };

  // Сериализуем билеты
  const serializedTickets = serializeData(tickets);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(Number(price));
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
            <h1 className="text-3xl font-bold text-gray-900">Регистрация на рейс</h1>
            <p className="text-gray-600 mt-1">Выберите билет для регистрации</p>
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
              Доступные для регистрации билеты ({serializedTickets.length})
            </h2>
          </div>
          
          {serializedTickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Нет билетов, доступных для регистрации</p>
              <p className="text-sm text-gray-400">
                Регистрация открывается за 24 часа до вылета
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Билет
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Пассажир
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Рейс
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Маршрут
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Вылет
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Место
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действие
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {serializedTickets.map((ticket: any) => (
                    <tr key={ticket.ticket_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{ticket.ticket_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.passenger?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.passenger?.passport_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.flight?.flight_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.flight?.airline?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.flight?.departureAirport?.iata_code} → {ticket.flight?.arrivalAirport?.iata_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.flight?.departureAirport?.city} → {ticket.flight?.arrivalAirport?.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(ticket.flight?.scheduled_departure)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.seat_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.flight?.status)}`}>
                          {getStatusText(ticket.flight?.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/checkins?ticket_id=${ticket.ticket_id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Зарегистрироваться
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Информация о регистрации */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Информация о регистрации
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Регистрация открывается за 24 часа до вылета</li>
            <li>• Закрывается за 40 минут до вылета</li>
            <li>• При регистрации вы можете указать количество багажа</li>
            <li>• После регистрации вы получите посадочный талон</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 