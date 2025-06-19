import LogoutButton from "../dashboard/LogoutButton";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            ← Дэшборд
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
        </div>
        <LogoutButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Управление аэропортами */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Аэропорты</h2>
          <p className="text-gray-600 mb-4">Управление аэропортами, терминалами и стоянками</p>
          <Link 
            href="/admin/airports"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Управлять аэропортами
          </Link>
        </div>

        {/* Управление авиакомпаниями */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Авиакомпании</h2>
          <p className="text-gray-600 mb-4">Управление авиакомпаниями и их данными</p>
          <Link 
            href="/admin/airlines"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Управлять авиакомпаниями
          </Link>
        </div>

        {/* Управление рейсами */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Рейсы</h2>
          <p className="text-gray-600 mb-4">Управление рейсами и расписанием</p>
          <Link 
            href="/admin/flights"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Управлять рейсами
          </Link>
        </div>

        {/* Управление самолетами */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Воздушные суда</h2>
          <p className="text-gray-600 mb-4">Управление самолетами и их типами</p>
          <Link 
            href="/admin/aircraft"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Управлять самолетами
          </Link>
        </div>

        {/* Управление типами воздушных судов */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Типы воздушных судов</h2>
          <p className="text-gray-600 mb-4">Управление типами и моделями самолетов</p>
          <Link 
            href="/admin/aircraft-type"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Управлять типами
          </Link>
        </div>

        {/* Управление пассажирами */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Пассажиры</h2>
          <p className="text-gray-600 mb-4">Управление пассажирами и билетами</p>
          <Link 
            href="/admin/passengers"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Управлять пассажирами
          </Link>
        </div>

        {/* Управление билетами */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Билеты</h2>
          <p className="text-gray-600 mb-4">Управление билетами и бронированиями</p>
          <Link 
            href="/admin/tickets"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
          >
            Управлять билетами
          </Link>
        </div>

        {/* Управление персоналом */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Персонал</h2>
          <p className="text-gray-600 mb-4">Управление персоналом и экипажами</p>
          <div className="flex gap-2">
            <Link 
              href="/admin/personnel"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
            >
              Управлять персоналом
            </Link>
            <Link 
              href="/admin/crews"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors inline-block"
            >
              Управлять экипажами
            </Link>
          </div>
        </div>

        {/* Управление регистрацией */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Регистрация на рейсы</h2>
          <p className="text-gray-600 mb-4">Управление регистрацией пассажиров и багажом</p>
          <Link 
            href="/admin/checkins"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors inline-block"
          >
            Управлять регистрацией
          </Link>
        </div>

        {/* Управление пользователями */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Пользователи системы</h2>
          <p className="text-gray-600 mb-4">Управление пользователями и их ролями</p>
          <Link 
            href="/admin/users"
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors inline-block"
          >
            Управлять пользователями
          </Link>
        </div>
      </div>
    </div>
  );
} 