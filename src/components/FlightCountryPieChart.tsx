"use client";
import { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  countries: string[];
  data: Record<string, { departures: number; arrivals: number }>;
}

export default function FlightCountryPieChart({ countries, data }: Props) {
  const [country, setCountry] = useState(countries[0] || "");
  const stats = data[country] || { departures: 0, arrivals: 0 };

  return (
    <div className="bg-white rounded shadow p-4 flex flex-col items-center flex-1 h-full">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
        <h2 className="font-semibold text-lg text-gray-900">Вылеты/прилёты по стране</h2>
        <select
          className="px-3 py-2 border rounded text-gray-900 max-w-xs"
          value={country}
          onChange={e => setCountry(e.target.value)}
        >
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="w-full h-40 flex items-center justify-center">
        <Pie
          data={{
            labels: ["Вылеты", "Прилёты"],
            datasets: [
              {
                data: [stats.departures, stats.arrivals],
                backgroundColor: ["#3b82f6", "#22c55e"],
              },
            ],
          }}
          options={{ plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false }}
          height={160}
        />
      </div>
    </div>
  );
} 