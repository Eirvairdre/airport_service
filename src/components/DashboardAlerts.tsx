"use client";
import { useState, useEffect } from "react";

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

interface DashboardAlertsProps {
  incidents: any[];
  maintenance: any[];
  flights: any[];
}

export default function DashboardAlerts({ incidents, maintenance, flights }: DashboardAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Генерируем алерты на основе данных
  const generateAlerts = () => {
    const newAlerts: Alert[] = [];

    // Алерты по инцидентам
    incidents.forEach((incident: any) => {
      if (incident.severity === 'Critical') {
        newAlerts.push({
          id: `incident-${incident.incident_id}`,
          type: 'error',
          title: 'Критический инцидент',
          message: `Рейс ${incident.flight?.flight_number || 'N/A'}: ${incident.description || 'Описание недоступно'}`,
          timestamp: new Date(incident.incident_time)
        });
      } else if (incident.severity === 'High') {
        newAlerts.push({
          id: `incident-${incident.incident_id}`,
          type: 'warning',
          title: 'Высокий уровень инцидента',
          message: `Рейс ${incident.flight?.flight_number || 'N/A'}: ${incident.description || 'Описание недоступно'}`,
          timestamp: new Date(incident.incident_time)
        });
      }
    });

    // Алерты по обслуживанию
    if (maintenance.length > 3) {
      newAlerts.push({
        id: 'maintenance-overload',
        type: 'warning',
        title: 'Высокая нагрузка на обслуживание',
        message: `Активно ${maintenance.length} работ по обслуживанию`,
        timestamp: new Date()
      });
    }

    // Алерты по рейсам
    const delayedFlights = flights.filter((f: any) => f.status === 'Delayed');
    if (delayedFlights.length > 0) {
      newAlerts.push({
        id: 'delayed-flights',
        type: 'info',
        title: 'Задержанные рейсы',
        message: `${delayedFlights.length} рейсов задержано`,
        timestamp: new Date()
      });
    }

    setAlerts(newAlerts);
  };

  // Запускаем генерацию алертов при изменении данных
  useEffect(() => {
    generateAlerts();
  }, [incidents, maintenance, flights]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '📢';
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-blue-500 bg-blue-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Уведомления</h3>
        <div className="text-gray-500 text-center py-4">
          Нет активных уведомлений
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Уведомления</h3>
      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-xl">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {alert.timestamp.toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 