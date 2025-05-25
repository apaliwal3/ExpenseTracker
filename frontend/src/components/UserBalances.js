import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UserBalances.css';

const UserBalances = () => {
  const [totals, setTotals] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [settled, setSettled] = useState([]);
  const [showSettled, setShowSettled] = useState(false);

  useEffect(() => {
    fetchTotals();
    fetchSuggestions();
    fetchSettled();
  }, []);

  const fetchTotals = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/expenses/shared-expenses/user-totals');
      setTotals(res.data);
    } catch (err) {
      console.error('Failed to load user balances:', err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/settlements/suggestions');
      const suggestions = res.data.map((row, i) => ({
        id: i + 1,
        expense_id: row.expense_id,
        from_id: row.owed_by,
        to_id: row.paid_to,
        from: row.owed_by_name,
        to: row.paid_to_name,
        amount: Number(row.amount)
      }));
      setSettlements(suggestions);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  const fetchSettled = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/settlements');
      const settledList = res.data.map((row, i) => ({
        id: i + 1,
        expense_id: row.expense_id,
        from_id: row.owed_by,
        to_id: row.paid_to,
        from: row.owed_by_name,
        to: row.paid_to_name,
        amount: Number(row.amount),
        settled_at: row.settled_at
      }));
      setSettled(settledList);
    } catch (err) {
      console.error('Failed to load settled debts:', err);
    }
  };

  const handleMarkAsPaid = async (txn) => {
    try {
      await axios.post('http://localhost:5001/api/settlements', {
        owed_by: txn.from_id,
        paid_to: txn.to_id,
        amount: txn.amount,
        expense_id: txn.expense_id
      });

      setSettled(prev => [...prev, txn]);
      setSettlements(prev => prev.filter(t => t.id !== txn.id));
      fetchTotals();
      fetchSuggestions();
    } catch (err) {
      console.error('Failed to save settlement:', err);
    }
  };



  return (
    <div className="user-balances-container">
      <h2 className="user-balances-title">User Balances</h2>
      
      <table className="table table-bordered text-center align-middle">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Total Paid</th>
            <th>Total Owed</th>
            <th>Net Balance</th>
          </tr>
        </thead>
        <tbody>
          {totals.map(user => (
            <tr key={user.user_id}>
              <td className="fw-semibold">{user.name}</td>
              <td>${Number(user.total_paid).toFixed(2)}</td>
              <td>${Number(user.total_owed).toFixed(2)}</td>
              <td className={
                user.net_balance > 0 ? 'text-success fw-bold' :
                user.net_balance < 0 ? 'text-danger fw-bold' :
                'text-muted'
              }>
                {user.net_balance >= 0 ? '+' : ''}${Number(user.net_balance).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {settlements.length > 0 && (
        <div className="mt-5">
          <h4 className="fw-semibold mb-3 text-primary">💸 Settle Up Suggestions</h4>
          <ul className="list-group">
            {settlements.map(txn => (
              <li key={txn.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>{txn.from}</strong> pays <strong>{txn.to}</strong> ${txn.amount.toFixed(2)}
                </span>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleMarkAsPaid(txn)}
                >
                  Mark as Paid
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {settled.length > 0 && (
        <div className="mt-4">
          <button
            className="btn btn-link"
            onClick={() => setShowSettled(prev => !prev)}
          >
            {showSettled ? 'Hide' : 'Show'} Settled Payments ({settled.length})
          </button>

          {showSettled && (
            <ul className="list-group mt-2">
              {settled.map(txn => (
                <li key={txn.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    <strong>{txn.from}</strong> paid <strong>{txn.to}</strong> ${txn.amount.toFixed(2)}
                  </span>
                  <span className="badge bg-success">Settled</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default UserBalances;