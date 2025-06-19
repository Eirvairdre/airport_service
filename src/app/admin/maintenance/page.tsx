"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Aircraft {
  aircraft_id: number;
  tail_number: string | null;
  aircraft_type: {
    model: string | null;
    manufacturer: string | null;
  } | null;
}

interface Personnel {
  personnel_id: number;
  name: string | null;
  position_id: number | null;
}

interface Maintenance {
  maintenance_id: number;
  aircraft_id: number | null;
  personnel_id: number | null;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  aircraft: Aircraft | null;
  personnel: Personnel | null;
}

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    aircraft_id: '',
    personnel_id: '',
    start_time_date: '',
    start_time_time: '',
    end_time_date: '',
    end_time_time: '',
    description: ''
  });

  // Загрузка данных
  const fetchData = async () => {
    try {
      const [maintenanceRes, aircraftRes, personnelRes] = await Promise.all([
        fetch('/api/maintenance'),
        fetch('/api/aircraft'),
        fetch('/api/personnel')
      ]);

      if (!maintenanceRes.ok || !aircraftRes.ok || !personnelRes.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const [maintenanceData, aircraftData, personnelData] = await Promise.all([
        maintenanceRes.json(),
        aircraftRes.json(),
        personnelRes.json()
      ]);

      setMaintenance(maintenanceData);
      setAircraft(aircraftData);
      setPersonnel(personnelData);
    } catch (err) {
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Создание записи обслуживания
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aircraft_id) {
      setError('Выбор воздушного судна обязателен');
      return;
    }
    if (!formData.personnel_id) {
      setError('Выбор персонала обязателен');
      return;
    }
    if (!formData.start_time_date || !formData.start_time_time) {
      setError('Время начала обслуживания обязательно');
      return;
    }
    if (!formData.description.trim()) {
      setError('Описание обслуживания обязательно');
      return;
    }

    try {
      const startTime = new Date(`${formData.start_time_date}T${formData.start_time_time}`);
      const endTime = formData.end_time_date && formData.end_time_time ? 
        new Date(`${formData.end_time_date}T${formData.end_time_time}`) : null;

      if (endTime && startTime >= endTime) {
        setError('Время окончания должно быть позже времени начала');
        return;
      }

      const dataToSend = {
        aircraft_id: parseInt(formData.aircraft_id),
        personnel_id: parseInt(formData.personnel_id),
        start_time: startTime.toISOString(),
        end_time: endTime?.toISOString() || null,
        description: formData.description.trim()
      };

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка создания');
      }

      await fetchData();
      setShowCreateForm(false);
      setFormData({
        aircraft_id: '',
        personnel_id: '',
        start_time_date: '',
        start_time_time: '',
        end_time_date: '',
        end_time_time: '',
        description: ''
      });
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление записи обслуживания
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaintenance) return;

    try {
      const startTime = new Date(`${formData.start_time_date}T${formData.start_time_time}`);
      const endTime = formData.end_time_date && formData.end_time_time ? 
        new Date(`${formData.end_time_date}T${formData.end_time_time}`) : null;

      if (endTime && startTime >= endTime) {
        setError('Время окончания должно быть позже времени начала');
        return;
      }

      const dataToSend = {
        aircraft_id: parseInt(formData.aircraft_id),
        personnel_id: parseInt(formData.personnel_id),
        start_time: startTime.toISOString(),
        end_time: endTime?.toISOString() || null,
        description: formData.description.trim()
      };

      const response = await fetch(`/api/maintenance/${editingMaintenance.maintenance_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchData();
      setEditingMaintenance(null);
      setFormData({
        aircraft_id: '',
        personnel_id: '',
        start_time_date: '',
        start_time_time: '',
        end_time_date: '',
        end_time_time: '',
        description: ''
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление записи обслуживания
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись обслуживания?')) return;

    try {
      const response = await fetch(`/api/maintenance/${id}`, {
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

  // Завершить обслуживание
  const handleComplete = async (id: number) => {
    try {
      const now = new Date();
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          end_time: now.toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка завершения');
      }

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Начать редактирование
  const startEdit = (maintenance: Maintenance) => {
    setEditingMaintenance(maintenance);
    setFormData({
      aircraft_id: maintenance.aircraft_id?.toString() || '',
      personnel_id: maintenance.personnel_id?.toString() || '',
      start_time_date: maintenance.start_time ? maintenance.start_time.split('T')[0] : '',
      start_time_time: maintenance.start_time ? maintenance.start_time.split('T')[1].substring(0, 5) : '',
      end_time_date: maintenance.end_time ? maintenance.end_time.split('T')[0] : '',
      end_time_time: maintenance.end_time ? maintenance.end_time.split('T')[1].substring(0, 5) : '',
      description: maintenance.description || ''
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingMaintenance(null);
    setShowCreateForm(false);
    setFormData({
      aircraft_id: '',
      personnel_id: '',
      start_time_date: '',
      start_time_time: '',
      end_time_date: '',
      end_time_time: '',
      description: ''
    });
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return 'Не указано';
    return new Date(date).toLocaleString('ru-RU');
  };

  const getStatusColor = (endTime: string | null) => {
    return endTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusLabel = (endTime: string | null) => {
    return endTime ? 'Завершено' : 'В процессе';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка обслуживания...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin"
              className="bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              ← Назад
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Управление обслуживанием</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + Назначить обслуживание
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Форма создания/редактирования */}
        {(showCreateForm || editingMaintenance) && (
          <div className="bg-white rounded shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingMaintenance ? 'Редактировать обслуживание' : 'Назначить новое обслуживание'}
            </h2>
            <form onSubmit={editingMaintenance ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Воздушное судно *
                  </label>
                  <select
                    value={formData.aircraft_id}
                    onChange={(e) => setFormData({...formData, aircraft_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите воздушное судно</option>
                    {aircraft.map((aircraftItem) => (
                      <option key={aircraftItem.aircraft_id} value={aircraftItem.aircraft_id}>
                        {aircraftItem.tail_number} - {aircraftItem.aircraft_type?.manufacturer} {aircraftItem.aircraft_type?.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Персонал *
                  </label>
                  <select
                    value={formData.personnel_id}
                    onChange={(e) => setFormData({...formData, personnel_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите персонал</option>
                    {personnel.map((person) => (
                      <option key={person.personnel_id} value={person.personnel_id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время начала *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time_date && formData.start_time_time ? 
                      `${formData.start_time_date}T${formData.start_time_time}` : ''}
                    onChange={(e) => {
                      const [date, time] = e.target.value.split('T');
                      setFormData({
                        ...formData, 
                        start_time_date: date || '', 
                        start_time_time: time || ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время окончания
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time_date && formData.end_time_time ? 
                      `${formData.end_time_date}T${formData.end_time_time}` : ''}
                    onChange={(e) => {
                      const [date, time] = e.target.value.split('T');
                      setFormData({
                        ...formData, 
                        end_time_date: date || '', 
                        end_time_time: time || ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание обслуживания *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Опишите тип обслуживания, работы, которые необходимо выполнить..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {editingMaintenance ? 'Обновить' : 'Создать'}
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

        {/* Список обслуживания */}
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Список обслуживания</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Воздушное судно
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Персонал
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Начало
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Окончание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenance.map((maintenanceItem) => (
                  <tr key={maintenanceItem.maintenance_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {maintenanceItem.maintenance_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {maintenanceItem.aircraft ? (
                        <div>
                          <div className="font-medium">{maintenanceItem.aircraft.tail_number}</div>
                          <div className="text-gray-500">
                            {maintenanceItem.aircraft.aircraft_type?.manufacturer} {maintenanceItem.aircraft.aircraft_type?.model}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Не указано</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {maintenanceItem.personnel?.name || <span className="text-gray-400">Не указан</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(maintenanceItem.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(maintenanceItem.end_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(maintenanceItem.end_time)}`}>
                        {getStatusLabel(maintenanceItem.end_time)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={maintenanceItem.description || ''}>
                        {maintenanceItem.description || <span className="text-gray-400">Нет описания</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!maintenanceItem.end_time && (
                          <button
                            onClick={() => handleComplete(maintenanceItem.maintenance_id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Завершить
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(maintenanceItem)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(maintenanceItem.maintenance_id)}
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
          </div>
        </div>
      </div>
    </div>
  );
} 