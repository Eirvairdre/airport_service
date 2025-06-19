'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Checkin {
  checkin_id: number;
  ticket_id: number;
  checkin_time: string;
  baggage_count: number;
  ticket: {
    ticket_id: number;
    seat_number: string;
    passenger: {
      passenger_id: number;
      name: string;
      passport_number: string;
    };
    flight: {
      flight_id: number;
      flight_number: string;
      scheduled_departure: string;
      departureAirport: {
        name: string;
        city: string;
      };
      arrivalAirport: {
        name: string;
        city: string;
      };
    };
  };
  baggages: Baggage[];
}

interface Baggage {
  baggage_id: number;
  weight_kg: number;
  label_number: string;
}

interface Ticket {
  ticket_id: number;
  seat_number: string;
  passenger: {
    passenger_id: number;
    name: string;
    passport_number: string;
  };
  flight: {
    flight_id: number;
    flight_number: string;
    scheduled_departure: string;
    departureAirport: {
      name: string;
      city: string;
    };
    arrivalAirport: {
      name: string;
      city: string;
    };
  };
}

export default function CheckinsPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState<Checkin | null>(null);
  const [formData, setFormData] = useState({
    ticket_id: '',
    baggage_count: 0,
    baggages: [] as Array<{ weight_kg: number; label_number: string }>
  });

  useEffect(() => {
    fetchCheckins();
    fetchTickets();
  }, []);

  const fetchCheckins = async () => {
    try {
      const response = await fetch('/api/checkin');
      if (response.ok) {
        const data = await response.json();
        setCheckins(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке регистраций:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/ticket');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке билетов:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCheckin 
        ? `/api/checkin/${editingCheckin.checkin_id}`
        : '/api/checkin';
      
      const method = editingCheckin ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setEditingCheckin(null);
        setFormData({ ticket_id: '', baggage_count: 0, baggages: [] });
        fetchCheckins();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка при сохранении регистрации:', error);
      alert('Ошибка при сохранении регистрации');
    }
  };

  const handleDelete = async (checkinId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту регистрацию?')) {
      return;
    }

    try {
      const response = await fetch(`/api/checkin/${checkinId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCheckins();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка при удалении регистрации:', error);
      alert('Ошибка при удалении регистрации');
    }
  };

  const handleEdit = (checkin: Checkin) => {
    setEditingCheckin(checkin);
    setFormData({
      ticket_id: checkin.ticket_id.toString(),
      baggage_count: checkin.baggage_count,
      baggages: checkin.baggages.map(b => ({
        weight_kg: Number(b.weight_kg),
        label_number: b.label_number
      }))
    });
    setShowCreateForm(true);
  };

  const addBaggage = () => {
    setFormData(prev => ({
      ...prev,
      baggages: [...prev.baggages, { weight_kg: 0, label_number: '' }]
    }));
  };

  const removeBaggage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      baggages: prev.baggages.filter((_, i) => i !== index)
    }));
  };

  const updateBaggage = (index: number, field: 'weight_kg' | 'label_number', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      baggages: prev.baggages.map((baggage, i) => 
        i === index ? { ...baggage, [field]: value } : baggage
      )
    }));
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Регистрация на рейсы</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Добавить регистрацию
          </button>
          <Link
            href="/admin"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Назад в админ-панель
          </Link>
        </div>
      </div>

      {/* Форма создания/редактирования */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCheckin ? 'Редактировать регистрацию' : 'Новая регистрация'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Билет
              </label>
              <select
                value={formData.ticket_id}
                onChange={(e) => setFormData(prev => ({ ...prev, ticket_id: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Выберите билет</option>
                {tickets.map((ticket) => (
                  <option key={ticket.ticket_id} value={ticket.ticket_id}>
                    {ticket.flight.flight_number} - {ticket.passenger.name} 
                    (Место: {ticket.seat_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество багажа
              </label>
              <input
                type="number"
                value={formData.baggage_count}
                onChange={(e) => setFormData(prev => ({ ...prev, baggage_count: parseInt(e.target.value) || 0 }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Багаж
              </label>
              {formData.baggages.map((baggage, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Вес (кг)"
                    value={baggage.weight_kg}
                    onChange={(e) => updateBaggage(index, 'weight_kg', parseFloat(e.target.value) || 0)}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    step="0.1"
                    min="0"
                  />
                  <input
                    type="text"
                    placeholder="Номер бирки"
                    value={baggage.label_number}
                    onChange={(e) => updateBaggage(index, 'label_number', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeBaggage(index)}
                    className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded"
                  >
                    Удалить
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBaggage}
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Добавить багаж
              </button>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {editingCheckin ? 'Обновить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCheckin(null);
                  setFormData({ ticket_id: '', baggage_count: 0, baggages: [] });
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица регистраций */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Пассажир
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Рейс
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Место
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Время регистрации
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Багаж
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {checkins.map((checkin) => (
              <tr key={checkin.checkin_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {checkin.checkin_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{checkin.ticket.passenger.name}</div>
                    <div className="text-gray-500">{checkin.ticket.passenger.passport_number}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{checkin.ticket.flight.flight_number}</div>
                    <div className="text-gray-500">
                      {checkin.ticket.flight.departureAirport.city} → {checkin.ticket.flight.arrivalAirport.city}
                    </div>
                    <div className="text-gray-500">
                      {formatDateTime(checkin.ticket.flight.scheduled_departure)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {checkin.ticket.seat_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTime(checkin.checkin_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>{checkin.baggage_count} мест</div>
                    {checkin.baggages.length > 0 && (
                      <div className="text-gray-500">
                        {checkin.baggages.map(b => `${b.weight_kg}кг`).join(', ')}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(checkin)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(checkin.checkin_id)}
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
  );
} 