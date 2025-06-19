"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Airport {
  airport_id: number;
  name: string | null;
  city: string | null;
  country: string | null;
  iata_code: string | null;
}

interface Aircraft {
  aircraft_id: number;
  tail_number: string | null;
  aircraft_type: {
    model: string | null;
    manufacturer: string | null;
  } | null;
}

interface Airline {
  airline_id: number;
  name: string | null;
  iata_code: string | null;
}

interface Flight {
  flight_id: number;
  flight_number: string | null;
  scheduled_departure: string | null;
  scheduled_arrival: string | null;
  status: string | null;
  gate_id?: number | null;
  stand_id?: number | null;
  aircraft: Aircraft | null;
  airline: Airline | null;
  departureAirport: Airport | null;
  arrivalAirport: Airport | null;
}

const FLIGHT_STATUSES = [
  { value: 'Scheduled', label: 'Запланирован', color: 'bg-blue-100 text-blue-800' },
  { value: 'Delayed', label: 'Задержан', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Cancelled', label: 'Отменен', color: 'bg-red-100 text-red-800' },
  { value: 'Completed', label: 'Завершен', color: 'bg-green-100 text-green-800' }
];

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  // Фильтры
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [dateChangeKey, setDateChangeKey] = useState(0); // Ключ для принудительного обновления
  const dateInputRef = useRef<HTMLInputElement>(null); // Ref для поля ввода даты

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    flight_number: '',
    aircraft_id: '',
    airline_id: '',
    gate_id: '',
    stand_id: '',
    departure_airport_id: '',
    arrival_airport_id: '',
    scheduled_departure_date: '',
    scheduled_departure_time: '',
    scheduled_arrival_date: '',
    scheduled_arrival_time: '',
    status: 'Scheduled'
  });

  // Загрузка данных
  const fetchData = useCallback(async () => {
    console.log('Загружаем данные с фильтрами:', { selectedDate, selectedStatus, selectedAirline });
    try {
      const [flightsRes, airportsRes, aircraftRes, airlinesRes] = await Promise.all([
        fetch(`/api/flight?date=${selectedDate}&status=${selectedStatus}&airline_id=${selectedAirline}`),
        fetch('/api/airport'),
        fetch('/api/aircraft'),
        fetch('/api/airline')
      ]);

      if (!flightsRes.ok || !airportsRes.ok || !aircraftRes.ok || !airlinesRes.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const [flightsData, airportsData, aircraftData, airlinesData] = await Promise.all([
        flightsRes.json(),
        airportsRes.json(),
        aircraftRes.json(),
        airlinesRes.json()
      ]);

      console.log('Данные загружены:', { 
        flightsCount: flightsData.length, 
        airportsCount: airportsData.length,
        aircraftCount: aircraftData.length,
        airlinesCount: airlinesData.length
      });

      setFlights(flightsData);
      setAirports(airportsData);
      setAircraft(aircraftData);
      setAirlines(airlinesData);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStatus, selectedAirline]);

  useEffect(() => {
    console.log('Фильтры изменились:', { selectedDate, selectedStatus, selectedAirline, dateChangeKey });
    fetchData();
  }, [selectedDate, selectedStatus, selectedAirline, fetchData, dateChangeKey]);

  // Обработчик изменения даты
  const handleDateChange = (newDate: string) => {
    console.log('=== ОБРАБОТЧИК ИЗМЕНЕНИЯ ДАТЫ ===');
    console.log('Старая дата:', selectedDate);
    console.log('Новая дата:', newDate);
    console.log('Тип новой даты:', typeof newDate);
    
    setSelectedDate(newDate);
    setDateChangeKey(prev => prev + 1); // Увеличиваем ключ для принудительного обновления
    
    // Принудительно обновляем значение в DOM
    if (dateInputRef.current) {
      dateInputRef.current.value = newDate;
      console.log('Обновлено значение в DOM:', dateInputRef.current.value);
    }
    
    // Принудительно обновляем данные через небольшую задержку
    setTimeout(() => {
      console.log('Принудительно обновляем данные для даты:', newDate);
      console.log('Текущее состояние selectedDate:', selectedDate);
      fetchData();
    }, 100);
  };

  // Альтернативный обработчик с функцией обновления
  const handleDateChangeAlternative = (newDate: string) => {
    console.log('=== АЛЬТЕРНАТИВНЫЙ ОБРАБОТЧИК ===');
    console.log('Новая дата:', newDate);
    
    setSelectedDate(prevDate => {
      console.log('Обновляем состояние с:', prevDate, 'на:', newDate);
      return newDate;
    });
    
    // Принудительно обновляем данные
    setTimeout(() => {
      console.log('Альтернативный вызов fetchData для даты:', newDate);
      fetchData();
    }, 50);
  };

  // Создание рейса
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация на фронтенде
    if (!formData.flight_number.trim()) {
      setError('Номер рейса обязателен');
      return;
    }
    if (!formData.departure_airport_id) {
      setError('Аэропорт отправления обязателен');
      return;
    }
    if (!formData.arrival_airport_id) {
      setError('Аэропорт прибытия обязателен');
      return;
    }
    if (!formData.scheduled_departure_date || !formData.scheduled_departure_time) {
      setError('Время отправления обязательно');
      return;
    }
    if (!formData.scheduled_arrival_date || !formData.scheduled_arrival_time) {
      setError('Время прибытия обязательно');
      return;
    }
    if (formData.departure_airport_id === formData.arrival_airport_id) {
      setError('Аэропорты отправления и прибытия должны быть разными');
      return;
    }

    try {
      // Преобразуем даты в правильный формат
      const departureDate = new Date(`${formData.scheduled_departure_date}T${formData.scheduled_departure_time}`);
      const arrivalDate = new Date(`${formData.scheduled_arrival_date}T${formData.scheduled_arrival_time}`);
      
      console.log('Исходные даты из формы:', {
        scheduled_departure: departureDate.toISOString(),
        scheduled_arrival: arrivalDate.toISOString()
      });

      // Проверяем валидность дат
      if (!departureDate || !arrivalDate) {
        setError('Даты обязательны');
        return;
      }

      if (departureDate >= arrivalDate) {
        setError('Время прибытия должно быть позже времени отправления');
        return;
      }

      // Подготавливаем данные для отправки
      const dataToSend = {
        ...formData,
        // Убираем пустые строки для опциональных полей
        aircraft_id: formData.aircraft_id || undefined,
        airline_id: formData.airline_id || undefined,
        gate_id: formData.gate_id || undefined,
        stand_id: formData.stand_id || undefined,
        departure_airport_id: formData.departure_airport_id || undefined,
        arrival_airport_id: formData.arrival_airport_id || undefined,
        // Преобразуем даты в ISO строки
        scheduled_departure: departureDate.toISOString(),
        scheduled_arrival: arrivalDate.toISOString(),
      };

      console.log('Отправляемые данные:', dataToSend);

      const response = await fetch('/api/flight', {
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
        flight_number: '',
        aircraft_id: '',
        airline_id: '',
        gate_id: '',
        stand_id: '',
        departure_airport_id: '',
        arrival_airport_id: '',
        scheduled_departure_date: '',
        scheduled_departure_time: '',
        scheduled_arrival_date: '',
        scheduled_arrival_time: '',
        status: 'Scheduled'
      });
      setError(''); // Очищаем ошибки при успехе
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Обновление рейса
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlight) return;

    try {
      const response = await fetch(`/api/flight/${editingFlight.flight_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка обновления');
      }

      await fetchData();
      setEditingFlight(null);
      setFormData({
        flight_number: '',
        aircraft_id: '',
        airline_id: '',
        gate_id: '',
        stand_id: '',
        departure_airport_id: '',
        arrival_airport_id: '',
        scheduled_departure_date: '',
        scheduled_departure_time: '',
        scheduled_arrival_date: '',
        scheduled_arrival_time: '',
        status: 'Scheduled'
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Удаление рейса
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот рейс?')) return;

    try {
      const response = await fetch(`/api/flight/${id}`, {
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
  const startEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFormData({
      flight_number: flight.flight_number || '',
      aircraft_id: flight.aircraft?.aircraft_id?.toString() || '',
      airline_id: flight.airline?.airline_id?.toString() || '',
      gate_id: flight.gate_id?.toString() || '',
      stand_id: flight.stand_id?.toString() || '',
      departure_airport_id: flight.departureAirport?.airport_id?.toString() || '',
      arrival_airport_id: flight.arrivalAirport?.airport_id?.toString() || '',
      scheduled_departure_date: flight.scheduled_departure ? flight.scheduled_departure.split('T')[0] : '',
      scheduled_departure_time: flight.scheduled_departure ? flight.scheduled_departure.split('T')[1].substring(0, 5) : '',
      scheduled_arrival_date: flight.scheduled_arrival ? flight.scheduled_arrival.split('T')[0] : '',
      scheduled_arrival_time: flight.scheduled_arrival ? flight.scheduled_arrival.split('T')[1].substring(0, 5) : '',
      status: flight.status || 'Scheduled'
    });
  };

  // Отмена редактирования
  const cancelEdit = () => {
    setEditingFlight(null);
    setShowCreateForm(false);
    setFormData({
      flight_number: '',
      aircraft_id: '',
      airline_id: '',
      gate_id: '',
      stand_id: '',
      departure_airport_id: '',
      arrival_airport_id: '',
      scheduled_departure_date: '',
      scheduled_departure_time: '',
      scheduled_arrival_date: '',
      scheduled_arrival_time: '',
      status: 'Scheduled'
    });
  };

  // Форматирование времени
  const formatTime = (date: Date | string | null) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение цвета статуса
  const getStatusColor = (status: string | null) => {
    const statusObj = FLIGHT_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  // Получение названия статуса
  const getStatusLabel = (status: string | null) => {
    const statusObj = FLIGHT_STATUSES.find(s => s.value === status);
    return statusObj?.label || status || 'Неизвестно';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка рейсов...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Управление рейсами</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          + Добавить рейс
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Фильтры</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <input
              key={dateChangeKey}
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChangeAlternative(e.target.value)}
              onInput={(e) => {
                console.log('Ввод в поле даты:', e.currentTarget.value);
              }}
              onBlur={(e) => {
                console.log('Поле даты потеряло фокус, текущее значение:', e.target.value);
                if (e.target.value !== selectedDate) {
                  handleDateChangeAlternative(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              ref={dateInputRef}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все статусы</option>
              {FLIGHT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Авиакомпания</label>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все авиакомпании</option>
              {airlines.map((airline) => (
                <option key={airline.airline_id} value={airline.airline_id}>
                  {airline.name} ({airline.iata_code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                handleDateChangeAlternative(today);
                setSelectedStatus('');
                setSelectedAirline('');
              }}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingFlight) && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingFlight ? 'Редактировать рейс' : 'Добавить новый рейс'}
          </h2>
          <form onSubmit={editingFlight ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер рейса *
                </label>
                <input
                  type="text"
                  value={formData.flight_number}
                  onChange={(e) => setFormData({...formData, flight_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Аэропорт отправления *
                </label>
                <select
                  value={formData.departure_airport_id}
                  onChange={(e) => setFormData({...formData, departure_airport_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Выберите аэропорт</option>
                  {airports.map((airport) => (
                    <option key={airport.airport_id} value={airport.airport_id}>
                      {airport.name} ({airport.iata_code}) - {airport.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Аэропорт прибытия *
                </label>
                <select
                  value={formData.arrival_airport_id}
                  onChange={(e) => setFormData({...formData, arrival_airport_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Выберите аэропорт</option>
                  {airports.map((airport) => (
                    <option key={airport.airport_id} value={airport.airport_id}>
                      {airport.name} ({airport.iata_code}) - {airport.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Время отправления *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_departure_date && formData.scheduled_departure_time ? 
                    `${formData.scheduled_departure_date}T${formData.scheduled_departure_time}` : ''}
                  onChange={(e) => {
                    const [date, time] = e.target.value.split('T');
                    setFormData({
                      ...formData, 
                      scheduled_departure_date: date || '', 
                      scheduled_departure_time: time || ''
                    });
                  }}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Время прибытия *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_arrival_date && formData.scheduled_arrival_time ? 
                    `${formData.scheduled_arrival_date}T${formData.scheduled_arrival_time}` : ''}
                  onChange={(e) => {
                    const [date, time] = e.target.value.split('T');
                    setFormData({
                      ...formData, 
                      scheduled_arrival_date: date || '', 
                      scheduled_arrival_time: time || ''
                    });
                  }}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FLIGHT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Воздушное судно
                </label>
                <select
                  value={formData.aircraft_id}
                  onChange={(e) => setFormData({...formData, aircraft_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите самолет</option>
                  {aircraft.map((aircraftItem) => (
                    <option key={aircraftItem.aircraft_id} value={aircraftItem.aircraft_id}>
                      {aircraftItem.tail_number} - {aircraftItem.aircraft_type?.manufacturer} {aircraftItem.aircraft_type?.model}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер гейта
                </label>
                <input
                  type="number"
                  value={formData.gate_id}
                  onChange={(e) => setFormData({...formData, gate_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Опционально"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер стоянки
                </label>
                <input
                  type="number"
                  value={formData.stand_id}
                  onChange={(e) => setFormData({...formData, stand_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Опционально"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {editingFlight ? 'Обновить' : 'Создать'}
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

      {/* Таблица рейсов */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Рейсы на {new Date(selectedDate).toLocaleDateString('ru-RU')} 
            ({flights.length} рейсов)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Рейс
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Отправление
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Прибытие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Авиакомпания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Самолет
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flights.map((flight) => (
                <tr key={flight.flight_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {flight.flight_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {flight.departureAirport?.iata_code} → {flight.arrivalAirport?.iata_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatTime(flight.scheduled_departure)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {flight.departureAirport?.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatTime(flight.scheduled_arrival)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {flight.arrivalAirport?.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(flight.status)}`}>
                      {getStatusLabel(flight.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {flight.airline?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {flight.airline?.iata_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {flight.aircraft?.tail_number || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {flight.aircraft?.aircraft_type ? 
                        `${flight.aircraft.aircraft_type.manufacturer} ${flight.aircraft.aircraft_type.model}` : 
                        '-'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(flight)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(flight.flight_id)}
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
        {flights.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Рейсы не найдены
          </div>
        )}
      </div>
    </div>
  );
} 