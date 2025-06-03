import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js';
import '../styles/MySpending.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const COLORS = [
  '#4e79a7', '#f28e2c', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
  '#9c755f', '#bab0ab'
];

const SpendingTrendsChart = ({ trends }) => {
  const months = [...new Set(Object.values(trends).flat().map(t => t.month))];

  const data = {
    labels: months,
    datasets: Object.entries(trends).map(([category, entries], index) => ({
      label: category,
      data: months.map(month =>
        entries.find(e => e.month === month)?.amount || 0
      ),
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      borderColor: COLORS[index % COLORS.length],
      pointRadius: 0,
      hoverBorderWidth: 3
    }))
  };

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (context) {
          const current = context.raw;
          const dataset = context.dataset.data;
          const index = context.dataIndex;

          // Calculate difference from previous month
          const previous = index > 0 ? dataset[index - 1] : null;
          const change = previous !== null ? (current - previous).toFixed(2) : null;

          let label = `${context.dataset.label}: $${current.toFixed(2)}`;
          if (change !== null) {
            const sign = change >= 0 ? '+' : '';
            const color = change >= 0 ? '🟢' : '🔴';
            label += ` (${color} ${sign}${change})`;
          }

          return label;
        },
        title: function (context) {
          // Show month in tooltip header
          return `Month: ${context[0].label}`;
        },
      },
    },
  },
  scales: {
    x: { // For the x-axis
        ticks: {
          display: false
        }
      },
      y: { // For the y-axis
        ticks: {
          display: false
        }
      },
  },
};


  return (
    <div className="insight-card shadow-sm">
      <h6 className="fw-bold mb-2">Spending Trends</h6>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SpendingTrendsChart;