import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Modal, Button} from 'react-bootstrap';
import '../styles/MySpending.css';
import { TbAlertCircleFilled } from "react-icons/tb";

const MySpending = ({userId = 1}) => {
  const [summary, setSummary] = useState([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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

  return (
    <div className="container py-4" style={{ fontFamily: '"Instrument Sans", sans-serif' }}>
      <h2 className="mb-4">Hello Username!</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary shadow">
            <div className="card-body">
              <h5 className="card-title">Net Outflow</h5>
              <h2 className="fw-bold">${netOutflow}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h5 className="text-primary fw-bold">{topCategory}</h5>
              <p className="mb-0">is your top category this month</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h6 className="text-primary">Shared Paid:</h6>
              <h5 className="fw-bold">${sharedPaid}</h5>
              <h6 className="text-primary mt-3">Reimbursed:</h6>
              <h5 className="fw-bold">${reimbursed}</h5>
            </div>
          </div>
        </div>
      </div>

      <h4 className="mb-3 fw-semibold">All Transactions</h4>
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
          <Modal.Title>All Transactions</Modal.Title>
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