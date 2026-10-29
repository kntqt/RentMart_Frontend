import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ data = [], period = 'month' }) => {
  // Period configuration and fallbacks
  const periodDefaults = {
    year: {
      labels: ['2023', '2024', '2025', '2026'],
      data: [48000, 72000, 96000, 120000],
      datasetLabel: 'Yearly Collections (₱)'
    },
    years: {
      labels: ['2023', '2024', '2025', '2026'],
      data: [48000, 72000, 96000, 120000],
      datasetLabel: 'Yearly Collections (₱)'
    },
    month: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [9000, 12000, 15000, 18000, 21000, 24000],
      datasetLabel: 'Monthly Collections (₱)'
    },
    months: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [9000, 12000, 15000, 18000, 21000, 24000],
      datasetLabel: 'Monthly Collections (₱)'
    },
    weeks: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      data: [12000, 15500, 14000, 18500, 21000],
      datasetLabel: 'Weekly Collections (₱)'
    },
    week: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      data: [12000, 15500, 14000, 18500, 21000],
      datasetLabel: 'Weekly Collections (₱)'
    },
    days: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [2500, 4200, 3800, 6100, 5400, 8900, 7200],
      datasetLabel: 'Daily Collections (₱)'
    },
    day: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [2500, 4200, 3800, 6100, 5400, 8900, 7200],
      datasetLabel: 'Daily Collections (₱)'
    }
  };

  const currentDefault = periodDefaults[period] || periodDefaults.month;

  // Extract labels and revenues safely
  const hasValidData = Array.isArray(data) && data.length > 0;
  const labels = hasValidData
    ? data.map(d => d.label || d.month || d.year || d.week || d.day || d.name)
    : currentDefault.labels;

  const revenues = hasValidData
    ? data.map(d => (d.revenue !== undefined ? d.revenue : (d.amount !== undefined ? d.amount : 0)))
    : currentDefault.data;

  const chartData = {
    labels: labels.length > 0 ? labels : currentDefault.labels,
    datasets: [
      {
        label: currentDefault.datasetLabel,
        data: revenues.length > 0 ? revenues : currentDefault.data,
        borderColor: '#3b82f6',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
        bodyFont: { family: 'Outfit', size: 12 },
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => ` Revenue: ₱${Number(context.parsed.y || 0).toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Outfit' }, color: '#64748b' }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: 'Outfit' },
          color: '#64748b',
          callback: (value) => {
            if (value === 0) return '₱0';
            if (Math.abs(value) >= 1000000) {
              const m = value / 1000000;
              return `₱${m % 1 === 0 ? m : m.toFixed(1)}M`;
            }
            if (Math.abs(value) >= 1000) {
              const k = value / 1000;
              return `₱${k % 1 === 0 ? k : k.toFixed(1)}k`;
            }
            return `₱${value}`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-72">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;
