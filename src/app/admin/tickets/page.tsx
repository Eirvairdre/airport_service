"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ticket {
  ticket_id: number;
  passenger_id: number | null;
  flight_id: number | null;
  seat_number: string | null;
  ticket_price: number | null;
  baggage_included: boolean | null;
  passenger: {
    passenger_id: number;
    name: string | null;
    passport_number: string | null;
  } | null;
  flight: {
    flight_id: number;
    flight_number: string | null;
    scheduled_departure: string | null;
    scheduled_arrival: string | null;
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

interface Passenger {
  passenger_id: number;
  name: string | null;
  passport_number: string | null;
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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    passenger_id: '',
    flight_id: '',
    seat_number: '',
    ticket_price: '',
    baggage_included: false
  });

  // Загрузка данных
  const fetchData = async () => {
    try {
      const [ticketsRes, passengersRes, flightsRes] = await Promise.all([
        fetch('/api/ticket'),
        fetch('/api/passenger'),
        fetch('/api/flight')
      ]);

      if (!ticketsRes.ok || !passengersRes.ok || !flightsRes.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const [ticketsData, passengersData, flightsData] = await Promise.all([
        ticketsRes.json(),
        passengersRes.json(),
        flightsRes.json()
      ]);

      setTickets(ticketsData);
      setPassengers(passengersData);
      setFlights(flightsData);
    } catch (err) {
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Создание билета
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/ticket', {
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
      setFormData({ passenger_id: '', flight_id: '', seat_number: '', ticket_price: '', baggage_included: false });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление билета
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    try {
      const response = await fetch(`/api/ticket/${editingTicket.ticket_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchData();
      setEditingTicket(null);
      setFormData({ passenger_id: '', flight_id: '', seat_number: '', ticket_price: '', baggage_included: false });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление билета
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот билет?')) return;

    try {
      const response = await fetch(`/api/ticket/${id}`, {
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
  const startEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      passenger_id: ticket.passenger_id?.toString() || '',
      flight_id: ticket.flight_id?.toString() || '',
      seat_number: ticket.seat_number || '',
      ticket_price: ticket.ticket_price?.toString() || '',
      baggage_included: ticket.baggage_included || false
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingTicket(null);
    setShowCreateForm(false);
    setFormData({ passenger_id: '', flight_id: '', seat_number: '', ticket_price: '', baggage_included: false });
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
          <h1 className="text-3xl font-bold text-gray-900">Управление билетами</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          + Добавить билет
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingTicket) && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingTicket ? 'Редактировать билет' : 'Добавить новый билет'}
          </h2>
          <form onSubmit={editingTicket ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пассажир *
                </label>
                <select
                  value={formData.passenger_id}
                  onChange={(e) => setFormData({...formData, passenger_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Выберите пассажира</option>
                  {passengers.map((passenger) => (
                    <option key={passenger.passenger_id} value={passenger.passenger_id}>
                      {passenger.name} ({passenger.passport_number})
                    </option>
                  ))}
                </select>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер места
                </label>
                <input
                  type="text"
                  value={formData.seat_number}
                  onChange={(e) => setFormData({...formData, seat_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена билета
                </label>
                <input
                  type="number"
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({...formData, ticket_price: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.baggage_included}
                    onChange={(e) => setFormData({...formData, baggage_included: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Багаж включен</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {editingTicket ? 'Обновить' : 'Создать'}
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

      {/* Таблица билетов */}
      <div className="bg-white rounded shadow overflow-hidden">
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
                Маршрут
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Место
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
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
            {tickets.map((ticket) => (
              <tr key={ticket.ticket_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {ticket.ticket_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ticket.passenger ? (
                    <div>
                      <div>{ticket.passenger.name}</div>
                      <div className="text-xs text-gray-500">{ticket.passenger.passport_number}</div>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.flight?.flight_number || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.flight ? (
                    <div>
                      <div>{ticket.flight.departureAirport?.city} → {ticket.flight.arrivalAirport?.city}</div>
                      <div className="text-xs text-gray-400">
                        {ticket.flight.scheduled_departure ? new Date(ticket.flight.scheduled_departure).toLocaleDateString('ru-RU') : ''}
                      </div>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.seat_number || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.ticket_price ? `${ticket.ticket_price} ₽` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.baggage_included ? 'Да' : 'Нет'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(ticket)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.ticket_id)}
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
        {tickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Билеты не найдены
          </div>
        )}
      </div>
    </div>
  );
} 