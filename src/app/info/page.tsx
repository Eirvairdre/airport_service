import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InfoPage() {
  // Проверяем авторизацию
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Получаем статистику аэропорта
  const [totalFlights, totalAirlines, totalAirports, totalPassengers] = await Promise.all([
    prisma.flight.count(),
    prisma.airline.count(),
    prisma.airport.count(),
    prisma.passenger.count(),
  ]);

  // Получаем популярные направления
  const popularRoutes = await prisma.flight.groupBy({
    by: ['departure_airport_id', 'arrival_airport_id'],
    _count: {
      flight_id: true
    },
    orderBy: {
      _count: {
        flight_id: 'desc'
      }
    },
    take: 5
  });

  // Получаем информацию об аэропортах для популярных маршрутов
  const routeDetails = await Promise.all(
    popularRoutes.map(async (route: any) => {
      const [departure, arrival] = await Promise.all([
        prisma.airport.findUnique({ where: { airport_id: route.departure_airport_id } }),
        prisma.airport.findUnique({ where: { airport_id: route.arrival_airport_id } })
      ]);
      return {
        ...route,
        departure,
        arrival
      };
    })
  );

  // Функция для полной сериализации данных (включая Decimal объекты)
  const serializeData = (data: any): any => {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.error('Error serializing data:', error);
      return data;
    }
  };

  // Сериализуем данные маршрутов
  const serializedRouteDetails = serializeData(routeDetails);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Информация об аэропорте</h1>
            <p className="text-gray-600 mt-1">Общая информация и статистика</p>
          </div>
          <Link 
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Назад в дэшборд
          </Link>
        </div>

        {/* Основная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalFlights}</div>
            <div className="text-gray-700 text-sm font-medium">Всего рейсов</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{totalAirlines}</div>
            <div className="text-gray-700 text-sm font-medium">Авиакомпаний</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{totalAirports}</div>
            <div className="text-gray-700 text-sm font-medium">Аэропортов</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{totalPassengers}</div>
            <div className="text-gray-700 text-sm font-medium">Пассажиров</div>
          </div>
        </div>

        {/* Популярные маршруты */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Популярные маршруты
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Маршрут
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Откуда
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Куда
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Количество рейсов
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serializedRouteDetails.map((route: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {route.departure?.iata_code} → {route.arrival?.iata_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {route.departure?.city}, {route.departure?.country}
                      </div>
                      <div className="text-sm text-gray-500">
                        {route.departure?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {route.arrival?.city}, {route.arrival?.country}
                      </div>
                      <div className="text-sm text-gray-500">
                        {route.arrival?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {route._count.flight_id} рейсов
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Полезная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Контакты */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Контактная информация
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-900">Телефон справочной</div>
                <div className="text-sm text-gray-600">+7 (495) 123-45-67</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Email</div>
                <div className="text-sm text-gray-600">info@airport.ru</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Адрес</div>
                <div className="text-sm text-gray-600">г. Москва, ул. Аэропортная, д. 1</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Время работы</div>
                <div className="text-sm text-gray-600">Круглосуточно</div>
              </div>
            </div>
          </div>

          {/* Услуги */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Услуги аэропорта
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Регистрация на рейс</li>
              <li>• Сдача и получение багажа</li>
              <li>• Таможенный контроль</li>
              <li>• Паспортный контроль</li>
              <li>• VIP-залы ожидания</li>
              <li>• Рестораны и кафе</li>
              <li>• Магазины дьюти-фри</li>
              <li>• Парковка</li>
              <li>• Такси и трансфер</li>
              <li>• Медицинская помощь</li>
            </ul>
          </div>
        </div>

        {/* Правила безопасности */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-4">
            Правила безопасности
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Что можно брать в ручную кладь:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Жидкости до 100 мл в прозрачной упаковке</li>
                <li>• Электронные устройства</li>
                <li>• Документы и деньги</li>
                <li>• Лекарства (с рецептом)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Что запрещено:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Оружие и боеприпасы</li>
                <li>• Взрывчатые вещества</li>
                <li>• Легковоспламеняющиеся жидкости</li>
                <li>• Токсичные вещества</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 