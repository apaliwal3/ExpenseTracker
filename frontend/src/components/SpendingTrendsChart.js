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

const SpendingTrendsChart = ({ trendsData }) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  if (!trendsData?.trends) return null;

  const { trends, forecast, months } = trendsData;
  const categories = Object.keys(trends);
  if (categories.length === 0) return null;

  const currentCategory = categories[currentCategoryIndex];
  const categoryTrends = trends[currentCategory] || {};

  console.log('Current category:', currentCategory);
  console.log('Category trends:', categoryTrends);

  // Normalize months
  const normalizedMonths = months.map(m => m.trim());
  const mainData = [];
  const forecastData = [];

  normalizedMonths.forEach((month, idx) => {
    // Fix: Access the amount directly from categoryTrends object
    const amount = categoryTrends[month] || 0;
    const isForecastMonth = forecast && month === forecast.month;

    console.log(`Month: ${month}, Amount: ${amount}, IsForecast: ${isForecastMonth}`);

    if (isForecastMonth) {
      mainData.push(null);
      forecastData.push(amount);
    } else {
      mainData.push(amount);
      forecastData.push(null);
    }
  });

  console.log('Available months:', normalizedMonths);

  const connectionData = normalizedMonths.map((month, idx) => {
    const isForecastMonth = forecast && month === forecast.month;
    const isBeforeForecast = idx === normalizedMonths.indexOf(forecast?.month) - 1;

    if (isForecastMonth || isBeforeForecast) {
      return categoryTrends[month] || 0;
    }
    return null;
  });

  const data = {
    labels: normalizedMonths,
    datasets: [
      {
        label: currentCategory,
        data: mainData,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        borderColor: COLORS[currentCategoryIndex % COLORS.length],
        backgroundColor: COLORS[currentCategoryIndex % COLORS.length],
        pointRadius: 4,
        hoverBorderWidth: 3,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: COLORS[currentCategoryIndex % COLORS.length],
        pointHoverBorderColor: '#fff'
      },
      ...(forecast && forecastData.some(v => v !== null) ? [{
        label: 'Forecast',
        data: connectionData,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        borderColor: COLORS[currentCategoryIndex % COLORS.length],
        backgroundColor: COLORS[currentCategoryIndex % COLORS.length],
        borderDash: [8, 5],
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: COLORS[currentCategoryIndex % COLORS.length],
        pointHoverBorderColor: '#fff',
        pointStyle: 'circle'
      }] : [])
    ]
  };

  const totalSpending = Object.entries(categoryTrends)
    .filter(([month]) => !forecast || month.trim() !== forecast.month)
    .reduce((sum, [, amount]) => sum + (parseFloat(amount) || 0), 0);

  console.log('Total spending calculated:', totalSpending);

  const historicalMonths = Object.entries(categoryTrends)
    .filter(([month]) => !forecast || month.trim() !== forecast.month);
  const avgSpending = historicalMonths.length > 0 ? totalSpending / historicalMonths.length : 0;

  const categoryForecast = parseFloat(forecast?.categoryForecasts?.[currentCategory]) || 0;

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        filter: item => item.raw !== null,
        callbacks: {
          label: context => {
            const value = context.raw;
            if (value == null) return null;

            const label = [];
            const isForecastMonth = forecast && context.label === forecast.month;
            label.push(`${isForecastMonth ? 'Projected' : 'Amount'}: $${value.toFixed(2)}`);

            if (!isForecastMonth && context.dataIndex > 0) {
              const prevMonth = normalizedMonths[context.dataIndex - 1];
              const prevVal = categoryTrends[prevMonth];
              if (prevVal !== undefined && !isNaN(prevVal)) {
                const diff = value - parseFloat(prevVal);
                const sign = diff >= 0 ? '+' : '';
                label.push(`Change: ${sign}$${diff.toFixed(2)}`);
              }
            }

            return label;
          },
          title: context => {
            const month = context[0].label;
            const isForecastMonth = forecast && month === forecast.month;
            return `📅 ${month}${isForecastMonth ? ' (Forecast)' : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, family: '"Instrument Sans", sans-serif' },
          color: '#666'
        }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { display: false }
      }
    },
    elements: {
      line: { tension: 0.4, borderWidth: 2 },
      point: { radius: 4, hitRadius: 10, hoverRadius: 6, hoverBorderWidth: 2 }
    }
  };

  return (
    <div className="insight-card shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Spending Trends</h6>
        <div className="d-flex align-items-center">
          <button className="btn btn-sm btn-outline-secondary me-2"
            onClick={() => setCurrentCategoryIndex(i => (i === 0 ? categories.length - 1 : i - 1))}
          >←</button>
          <span className="text-muted">{currentCategoryIndex + 1} / {categories.length}</span>
          <button className="btn btn-sm btn-outline-secondary ms-2"
            onClick={() => setCurrentCategoryIndex(i => (i === categories.length - 1 ? 0 : i + 1))}
          >→</button>
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
          {categoryForecast > 0 && (
            <div>
              <small className="text-muted">Next Month Forecast</small>
              <h6 className="mb-0 text-primary">${categoryForecast.toFixed(2)}</h6>
            </div>
          )}
        </div>
      </div>

      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SpendingTrendsChart;
