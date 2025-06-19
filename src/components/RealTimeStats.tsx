"use client";
import { useEffect, useState } from "react";

interface RealTimeStatsProps {
  nearestFlights: any[];
  lastIncidents: any[];
  needMaintenance: any[];
}

export default function RealTimeStats({ nearestFlights, lastIncidents, needMaintenance }: RealTimeStatsProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const todayFlights = nearestFlights.filter((f: any) => {
    const today = new Date();
    const flightDate = new Date(f.scheduled_departure);
    return flightDate.toDateString() === today.toDateString();
  });

  const activeIncidents = lastIncidents.filter((i: any) => {
    const incidentDate = new Date(i.incident_time);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - incidentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Инциденты за последнюю неделю
  });

  // Функция для определения цвета инцидентов
  const getIncidentColor = () => {
    const criticalIncidents = activeIncidents.filter((i: any) => i.severity === 'Critical').length;
    const highIncidents = activeIncidents.filter((i: any) => i.severity === 'High').length;
    
    if (criticalIncidents > 0) return 'text-red-700';
    if (highIncidents > 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Сегодняшние рейсы</h3>
        <div className="text-2xl font-bold text-blue-600">
          {todayFlights.length}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Обновлено: {currentTime.toLocaleTimeString('ru-RU')}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Активные инциденты</h3>
        <div className={`text-2xl font-bold ${getIncidentColor()}`}>
          {activeIncidents.length}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          За последние 7 дней
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Требует обслуживания</h3>
        <div className="text-2xl font-bold text-orange-600">
          {needMaintenance.length}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Активные работы
        </div>
      </div>
    </div>
  );
} 