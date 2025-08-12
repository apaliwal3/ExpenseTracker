import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Modal, Button} from 'react-bootstrap';
import '../styles/MySpending.css';
import { TbAlertCircleFilled } from "react-icons/tb";
import SpendingTrendsChart from './SpendingTrendsChart';
import axiosInstance from '../api/AxiosInstance';

const MySpending = ({userId = 1, userName = "User" }) => {
  const [summary, setSummary] = useState([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [trendData, setTrendData] = useState({});
  const [anomalies, setAnomalies] = useState([]);
  const [categoryDrift, setCategoryDrift] = useState([]);
  const [currentDriftIndex, setCurrentDriftIndex] = useState(0);
  const [viewMode, setViewMode] = useState('involved');

  useEffect(() => {
    const fetchSpending = async () => {
      try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/spending`);
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

  const involvedTransactions = transactions;
  const paidTransactions = transactions.filter(txn =>
    txn.user_id === userId || txn.paid_by === userId
  );

  const visibleTransactions = viewMode === 'paid' ? paidTransactions : involvedTransactions;
  const preview = visibleTransactions.slice(0, 5);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/spending-trends`);
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
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/spending-anomalies`);
        setAnomalies(res.data || []);
      } catch (err) {
        console.error('Failed to fetch anomalies:', err);
      }
    };
    fetchAnomalies();
  }, [userId]);

  useEffect(() => {
    const fetchCategoryDrift = async () => {
      try {
        const res = await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/category-drift`);
        setCategoryDrift(res.data || []);
      } catch (err) {
        console.error('Failed to fetch category drift:', err);
      }
    };
    fetchCategoryDrift();
  }, [userId]);

  return (
    <div className="container py-4" style={{ fontFamily: '"Instrument Sans", sans-serif' }}>
      <h2 className="mb-4">Hello {userName}!</h2>

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
        <div className="tile spending-breakdown-tile">
          <h5 className="fw-semibold">Spending Breakdown</h5>
          <div className="mt-2">
            <div><strong>Personal Expenses:</strong> ${Number(summary.total_paid).toFixed(2)}</div>
            <div><strong>Owed to You:</strong> ${Number(summary.total_reimbursed).toFixed(2)}</div>
            <div><strong>You Owe Others:</strong> ${Number(summary.total_owed).toFixed(2)}</div>
            <div><strong>You Paid for Others:</strong> ${Number(summary.total_shared_paid).toFixed(2)}</div>
          </div>
        </div>

        {/* Chart Tile */}
        {Object.keys(trendData).length > 0 && (
          <div className="tile chart-tile">
            <SpendingTrendsChart trendsData={trendData} />
          </div>
        )}

        {/* Spending Anomalies Tiles */}
        {anomalies.length === 0 ? (
          <div className="tile no-anomalies-tile">
            <div className="anomaly-section-title">Spending Anomalies</div>
            <div style={{ color: '#198754', fontWeight: '600' }}>No anomalies to report</div>
          </div>
        ) : (
          anomalies.map((a, idx) => (
            <div 
              className={`tile anomaly-tile ${a.type === 'Spike' ? 'anomaly-spike' : 'anomaly-drop'}`} 
              key={idx}
            >
              <div className="anomaly-section-title">Spending Anomalies</div>
              <div className="anomaly-category">{a.category}</div>
              <div className="anomaly-content">
                <div><strong>Month:</strong> {new Date(a.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <div><strong>Amount:</strong> <span className="anomaly-amount">${a.amount.toFixed(2)}</span></div>
                <div><strong>Type:</strong> <span className="anomaly-type">{a.type}</span></div>
                <div className="z-score">
                  Z-Score: {parseFloat(a.z_score).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Category Drift Tiles - Multi-page */}
        {categoryDrift.length > 0 && (
          <div className="tile drift-tile">
            <div className="drift-content">
              {categoryDrift[currentDriftIndex] && (() => {
                const item = categoryDrift[currentDriftIndex];
                const formatShiftText = (category, percentChange) => {
                  const absChange = Math.abs(percentChange);
                  
                  if (percentChange > 0) {
                    return (
                      <span>
                        Your spending on <strong>{category}</strong> is up{' '}
                        <strong style={{ color: '#2563eb' }}>{absChange}%</strong> this month
                      </span>
                    );
                  } else if (percentChange < 0) {
                    return (
                      <span>
                        You have spent{' '}
                        <strong style={{ color: '#2563eb' }}>{absChange}%</strong> less on{' '}
                        <strong>{category}</strong> this month compared to last month
                      </span>
                    );
                  } else {
                    return (
                      <span>
                        Your <strong>{category}</strong> spending remained the same this month
                      </span>
                    );
                  }
                };

                return (
                  <div className="drift-item">
                    <div className="drift-text">
                      {formatShiftText(item.category, item.percent_change)}
                    </div>
                  </div>
                );
              })()}
            </div>
                <div className="drift-navigation">
                  <button 
                    className="drift-nav-btn"
                    onClick={() => setCurrentDriftIndex(prev => 
                      prev === 0 ? categoryDrift.length - 1 : prev - 1
                    )}
                    disabled={categoryDrift.length <= 1}
                  >
                    ‹
                  </button>
                  <span className="drift-indicator">
                    {currentDriftIndex + 1} / {categoryDrift.length}
                  </span>
                  <button 
                    className="drift-nav-btn"
                    onClick={() => setCurrentDriftIndex(prev => 
                      prev === categoryDrift.length - 1 ? 0 : prev + 1
                    )}
                    disabled={categoryDrift.length <= 1}
                  >
                    ›
                  </button>
                </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="fw-semibold">My Transactions</h4>
        <div>
          <button
            className={`btn btn-sm me-2 ${viewMode === 'involved' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('involved')}
          >
            Involved
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'paid' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('paid')}
          >
            Paid
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Cost</th>
              <th>Description</th>
              <th>Date</th>
              <th>Type</th>
              <th>Created By</th>
              <th>Shared With</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleTransactions.map((txn, idx) => (
              <tr key={idx}>
                <td>${Number(txn.amount).toFixed(2)}</td>
                <td>{txn.description || '—'}</td>
                <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${txn.type === 'shared' ? 'bg-primary' : 'bg-secondary'}`}>
                    {txn.type}
                  </span>
                </td>
                <td>{txn.created_by || '—'}</td>
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
                {visibleTransactions.map((txn, idx) => (
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