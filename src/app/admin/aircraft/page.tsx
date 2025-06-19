"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AircraftType {
  aircraft_type_id: number;
  model: string | null;
  manufacturer: string | null;
  seats: number | null;
  max_range_km: number | null;
}

interface Airline {
  airline_id: number;
  name: string | null;
  iata_code: string | null;
  country: string | null;
}

interface Aircraft {
  aircraft_id: number;
  aircraft_type_id: number | null;
  tail_number: string | null;
  airline_id: number | null;
  aircraft_type: AircraftType | null;
  airline: Airline | null;
}

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    aircraft_type_id: '',
    tail_number: '',
    airline_id: ''
  });

  // Загрузка данных
  const fetchData = async () => {
    try {
      const [aircraftRes, typesRes, airlinesRes] = await Promise.all([
        fetch('/api/aircraft'),
        fetch('/api/aircraft-type'),
        fetch('/api/airline')
      ]);

      if (!aircraftRes.ok || !typesRes.ok || !airlinesRes.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const [aircraftData, typesData, airlinesData] = await Promise.all([
        aircraftRes.json(),
        typesRes.json(),
        airlinesRes.json()
      ]);

      setAircraft(aircraftData);
      setAircraftTypes(typesData);
      setAirlines(airlinesData);
    } catch (err) {
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Создание воздушного судна
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/aircraft', {
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
      setFormData({ aircraft_type_id: '', tail_number: '', airline_id: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление воздушного судна
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAircraft) return;

    try {
      const response = await fetch(`/api/aircraft/${editingAircraft.aircraft_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchData();
      setEditingAircraft(null);
      setFormData({ aircraft_type_id: '', tail_number: '', airline_id: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление воздушного судна
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это воздушное судно?')) return;

    try {
      const response = await fetch(`/api/aircraft/${id}`, {
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
  const startEdit = (aircraftItem: Aircraft) => {
    setEditingAircraft(aircraftItem);
    setFormData({
      aircraft_type_id: aircraftItem.aircraft_type_id?.toString() || '',
      tail_number: aircraftItem.tail_number || '',
      airline_id: aircraftItem.airline_id?.toString() || ''
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingAircraft(null);
    setShowCreateForm(false);
    setFormData({ aircraft_type_id: '', tail_number: '', airline_id: '' });
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
          <h1 className="text-3xl font-bold text-gray-900">Управление воздушными судами</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          + Добавить воздушное судно
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingAircraft) && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingAircraft ? 'Редактировать воздушное судно' : 'Добавить новое воздушное судно'}
          </h2>
          <form onSubmit={editingAircraft ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер борта *
                </label>
                <input
                  type="text"
                  value={formData.tail_number}
                  onChange={(e) => setFormData({...formData, tail_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип воздушного судна
                </label>
                <select
                  value={formData.aircraft_type_id}
                  onChange={(e) => setFormData({...formData, aircraft_type_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип</option>
                  {aircraftTypes.map((type) => (
                    <option key={type.aircraft_type_id} value={type.aircraft_type_id}>
                      {type.manufacturer} {type.model} ({type.seats} мест)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Авиакомпания
                </label>
                <select
                  value={formData.airline_id}
                  onChange={(e) => setFormData({...formData, airline_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите авиакомпанию</option>
                  {airlines.map((airline) => (
                    <option key={airline.airline_id} value={airline.airline_id}>
                      {airline.name} ({airline.iata_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {editingAircraft ? 'Обновить' : 'Создать'}
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

      {/* Таблица воздушных судов */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Номер борта
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Авиакомпания
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {aircraft.map((aircraftItem) => (
              <tr key={aircraftItem.aircraft_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {aircraftItem.aircraft_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {aircraftItem.tail_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {aircraftItem.aircraft_type 
                    ? `${aircraftItem.aircraft_type.manufacturer} ${aircraftItem.aircraft_type.model}`
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {aircraftItem.airline 
                    ? `${aircraftItem.airline.name} (${aircraftItem.airline.iata_code})`
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(aircraftItem)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(aircraftItem.aircraft_id)}
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
        {aircraft.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Воздушные суда не найдены
          </div>
        )}
      </div>
    </div>
  );
} 