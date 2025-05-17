import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UserBalances.css';

const UserBalances = () => {
  const [totals, setTotals] = useState([]);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/expenses/shared-expenses/user-totals');
        setTotals(res.data);
      } catch (err) {
        console.error('Failed to load user balances:', err);
      }
    };

    fetchTotals();
  }, []);

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
    </div>
  );
};

export default UserBalances;
