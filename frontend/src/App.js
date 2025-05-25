import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UserBalances from './components/UserBalances';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import axios from 'axios';

const App = () => {
  const [settledExpenseIds, setSettledExpenseIds] = useState(new Set());

  useEffect(() => {
    const fetchSettledExpenses = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/settlements');
        const ids = new Set(res.data.map(r => r.expense_id));
        setSettledExpenseIds(ids);
      } catch (err) {
        console.error('Failed to fetch settled expenses:', err);
      }
    };

    fetchSettledExpenses();
  }, []);

  return (
    <Router>
      <div className="container py-4" style={{ fontFamily: '"Instrument Sans", sans-serif' }}>
        <nav className="d-flex justify-content-between align-items-center py-3 border-bottom">
          <div className="fs-4 fw-bold">Expense Tracker</div>
          <div>
            <Link to="/" className="me-4 text-decoration-none text-dark">🏠 Home</Link>
            <Link to="/balances" className="text-decoration-none text-dark">👤 User Balances</Link>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">Username</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc' }}></div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard settledExpenseIds={settledExpenseIds} />} />
          <Route path="/balances" element={<UserBalances />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
