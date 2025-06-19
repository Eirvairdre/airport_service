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

export default function AircraftTypePage() {
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAircraftType, setEditingAircraftType] = useState<AircraftType | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    model: '',
    manufacturer: '',
    seats: '',
    max_range_km: ''
  });

  // Загрузка данных
  const fetchData = async () => {
    try {
      const response = await fetch('/api/aircraft-type');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      setAircraftTypes(data);
    } catch (err) {
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Создание типа воздушного судна
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/aircraft-type', {
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
      setFormData({ model: '', manufacturer: '', seats: '', max_range_km: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление типа воздушного судна
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAircraftType) return;

    try {
      const response = await fetch(`/api/aircraft-type/${editingAircraftType.aircraft_type_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchData();
      setEditingAircraftType(null);
      setFormData({ model: '', manufacturer: '', seats: '', max_range_km: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление типа воздушного судна
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот тип воздушного судна?')) return;

    try {
      const response = await fetch(`/api/aircraft-type/${id}`, {
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
  const startEdit = (aircraftType: AircraftType) => {
    setEditingAircraftType(aircraftType);
    setFormData({
      model: aircraftType.model || '',
      manufacturer: aircraftType.manufacturer || '',
      seats: aircraftType.seats?.toString() || '',
      max_range_km: aircraftType.max_range_km?.toString() || ''
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingAircraftType(null);
    setShowCreateForm(false);
    setFormData({ model: '', manufacturer: '', seats: '', max_range_km: '' });
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
          <h1 className="text-3xl font-bold text-gray-900">Управление типами воздушных судов</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          + Добавить тип
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingAircraftType) && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingAircraftType ? 'Редактировать тип воздушного судна' : 'Добавить новый тип'}
          </h2>
          <form onSubmit={editingAircraftType ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Производитель *
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Модель *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество мест
                </label>
                <input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({...formData, seats: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимальная дальность (км)
                </label>
                <input
                  type="number"
                  value={formData.max_range_km}
                  onChange={(e) => setFormData({...formData, max_range_km: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {editingAircraftType ? 'Обновить' : 'Создать'}
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

      {/* Таблица типов воздушных судов */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Производитель
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Модель
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Мест
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дальность (км)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {aircraftTypes.map((aircraftType) => (
              <tr key={aircraftType.aircraft_type_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {aircraftType.aircraft_type_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {aircraftType.manufacturer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {aircraftType.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {aircraftType.seats || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {aircraftType.max_range_km || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(aircraftType)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(aircraftType.aircraft_type_id)}
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
        {aircraftTypes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Типы воздушных судов не найдены
          </div>
        )}
      </div>
    </div>
  );
} 