"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Personnel {
  personnel_id: number;
  name: string | null;
  position_id: number | null;
  license_number: string | null;
  hired_date: string | null;
  crew_members: CrewMember[];
  maintenances: Maintenance[];
  incidents: Incident[];
}

interface CrewMember {
  crew_member_id: number;
  crew_id: number | null;
  personnel_id: number | null;
  role: string | null;
}

interface Maintenance {
  maintenance_id: number;
  aircraft_id: number | null;
  personnel_id: number | null;
  maintenance_type: string | null;
  scheduled_date: string | null;
}

interface Incident {
  incident_id: number;
  flight_id: number | null;
  personnel_id: number | null;
  description: string | null;
  severity: string | null;
  reported_date: string | null;
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    name: '',
    position_id: '',
    license_number: '',
    hired_date: ''
  });

  // Загрузка данных
  const fetchData = async () => {
    try {
      const response = await fetch('/api/personnel');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      setPersonnel(data);
    } catch (err) {
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Создание сотрудника
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/personnel', {
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
      setFormData({ name: '', position_id: '', license_number: '', hired_date: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление сотрудника
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPersonnel) return;

    try {
      const response = await fetch(`/api/personnel/${editingPersonnel.personnel_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchData();
      setEditingPersonnel(null);
      setFormData({ name: '', position_id: '', license_number: '', hired_date: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление сотрудника
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) return;

    try {
      const response = await fetch(`/api/personnel/${id}`, {
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
  const startEdit = (personnelItem: Personnel) => {
    setEditingPersonnel(personnelItem);
    setFormData({
      name: personnelItem.name || '',
      position_id: personnelItem.position_id?.toString() || '',
      license_number: personnelItem.license_number || '',
      hired_date: personnelItem.hired_date ? personnelItem.hired_date.split('T')[0] : ''
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingPersonnel(null);
    setShowCreateForm(false);
    setFormData({ name: '', position_id: '', license_number: '', hired_date: '' });
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
          <h1 className="text-3xl font-bold text-gray-900">Управление персоналом</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          + Добавить сотрудника
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingPersonnel) && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingPersonnel ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}
          </h2>
          <form onSubmit={editingPersonnel ? handleUpdate : handleCreate} className="space-y-4">
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
                  ID должности
                </label>
                <input
                  type="number"
                  value={formData.position_id}
                  onChange={(e) => setFormData({...formData, position_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер лицензии
                </label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата приема на работу
                </label>
                <input
                  type="date"
                  value={formData.hired_date}
                  onChange={(e) => setFormData({...formData, hired_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {editingPersonnel ? 'Обновить' : 'Создать'}
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

      {/* Таблица персонала */}
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
                Должность ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Лицензия
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата приема
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Экипажи
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {personnel.map((personnelItem) => (
              <tr key={personnelItem.personnel_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {personnelItem.personnel_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {personnelItem.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {personnelItem.position_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {personnelItem.license_number || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {personnelItem.hired_date ? new Date(personnelItem.hired_date).toLocaleDateString('ru-RU') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {personnelItem.crew_members.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(personnelItem)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(personnelItem.personnel_id)}
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
        {personnel.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Персонал не найден
          </div>
        )}
      </div>
    </div>
  );
} 