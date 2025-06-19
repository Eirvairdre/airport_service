"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Crew {
  crew_id: number;
  flight_id: number | null;
  flight: {
    flight_id: number;
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
  members: CrewMember[];
}

interface CrewMember {
  crew_member_id: number;
  crew_id: number | null;
  personnel_id: number | null;
  role: string | null;
  personnel: {
    personnel_id: number;
    name: string | null;
    license_number: string | null;
  } | null;
}

interface Flight {
  flight_id: number;
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
}

interface Personnel {
  personnel_id: number;
  name: string | null;
  license_number: string | null;
}

export default function CrewsPage() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    flight_id: '',
    members: [{ personnel_id: '', role: '' }]
  });

  // Загрузка данных
  const fetchData = async () => {
    try {
      const [crewsRes, flightsRes, personnelRes] = await Promise.all([
        fetch('/api/crew'),
        fetch('/api/flight'),
        fetch('/api/personnel')
      ]);

      if (!crewsRes.ok || !flightsRes.ok || !personnelRes.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const [crewsData, flightsData, personnelData] = await Promise.all([
        crewsRes.json(),
        flightsRes.json(),
        personnelRes.json()
      ]);

      setCrews(crewsData);
      setFlights(flightsData);
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

  // Добавить члена экипажа в форму
  const addMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { personnel_id: '', role: '' }]
    });
  };

  // Удалить члена экипажа из формы
  const removeMember = (index: number) => {
    const newMembers = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: newMembers });
  };

  // Обновить данные члена экипажа
  const updateMember = (index: number, field: string, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, members: newMembers });
  };

  // Создание экипажа
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/crew', {
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
      setFormData({ flight_id: '', members: [{ personnel_id: '', role: '' }] });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление экипажа
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrew) return;

    try {
      const response = await fetch(`/api/crew/${editingCrew.crew_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchData();
      setEditingCrew(null);
      setFormData({ flight_id: '', members: [{ personnel_id: '', role: '' }] });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление экипажа
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот экипаж?')) return;

    try {
      const response = await fetch(`/api/crew/${id}`, {
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
  const startEdit = (crew: Crew) => {
    setEditingCrew(crew);
    setFormData({
      flight_id: crew.flight_id?.toString() || '',
      members: crew.members.map(member => ({
        personnel_id: member.personnel_id?.toString() || '',
        role: member.role || ''
      }))
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingCrew(null);
    setShowCreateForm(false);
    setFormData({ flight_id: '', members: [{ personnel_id: '', role: '' }] });
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
          <h1 className="text-3xl font-bold text-gray-900">Управление экипажами</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          + Добавить экипаж
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingCrew) && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCrew ? 'Редактировать экипаж' : 'Добавить новый экипаж'}
          </h2>
          <form onSubmit={editingCrew ? handleUpdate : handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Рейс *
              </label>
              <select
                value={formData.flight_id}
                onChange={(e) => setFormData({...formData, flight_id: e.target.value})}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите рейс</option>
                {flights.map((flight) => (
                  <option key={flight.flight_id} value={flight.flight_id}>
                    {flight.flight_number} - {flight.departureAirport?.city} → {flight.arrivalAirport?.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Члены экипажа *
              </label>
              {formData.members.map((member, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={member.personnel_id}
                    onChange={(e) => updateMember(index, 'personnel_id', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите сотрудника</option>
                    {personnel.map((person) => (
                      <option key={person.personnel_id} value={person.personnel_id}>
                        {person.name} ({person.license_number})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Роль"
                    value={member.role}
                    onChange={(e) => updateMember(index, 'role', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {formData.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMember}
                className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                + Добавить члена экипажа
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {editingCrew ? 'Обновить' : 'Создать'}
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

      {/* Таблица экипажей */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Рейс
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Маршрут
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Члены экипажа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {crews.map((crew) => (
              <tr key={crew.crew_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {crew.crew_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {crew.flight?.flight_number || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {crew.flight ? (
                    <div>
                      <div>{crew.flight.departureAirport?.city} → {crew.flight.arrivalAirport?.city}</div>
                      <div className="text-xs text-gray-400">
                        {crew.flight.scheduled_departure ? new Date(crew.flight.scheduled_departure).toLocaleDateString('ru-RU') : ''}
                      </div>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="space-y-1">
                    {crew.members.map((member) => (
                      <div key={member.crew_member_id} className="text-xs">
                        <span className="font-medium">{member.personnel?.name}</span>
                        {member.role && <span className="text-gray-400"> - {member.role}</span>}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(crew)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(crew.crew_id)}
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
        {crews.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Экипажи не найдены
          </div>
        )}
      </div>
    </div>
  );
} 