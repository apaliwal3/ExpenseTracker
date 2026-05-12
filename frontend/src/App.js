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
import { AuthProvider } from './context/AuthContext';
import Avatar from 'boring-avatars';

const AppWrapper = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Listen for token removal (from axios interceptor)
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (!token || !savedUser) {
        setUser(null);
        if (!isAuthPage) {
          navigate('/login?session=expired');
        }
      }
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (when axios interceptor clears token)
    window.addEventListener('storage', checkAuth);
    
    // Custom event for same-tab logout
    window.addEventListener('logout', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('logout', checkAuth);
    };
  }, [navigate, isAuthPage]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowModal(false);
    window.dispatchEvent(new Event('logout'));
  };

  return (
    <>
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
            <div style={{ cursor: 'pointer' }} onClick={() => setShowModal(true)}>
              <Avatar
                size={32}
                name={user?.name || 'User'}
                variant="beam"
                colors={['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']}
              />
            </div>
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
          element={user ? <MySpending userId={user.id} userName={user.name}/> : <Navigate to="/login" />}
        />
        <Route
          path="/balances"
          element={user ? <UserBalances /> : <Navigate to="/login" />}
        />
        <Route
          path="/group-spending"
          element={user ? <GroupSpending /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center mb-3">
            <Avatar
              size={56}
              name={user?.name || 'User'}
              variant="beam"
              colors={['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']}
            />
            <div className="ms-3">
              <div className="fw-semibold">{user?.name || 'User'}</div>
            </div>
          </div>
          <Button variant="danger" onClick={handleLogout}>Logout</Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppWrapper />
    </Router>
  </AuthProvider>
);

export default App;
