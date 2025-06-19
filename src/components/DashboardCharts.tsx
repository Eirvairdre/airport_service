"use client";
import { Pie } from "react-chartjs-2";

// Компонент для отображения круговых диаграмм на дашборде
// Показываю статистику по рейсам и инцидентам
export default function DashboardCharts({
  statusData,
  statusColors,
  severityData,
  severityColors,
}: {
  statusData: number[];
  statusColors: string[];
  severityData?: number[];
  severityColors?: string[];
}) {
  return (
    <div className="grid md:grid-cols-1 gap-8">
      {/* Диаграмма статусов рейсов */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-semibold text-lg mb-4 text-gray-900">Статусы рейсов</h2>
        <div className="w-full h-56 flex items-center justify-center">
          <Pie
            data={{
              labels: ["Запланирован", "Задержан", "Отменён", "Завершён"],
              datasets: [
                {
                  data: statusData,
                  backgroundColor: statusColors,
                },
              ],
            }}
            options={{ 
              plugins: { 
                legend: { position: "bottom" } 
              }, 
              maintainAspectRatio: false 
            }}
            height={220}
          />
        </div>
      </div>
      
      {/* Диаграмма уровней инцидентов - показываю только если есть данные */}
      {severityData && severityColors && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="font-semibold text-lg mb-4 text-gray-900">Уровни инцидентов</h2>
          <div className="w-full h-56 flex items-center justify-center">
            <Pie
              data={{
                labels: ["Низкий", "Средний", "Высокий", "Критический"],
                datasets: [
                  {
                    data: severityData,
                    backgroundColor: severityColors,
                  },
                ],
              }}
              options={{ 
                plugins: { 
                  legend: { position: "bottom" } 
                }, 
                maintainAspectRatio: false 
              }}
              height={220}
            />
          </div>
        </div>
      )}
    </div>
  );
} 