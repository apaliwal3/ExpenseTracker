import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5001/api/auth/signup', {
        name,
        email,
        password
      });

      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/');
    } catch (err) {
      console.error('Signup failed:', err);
      alert(err.response?.data?.error || 'Signup error');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className="form-control" required value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" required type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input className="form-control" required type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary w-100">Sign Up</button>
      </form>
      <p className="mt-3">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Signup;
