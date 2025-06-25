import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';
import GroupSpending from './components/GroupSpending';
import UserBalances from './components/UserBalances';
import MySpending from './components/MySpending';
import Login from './components/Login';
import Signup from './components/Signup';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowModal(false);
  };

  const location = window.location.pathname;
  const isAuthPage = location === '/login' || location === '/signup';

  return (
    <Router>
      {!isAuthPage && (
        <nav className="d-flex justify-content-between align-items-center py-3 border-bottom px-4">
          <div className="fs-4 fw-bold">Expense Tracker</div>
          <div>
            <Link to="/" className="me-4 text-decoration-none text-dark">🏠 My Dashboard</Link>
            <Link to="/balances" className="text-decoration-none text-dark">👤 User Balances</Link>
            <Link to="/group-spending" className="ms-4 text-decoration-none text-dark">💰 All Spending</Link>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>
              {user?.name || 'User'}
            </span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ccc' }}></div>
          </div>
        </nav>
      )}

      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login setUser={setUser} />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <Signup setUser={setUser} />}
        />
        <Route
          path="/"
          element={user ? <MySpending userId={user.id} /> : <Navigate to="/login" />}
        />
        <Route
          path="/balances"
          element={user ? <UserBalances /> : <Navigate to="/login" />}
        />
        <Route
          path="/group-spending"
          element={user ? <GroupSpending /> : <Navigate to="/login" />}
        />
      </Routes>

      {/* Profile Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Name:</strong> {user?.name}</p>
          <Button variant="danger" onClick={handleLogout}>Logout</Button>
        </Modal.Body>
      </Modal>
    </Router>
  );
};

export default App;
