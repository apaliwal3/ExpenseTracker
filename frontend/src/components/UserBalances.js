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
  }, []);

  const fetchTotals = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/expenses/shared-expenses/user-totals`);
      setTotals(res.data);
      setSettlements(calculateSettlements(res.data));
    } catch (err) {
      console.error('Failed to load user balances:', err);
    }
  };

  const calculateSettlements = (users) => {
    const creditors = [];
    const debtors = [];

    users.forEach(user => {
      const balance = Number(Number(user.net_balance).toFixed(2));
      if (balance > 0) creditors.push({ ...user, balance });
      else if (balance < 0) debtors.push({ ...user, balance: -balance });
    });

    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => b.balance - a.balance);

    const transactions = [];
    let tid = 0;

    while (creditors.length && debtors.length) {
      const creditor = creditors[0];
      const debtor = debtors[0];
      const amount = Math.min(creditor.balance, debtor.balance);

      transactions.push({
        id: ++tid,
        from: debtor.name,
        from_id: debtor.user_id,
        to: creditor.name,
        to_id: creditor.user_id,
        amount,
      });

      creditor.balance -= amount;
      debtor.balance -= amount;

      if (creditor.balance < 0.01) creditors.shift();
      if (debtor.balance < 0.01) debtors.shift();
    }

    return transactions;
  };

  const handleMarkAsPaid = async (txn) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/settlements`, {
        owed_by: txn.from_id,
        paid_to: txn.to_id,
        amount: txn.amount,
        expense_id: txn.expense_id,
      });

      setSettled(prev => [...prev, txn]);
      setSettlements(prev => prev.filter(t => t.id !== txn.id));
      fetchTotals();
    } catch (err) {
      console.error('Failed to save settlement:', err);
    }
  };

  return (
    <div className="container py-4" style={{ fontFamily: '"Instrument Sans", sans-serif' }}>
      <h2 className="mb-4">User Balances</h2>

      {/* User Balance Cards Grid */}
      <div className="tiles-container mb-4">
        {totals.map(user => (
          <div 
            key={user.user_id} 
            className={`tile balance-tile ${
              user.net_balance > 0 ? 'balance-positive' : 
              user.net_balance < 0 ? 'balance-negative' : 
              'balance-neutral'
            }`}
          >
            <div className="balance-header">
              <h4 className="balance-name">{user.name}</h4>
              <div className={`balance-amount ${
                user.net_balance > 0 ? 'text-success' : 
                user.net_balance < 0 ? 'text-danger' : 
                'text-muted'
              }`}>
                {user.net_balance >= 0 ? '+' : ''}${Number(user.net_balance).toFixed(2)}
              </div>
            </div>
            <div className="balance-details">
              <div className="balance-detail-item">
                <span className="label">Total Paid:</span>
                <span className="value">${Number(user.total_paid).toFixed(2)}</span>
              </div>
              <div className="balance-detail-item">
                <span className="label">Total Owed:</span>
                <span className="value">${Number(user.total_owed).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settlement Suggestions */}
      {settlements.length > 0 && (
        <div className="mb-4">
          <h4 className="fw-semibold mb-3">Settle Up Suggestions</h4>
          <div className="settlement-cards">
            {settlements.map(txn => (
              <div key={txn.id} className="tile settlement-tile">
                <div className="settlement-content">
                  <div className="settlement-text">
                    <strong>{txn.from}</strong> pays <strong>{txn.to}</strong>
                  </div>
                  <div className="settlement-amount">
                    ${txn.amount.toFixed(2)}
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm settlement-btn"
                  onClick={() => handleMarkAsPaid(txn)}
                >
                  Mark as Paid
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settled Payments */}
      {settled.length > 0 && (
        <div className="mt-4">
          <button
            className="btn btn-link fw-semibold"
            onClick={() => setShowSettled(prev => !prev)}
          >
            {showSettled ? 'Hide' : 'Show'} Settled Payments ({settled.length})
          </button>

          {showSettled && (
            <div className="settled-cards mt-3">
              {settled.map(txn => (
                <div key={txn.id} className="tile settled-tile">
                  <div className="settlement-content">
                    <div className="settlement-text">
                      <strong>{txn.from}</strong> paid <strong>{txn.to}</strong>
                    </div>
                    <div className="settlement-amount">
                      ${txn.amount.toFixed(2)}
                    </div>
                  </div>
                  <span className="badge bg-success">Settled</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserBalances;