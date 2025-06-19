"use client";
import React, { useEffect, useRef, useState } from "react";

interface Flight {
  flight_id: number;
  flight_number: string;
  scheduled_departure: Date;
  airline?: { name: string };
  departureAirport?: { name: string };
  arrivalAirport?: { name: string };
}

interface Incident {
  incident_id: number;
  severity: string;
  description?: string;
  incident_time: Date;
  flight?: {
    flight_number: string;
    airline?: { name: string };
    departureAirport?: { name: string };
    arrivalAirport?: { name: string };
  };
  personnel?: { name: string };
}

interface Maintenance {
  maintenance_id: number;
  description?: string;
  aircraft?: {
    tail_number: string;
    airline?: { name: string };
    aircraft_type?: { model: string };
  };
  personnel?: { name: string };
}

interface Checkin {
  checkin_id: number;
  checkin_time: Date;
  ticket?: {
    passenger?: { name: string; passport_number: string };
    flight?: {
      flight_number: string;
      airline?: { name: string };
      departureAirport?: { name: string };
      arrivalAirport?: { name: string };
    };
  };
}

interface Props {
  nearestFlights: Flight[];
  lastIncidents: Incident[];
  needMaintenance: Maintenance[];
  recentCheckins: Checkin[];
}

export default function HorizontalWidgets({ nearestFlights, lastIncidents, needMaintenance, recentCheckins }: Props) {
  // Функция для определения цвета инцидента
  const getIncidentColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'border-green-500';
      case 'medium': return 'border-yellow-500';
      case 'high': return 'border-red-500';
      case 'critical': return 'border-red-600';
      default: return 'border-gray-500';
    }
  };

  // Функция для определения цвета текста инцидента
  const getIncidentTextColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      case 'critical': return 'text-red-700';
      default: return 'text-gray-600';
    }
  };

  // Массив виджетов
  const widgets = [
    {
      key: "flights",
      content: (
        <div className="flex-1 min-w-[400px] bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 flex-shrink-0">Ближайшие рейсы</h2>
          {nearestFlights.length === 0 ? (
            <div className="text-gray-500 flex-1 flex items-center justify-center">Нет запланированных рейсов</div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ul className="text-sm space-y-3">
                {nearestFlights.map((f: Flight) => (
                  <li key={f.flight_id} className="border-l-4 border-blue-500 pl-3">
                    <div className="font-semibold text-blue-600">{f.flight_number}</div>
                    <div className="text-gray-600">{f.airline?.name || "-"}</div>
                    <div className="text-gray-500 text-xs">
                      {f.departureAirport?.name || "-"} → {f.arrivalAirport?.name || "-"}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(f.scheduled_departure).toLocaleString('ru-RU')}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "incidents",
      content: (
        <div className="flex-1 min-w-[400px] bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 flex-shrink-0">Последние инциденты</h2>
          {lastIncidents.length === 0 ? (
            <div className="text-gray-500 flex-1 flex items-center justify-center">Нет инцидентов</div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ul className="text-sm space-y-3">
                {lastIncidents.map((i: Incident) => (
                  <li key={i.incident_id} className={`border-l-4 ${getIncidentColor(i.severity)} pl-3`}>
                    <div className={`font-semibold ${getIncidentTextColor(i.severity)}`}>{i.severity}</div>
                    <div className="text-gray-600">{i.description?.slice(0, 50) || "-"}</div>
                    <div className="text-gray-500 text-xs">
                      Рейс: {i.flight?.flight_number || "-"}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(i.incident_time).toLocaleString('ru-RU')}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "maintenance",
      content: (
        <div className="flex-1 min-w-[400px] bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 flex-shrink-0">Требуется обслуживание</h2>
          {needMaintenance.length === 0 ? (
            <div className="text-gray-500 flex-1 flex items-center justify-center">Нет активных работ по обслуживанию</div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ul className="text-sm space-y-3">
                {needMaintenance.map((m: Maintenance) => (
                  <li key={m.maintenance_id} className="border-l-4 border-orange-500 pl-3">
                    <div className="font-semibold text-orange-600">
                      {m.aircraft?.tail_number || "-"}
                    </div>
                    <div className="text-gray-600">
                      {m.aircraft?.aircraft_type?.model || "-"} ({m.aircraft?.airline?.name || "-"})
                    </div>
                    <div className="text-gray-500 text-xs">
                      {m.description?.slice(0, 50) || "-"}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Ответственный: {m.personnel?.name || "-"}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "checkins",
      content: (
        <div className="flex-1 min-w-[400px] bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 flex-shrink-0">Последние регистрации</h2>
          {recentCheckins.length === 0 ? (
            <div className="text-gray-500 flex-1 flex items-center justify-center">Нет регистраций</div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ul className="text-sm space-y-3">
                {recentCheckins.map((c: Checkin) => (
                  <li key={c.checkin_id} className="border-l-4 border-green-500 pl-3">
                    <div className="font-semibold text-green-600">
                      {c.ticket?.passenger?.name || "-"}
                    </div>
                    <div className="text-gray-600">
                      Рейс: {c.ticket?.flight?.flight_number || "-"} ({c.ticket?.flight?.airline?.name || "-"})
                    </div>
                    <div className="text-gray-500 text-xs">
                      {c.ticket?.flight?.departureAirport?.name || "-"} → {c.ticket?.flight?.arrivalAirport?.name || "-"}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(c.checkin_time).toLocaleString('ru-RU')}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Дублируем массив для бесшовной прокрутки
  const allWidgets = [...widgets, ...widgets];
  const widgetWidth = 420; // px (min-w + gap)
  const totalWidth = widgetWidth * allWidgets.length;
  const [offset, setOffset] = useState(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    let start: number | null = null;
    const speed = 0.3; // px per frame (замедлил)
    function animate(ts: number) {
      if (start === null) start = ts;
      setOffset((prev) => {
        const next = prev + speed;
        if (next >= widgetWidth * widgets.length) {
          // Сбросить к началу (бесшовно)
          return 0;
        }
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [widgetWidth, widgets.length]);

  return (
    <div className="w-full overflow-hidden mb-8" style={{ height: "320px" }}>
      <div
        className="flex gap-4 items-stretch"
        style={{
          width: totalWidth,
          transform: `translateX(-${offset}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        {allWidgets.map((w, idx) => (
          <div
            key={w.key + idx}
            className="min-w-[400px] flex-1 h-full"
            style={{ maxWidth: widgetWidth - 20 }}
          >
            {w.content}
          </div>
        ))}
      </div>
    </div>
  );
} 