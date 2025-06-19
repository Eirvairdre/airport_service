"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Airline {
  airline_id: number;
  name: string | null;
  iata_code: string | null;
  country: string | null;
}

export default function AirlinesPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    name: '',
    iata_code: '',
    country: ''
  });

  // Загрузка авиакомпаний
  const fetchAirlines = async () => {
    try {
      const response = await fetch('/api/airline');
      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      setAirlines(data);
    } catch (err) {
      setError('Ошибка при загрузке авиакомпаний');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirlines();
  }, []);

  // Создание авиакомпании
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/airline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка создания');
      }

      await fetchAirlines();
      setShowCreateForm(false);
      setFormData({ name: '', iata_code: '', country: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление авиакомпании
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAirline) return;

    try {
      const response = await fetch(`/api/airline/${editingAirline.airline_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchAirlines();
      setEditingAirline(null);
      setFormData({ name: '', iata_code: '', country: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление авиакомпании
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту авиакомпанию?')) return;

    try {
      const response = await fetch(`/api/airline/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка удаления');
      }

      await fetchAirlines();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Начать редактирование
  const startEdit = (airline: Airline) => {
    setEditingAirline(airline);
    setFormData({
      name: airline.name || '',
      iata_code: airline.iata_code || '',
      country: airline.country || ''
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingAirline(null);
    setShowCreateForm(false);
    setFormData({ name: '', iata_code: '', country: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка авиакомпаний...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Управление авиакомпаниями</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          + Добавить авиакомпанию
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingAirline) && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingAirline ? 'Редактировать авиакомпанию' : 'Добавить новую авиакомпанию'}
          </h2>
          <form onSubmit={editingAirline ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
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
                  IATA код *
                </label>
                <input
                  type="text"
                  value={formData.iata_code}
                  onChange={(e) => setFormData({...formData, iata_code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Страна *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {editingAirline ? 'Обновить' : 'Создать'}
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

      {/* Таблица авиакомпаний */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IATA код
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Страна
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {airlines.map((airline) => (
              <tr key={airline.airline_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {airline.airline_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {airline.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {airline.iata_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {airline.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(airline)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(airline.airline_id)}
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
        {airlines.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Авиакомпании не найдены
          </div>
        )}
      </div>
    </div>
  );
} 