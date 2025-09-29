import React from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement);

export default function ChartRenderer({ chart }) {
  if (!chart) return null;
  try {
    const { type, data } = chart;
    const labels = data.map((d) => d[0]);
    const values = data.map((d) => d[1]);
    const payload = { labels, datasets: [{ label: chart.y || 'value', data: values }] };
    return type === 'line' ? <Line data={payload} /> : <Bar data={payload} />;
  } catch (e) {
    return <div>Invalid chart data</div>;
  }
}
