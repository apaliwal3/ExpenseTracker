import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GroupSpending from './components/GroupSpending';
import UserBalances from './components/UserBalances';
import MySpending from './components/MySpending';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {

  return (
    <Router>
      <div className="container py-4" style={{ fontFamily: '"Instrument Sans", sans-serif' }}>
        <nav className="d-flex justify-content-between align-items-center py-3 border-bottom">
          <div className="fs-4 fw-bold">Expense Tracker</div>
          <div>
            <Link to="/" className="me-4 text-decoration-none text-dark">🏠 My Dashboard</Link>
            <Link to="/balances" className="text-decoration-none text-dark">👤 User Balances</Link>
            <Link to="/group-spending" className="ms-4 text-decoration-none text-dark">💰 All Spending</Link>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">Username</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc' }}></div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<MySpending />} />
          <Route path="/balances" element={<UserBalances />} />
          <Route path="/group-spending" element={<GroupSpending />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
