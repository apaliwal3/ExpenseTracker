import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Modal, Button} from 'react-bootstrap';
import '../styles/MySpending.css';
import { TbAlertCircleFilled } from "react-icons/tb";
import SpendingTrendsChart from './SpendingTrendsChart';

const MySpending = ({userId = 1}) => {
  const [summary, setSummary] = useState([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [trendData, setTrendData] = useState({});
  const [anomalies, setAnomalies] = useState([]);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const fetchSpending = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/users/${userId}/spending`);
        setSummary(res.data);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error('Failed to fetch spending data:', err);
      }
    };

    fetchSpending();
  }, [userId]);

  const topCategory = summary.top_category || 'N/A';
  const netOutflow = summary.net_spent?.toFixed(2) || 0.00;
  const sharedPaid = summary.total_shared_paid?.toFixed(2) || 0.00;
  const reimbursed = summary.total_reimbursed?.toFixed(2) || 0.00;

  const preview = transactions.slice(0, 5);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/users/${userId}/spending-trends`);
        const { trends, forecast, months } = res.data;

        console.log('Raw API response:', res.data);
      
        setTrendData({
          trends: trends,
          forecast: forecast,
          months: months
        });
      } catch (err) {
        console.error('Failed to fetch trends:', err);
      }
    };

    fetchTrends();
  }, [userId]);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/users/${userId}/spending-anomalies`);
        setAnomalies(res.data || []);
      } catch (err) {
        console.error('Failed to fetch anomalies:', err);
      }
    };
    fetchAnomalies();
  }, [userId]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/users/${userId}/spending-forecast`);
        setForecast(res.data);
      } catch (err) {
        console.error('Failed to fetch forecast:', err);
      }
    };
    fetchForecast();
  }, [userId]);

  return (
    <div className="container py-4" style={{ fontFamily: '"Instrument Sans", sans-serif' }}>
      <h2 className="mb-4">Hello Username!</h2>

      {/* Main Tiles Grid */}
      <div className="tiles-container">
        {/* Net Outflow Tile */}
        <div className="tile net-outflow-tile">
          <h4>Net Outflow</h4>
          <h1>${netOutflow}</h1>
        </div>

        {/* Top Category Tile */}
        <div className="tile top-category-tile">
          <h1>{topCategory}</h1>
          <p>is your top category this month</p>
        </div>

        {/* Shared Paid Tile */}
        <div className="tile shared-paid-tile">
          <h5 className="shared-label">Shared Paid:</h5>
          <h5 className="shared-amount">${sharedPaid}</h5>
          <h5 className="shared-label mt-2">Reimbursed:</h5>
          <h5 className="shared-amount">${reimbursed}</h5>
        </div>

        {/* Chart Tile */}
        {Object.keys(trendData).length > 0 && (
          <div className="tile chart-tile">
            <SpendingTrendsChart trendsData={trendData} />
          </div>
        )}

        {/* Spending Anomalies Tiles - Part of main grid */}
        {anomalies.length === 0 ? (
          <div className="tile no-anomalies-tile">
            <div className="anomaly-section-title">Spending Anomalies</div>
            <div>✅ No anomalies to report</div>
          </div>
        ) : (
          anomalies.map((a, idx) => (
            <div className="tile anomaly-tile" key={idx}>
              <div className="anomaly-section-title">Spending Anomalies</div>
              <div className="anomaly-category">{a.category}</div>
              <div className="anomaly-content">
                <div><strong>Month:</strong> {new Date(a.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <div><strong>Amount:</strong> ${a.amount.toFixed(2)}</div>
                <div><strong>Type:</strong> {a.type}</div>
                <div className="z-score">
                  Z-Score: {parseFloat(a.z_score).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}

        {forecast && forecast.forecast ? (
          <div className="tile forecast-tile">
            <h5 style={{ fontWeight: '600' }}>📈 Projected Spending</h5>
            <h2 style={{ fontWeight: '700', color: '#1e40af' }}>
              ${forecast.forecast}
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Based on {forecast.sampleDays} days of data, avg ${forecast.avgDaily}/day
            </p>
          </div>
        ) : (
          <div className="tile forecast-tile">
            <h5 style={{ fontWeight: '600' }}>📈 Projected Spending</h5>
            <p style={{ color: '#6c757d' }}>Not enough data this month to project.</p>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <h4 className="mb-3 fw-semibold">My Transactions</h4>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Cost</th>
              <th>Description</th>
              <th>Date</th>
              <th>Type</th>
              <th>Shared With</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {preview.map((txn, idx) => (
              <tr key={idx}>
                <td>${Number(txn.amount).toFixed(2)}</td>
                <td>{txn.description || '—'}</td>
                <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${txn.type === 'shared' ? 'bg-primary' : 'bg-secondary'}`}>
                    {txn.type}
                  </span>
                </td>
                <td>{txn.shared_with?.join(', ') || '—'}</td>
                <td>
                  <span className={`badge ${txn.settled ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {txn.settled ? 'Settled' : 'Pending'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-none"
                    onClick={() => setSelectedTransaction(txn)}
                  >
                    <TbAlertCircleFilled size={25} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <Button variant="light" className="shadow mt-3" onClick={() => setShowAllModal(true)}>
          Show More +
        </Button>
      </div>

      {/* Full Transactions Modal */}
      <Modal show={showAllModal} onHide={() => setShowAllModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>My Transactions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Cost</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Shared With</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => (
                  <tr key={idx}>
                    <td>${Number(txn.amount).toFixed(2)}</td>
                    <td>{txn.description || '—'}</td>
                    <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${txn.type === 'shared' ? 'bg-primary' : 'bg-secondary'}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td>{txn.shared_with?.join(', ') || '—'}</td>
                    <td>
                      <span className={`badge ${txn.settled ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {txn.settled ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>

      {/* Transaction Detail Modal */}
      <Modal show={!!selectedTransaction} onHide={() => setSelectedTransaction(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <>
              <p><strong>Amount:</strong> ${Number(selectedTransaction.amount).toFixed(2)}</p>
              <p><strong>Description:</strong> {selectedTransaction.description || '—'}</p>
              <p><strong>Category:</strong> {selectedTransaction.category || '—'}</p>
              <p><strong>Date:</strong> {new Date(selectedTransaction.created_at).toLocaleString()}</p>
              <p><strong>Type:</strong> {selectedTransaction.type}</p>
              <p><strong>Shared With:</strong> {selectedTransaction.shared_with?.join(', ') || '—'}</p>
              <p><strong>Status:</strong> {selectedTransaction.settled ? 'Settled ✅' : 'Pending ❌'}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MySpending;