"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import React from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TopAirportsBarChartProps {
  data: { name: string; count: number }[];
}

export default function TopAirportsBarChart({ data }: TopAirportsBarChartProps) {
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col items-center flex-1 h-full">
      <h2 className="font-semibold text-lg text-gray-900 mb-4">ТОП-5 аэропортов по пассажирам</h2>
      <div className="w-full h-40 flex items-center justify-center">
        <Bar
          data={{
            labels: data.map((d) => d.name),
            datasets: [
              {
                label: "Пассажиры",
                data: data.map((d) => d.count),
                backgroundColor: "#3b82f6",
                borderRadius: 8,
                barThickness: 24,
              },
            ],
          }}
          options={{
            indexAxis: "y" as const,
            plugins: {
              legend: { display: false },
              title: { display: false },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                beginAtZero: true,
                ticks: { color: "#64748b" },
                grid: { color: "#e5e7eb" },
              },
              y: {
                ticks: { color: "#334155" },
                grid: { color: "#e5e7eb" },
              },
            },
          }}
          height={160}
        />
      </div>
    </div>
  );
} 