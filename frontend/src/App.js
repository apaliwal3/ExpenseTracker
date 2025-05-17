import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UserBalances from './components/UserBalances';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/balances" element={<UserBalances />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
