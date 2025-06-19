"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Passenger {
  passenger_id: number;
  name: string | null;
  passport_number: string | null;
  nationality: string | null;
  birth_date: string | null;
  tickets: Ticket[];
}

interface Ticket {
  ticket_id: number;
  passenger_id: number | null;
  flight_id: number | null;
  seat_number: string | null;
  ticket_price: number | null;
  baggage_included: boolean | null;
  flight: {
    flight_number: string | null;
    scheduled_departure: string | null;
    departureAirport: {
      name: string | null;
      city: string | null;
    } | null;
    arrivalAirport: {
      name: string | null;
      city: string | null;
    } | null;
  } | null;
}

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    name: '',
    passport_number: '',
    nationality: '',
    birth_date: ''
  });

  // Загрузка данных
  const fetchData = async () => {
    try {
      const response = await fetch('/api/passenger');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      setPassengers(data);
    } catch (err) {
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Создание пассажира
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/passenger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка создания');
      }

      await fetchData();
      setShowCreateForm(false);
      setFormData({ name: '', passport_number: '', nationality: '', birth_date: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление пассажира
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPassenger) return;

    try {
      const response = await fetch(`/api/passenger/${editingPassenger.passenger_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchData();
      setEditingPassenger(null);
      setFormData({ name: '', passport_number: '', nationality: '', birth_date: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление пассажира
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пассажира?')) return;

    try {
      const response = await fetch(`/api/passenger/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка удаления');
      }

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Начать редактирование
  const startEdit = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    setFormData({
      name: passenger.name || '',
      passport_number: passenger.passport_number || '',
      nationality: passenger.nationality || '',
      birth_date: passenger.birth_date ? passenger.birth_date.split('T')[0] : ''
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingPassenger(null);
    setShowCreateForm(false);
    setFormData({ name: '', passport_number: '', nationality: '', birth_date: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin"
            className="bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition-colors"
          >
            ← Назад
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Управление пассажирами</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          + Добавить пассажира
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingPassenger) && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingPassenger ? 'Редактировать пассажира' : 'Добавить нового пассажира'}
          </h2>
          <form onSubmit={editingPassenger ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ФИО *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер паспорта *
                </label>
                <input
                  type="text"
                  value={formData.passport_number}
                  onChange={(e) => setFormData({...formData, passport_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Гражданство
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата рождения
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {editingPassenger ? 'Обновить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица пассажиров */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ФИО
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Паспорт
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Гражданство
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата рождения
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Билеты
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {passengers.map((passenger) => (
              <tr key={passenger.passenger_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {passenger.passenger_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {passenger.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {passenger.passport_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {passenger.nationality || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {passenger.birth_date ? new Date(passenger.birth_date).toLocaleDateString('ru-RU') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {passenger.tickets.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(passenger)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(passenger.passenger_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {passengers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Пассажиры не найдены
          </div>
        )}
      </div>
    </div>
  );
} 