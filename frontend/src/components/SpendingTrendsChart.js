import React, { useState } from 'react';
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
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const categories = Object.keys(trends);
  const months = [...new Set(Object.values(trends).flat().map(t => t.month))];

  const formattedMonths = months.map(month => {
    const date = new Date(month);
    return date.toLocaleString('default', { month: 'short' });
  });

  const currentCategory = categories[currentCategoryIndex];
  const categoryData = trends[currentCategory];

  const data = {
    labels: formattedMonths,
    datasets: [{
      label: currentCategory,
      data: months.map(month =>
        categoryData.find(e => e.month === month)?.amount || 0
      ),
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      borderColor: COLORS[currentCategoryIndex % COLORS.length],
      pointRadius: 0,
      hoverBorderWidth: 3,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: COLORS[currentCategoryIndex % COLORS.length],
      pointHoverBorderColor: '#fff'
    }]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { 
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function (context) {
            const current = context.raw;
            const dataset = context.dataset.data;
            const index = context.dataIndex;

            // Calculate difference from previous month
            const previous = index > 0 ? dataset[index - 1] : null;
            const change = previous !== null ? (current - previous).toFixed(2) : null;

            let label = [`Amount: $${current.toFixed(2)}`];

            if (change !== null) {
              const sign = change >= 0 ? '+' : '';
              label.push(`Change: ${sign}$${change}`);
            }

            return label;
          },
          title: function (context) {
            return `📅 ${context[0].label}`;
          }
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          display: true,
          font: {
            size: 11,
            family: '"Instrument Sans", sans-serif'
          },
          color: '#666'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          display: false
        }
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 2
      }
    }
  };

  const handlePrevious = () => {
    setCurrentCategoryIndex((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentCategoryIndex((prev) => (prev === categories.length - 1 ? 0 : prev + 1));
  };

  // Calculate total spending for current category
  const totalSpending = categoryData.reduce((sum, entry) => sum + entry.amount, 0);
  
  // Calculate average monthly spending
  const avgSpending = totalSpending / categoryData.length;

  return (
    <div className="insight-card shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Spending Trends</h6>
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={handlePrevious}
          >
            ←
          </button>
          <span className="text-muted">
            {currentCategoryIndex + 1} / {categories.length}
          </span>
          <button 
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={handleNext}
          >
            →
          </button>
        </div>
      </div>
      
      <div className="category-info mb-3">
        <h5 className="text-primary mb-2">{currentCategory}</h5>
        <div className="d-flex justify-content-between">
          <div>
            <small className="text-muted">Total Spending</small>
            <h6 className="mb-0">${totalSpending.toFixed(2)}</h6>
          </div>
          <div>
            <small className="text-muted">Monthly Average</small>
            <h6 className="mb-0">${avgSpending.toFixed(2)}</h6>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SpendingTrendsChart;