"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Flight {
  flight_id: number;
  flight_number: string | null;
  scheduled_departure: string | null;
  scheduled_arrival: string | null;
  departureAirport: {
    name: string | null;
    iata_code: string | null;
  } | null;
  arrivalAirport: {
    name: string | null;
    iata_code: string | null;
  } | null;
}

interface Personnel {
  personnel_id: number;
  name: string | null;
  position_id: number | null;
}

interface Incident {
  incident_id: number;
  flight_id: number | null;
  personnel_id: number | null;
  incident_time: string | null;
  description: string | null;
  severity: string | null;
  flight: Flight | null;
  personnel: Personnel | null;
}

const INCIDENT_SEVERITIES = [
  { value: 'Low', label: 'Низкая', color: 'bg-green-100 text-green-800' },
  { value: 'Medium', label: 'Средняя', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'High', label: 'Высокая', color: 'bg-orange-100 text-orange-800' },
  { value: 'Critical', label: 'Критическая', color: 'bg-red-100 text-red-800' }
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    flight_id: '',
    personnel_id: '',
    incident_time_date: '',
    incident_time_time: '',
    description: '',
    severity: 'Medium'
  });

  // Загрузка данных
  const fetchData = async () => {
    try {
      const [incidentsRes, flightsRes, personnelRes] = await Promise.all([
        fetch('/api/incident'),
        fetch('/api/flight'),
        fetch('/api/personnel')
      ]);

      if (!incidentsRes.ok || !flightsRes.ok || !personnelRes.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const [incidentsData, flightsData, personnelData] = await Promise.all([
        incidentsRes.json(),
        flightsRes.json(),
        personnelRes.json()
      ]);

      setIncidents(incidentsData);
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

  // Создание инцидента
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setError('Описание инцидента обязательно');
      return;
    }
    if (!formData.incident_time_date || !formData.incident_time_time) {
      setError('Время инцидента обязательно');
      return;
    }

    try {
      const incidentTime = new Date(`${formData.incident_time_date}T${formData.incident_time_time}`);
      
      const dataToSend = {
        flight_id: formData.flight_id || null,
        personnel_id: formData.personnel_id || null,
        incident_time: incidentTime.toISOString(),
        description: formData.description.trim(),
        severity: formData.severity
      };

      console.log('Sending data:', dataToSend); // Логируем отправляемые данные

      const response = await fetch('/api/incident', {
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
        flight_id: '',
        personnel_id: '',
        incident_time_date: '',
        incident_time_time: '',
        description: '',
        severity: 'Medium'
      });
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление инцидента
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncident) return;

    try {
      const incidentTime = new Date(`${formData.incident_time_date}T${formData.incident_time_time}`);
      
      const dataToSend = {
        flight_id: formData.flight_id || null,
        personnel_id: formData.personnel_id || null,
        incident_time: incidentTime.toISOString(),
        description: formData.description.trim(),
        severity: formData.severity
      };

      const response = await fetch(`/api/incident/${editingIncident.incident_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchData();
      setEditingIncident(null);
      setFormData({
        flight_id: '',
        personnel_id: '',
        incident_time_date: '',
        incident_time_time: '',
        description: '',
        severity: 'Medium'
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление инцидента
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот инцидент?')) return;

    try {
      const response = await fetch(`/api/incident/${id}`, {
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
  const startEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setFormData({
      flight_id: incident.flight_id?.toString() || '',
      personnel_id: incident.personnel_id?.toString() || '',
      incident_time_date: incident.incident_time ? incident.incident_time.split('T')[0] : '',
      incident_time_time: incident.incident_time ? incident.incident_time.split('T')[1].substring(0, 5) : '',
      description: incident.description || '',
      severity: incident.severity || 'Medium'
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingIncident(null);
    setShowCreateForm(false);
    setFormData({
      flight_id: '',
      personnel_id: '',
      incident_time_date: '',
      incident_time_time: '',
      description: '',
      severity: 'Medium'
    });
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return 'Не указано';
    return new Date(date).toLocaleString('ru-RU');
  };

  const getSeverityColor = (severity: string | null) => {
    const severityObj = INCIDENT_SEVERITIES.find(s => s.value === severity);
    return severityObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getSeverityLabel = (severity: string | null) => {
    const severityObj = INCIDENT_SEVERITIES.find(s => s.value === severity);
    return severityObj?.label || 'Неизвестно';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка инцидентов...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Управление инцидентами</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            + Создать инцидент
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Форма создания/редактирования */}
        {(showCreateForm || editingIncident) && (
          <div className="bg-white rounded shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingIncident ? 'Редактировать инцидент' : 'Создать новый инцидент'}
            </h2>
            <form onSubmit={editingIncident ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Рейс
                  </label>
                  <select
                    value={formData.flight_id}
                    onChange={(e) => setFormData({...formData, flight_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите рейс</option>
                    {flights.map((flight) => (
                      <option key={flight.flight_id} value={flight.flight_id}>
                        {flight.flight_number} - {flight.departureAirport?.iata_code} → {flight.arrivalAirport?.iata_code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Персонал
                  </label>
                  <select
                    value={formData.personnel_id}
                    onChange={(e) => setFormData({...formData, personnel_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Время инцидента *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.incident_time_date && formData.incident_time_time ? 
                      `${formData.incident_time_date}T${formData.incident_time_time}` : ''}
                    onChange={(e) => {
                      const [date, time] = e.target.value.split('T');
                      setFormData({
                        ...formData, 
                        incident_time_date: date || '', 
                        incident_time_time: time || ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Серьезность
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {INCIDENT_SEVERITIES.map((severity) => (
                      <option key={severity.value} value={severity.value}>
                        {severity.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание инцидента *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Опишите детали инцидента..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {editingIncident ? 'Обновить' : 'Создать'}
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

        {/* Список инцидентов */}
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Список инцидентов</h2>
          </div>
          <div className="overflow-x-auto">
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
                    Персонал
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Время
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Серьезность
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
                {incidents.map((incident) => (
                  <tr key={incident.incident_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {incident.incident_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incident.flight ? (
                        <div>
                          <div className="font-medium">{incident.flight.flight_number}</div>
                          <div className="text-gray-500">
                            {incident.flight.departureAirport?.iata_code} → {incident.flight.arrivalAirport?.iata_code}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Не указан</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incident.personnel?.name || <span className="text-gray-400">Не указан</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(incident.incident_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(incident.severity)}`}>
                        {getSeverityLabel(incident.severity)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={incident.description || ''}>
                        {incident.description || <span className="text-gray-400">Нет описания</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(incident)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(incident.incident_id)}
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