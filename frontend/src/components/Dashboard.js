import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GroupedExpenses from './GroupedExpenses';
import ExpenseForm from './ExpenseForm';
import { Modal } from 'react-bootstrap';
import Lottie from 'lottie-react';
import checkAnimation from '../assets/animations/check.json';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [sortOption, setSortOption] = useState('recent');
  const [groupBy, setGroupBy] = useState('category');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [settledExpenseIds, setSettledExpenseIds] = useState(new Set());

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/expenses/categories');
      setCategories(res.data.map(row => row));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchFullySettled = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/settlements/fully-settled');
      setSettledExpenseIds(new Set(res.data));
    } catch (err) {
      console.error('Failed to fetch settled expenses:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, categoriesRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5001/api/expenses'),
          axios.get('http://localhost:5001/api/expenses/categories'),
          axios.get('http://localhost:5001/api/expenses/users'),
        ]);
        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data.map(row => row));
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    fetchFullySettled();
  }, []);

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/expenses/${id}`);
      setExpenses(expenses.filter(exp => exp.id !== id));
      fetchFullySettled();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const date = new Date(exp.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || date >= start) && (!end || date <= end);
  });

  return (
    <div className="dashboard container py-4">
      <div className="filter-bar d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex gap-3">
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control custom-input"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control custom-input"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="d-flex gap-3">
          <div>
            <label className="form-label">Group By</label>
            <select className="form-select custom-select" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
              <option value="category">Category</option>
              <option value="user">Contributor</option>
            </select>
          </div>
          <div>
            <label className="form-label">Sort By</label>
            <select className="form-select custom-select" value={sortOption} onChange={e => setSortOption(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="amount_desc">Amount: High to Low</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary d-flex align-items-center px-4" onClick={() => setShowFormModal(true)}>
          Add <span className="ms-2 fs-4">+</span>
        </button>
      </div>

      <GroupedExpenses
        expenses={filteredExpenses}
        onDelete={handleDeleteExpense}
        groupBy={groupBy}
        sortOption={sortOption}
        settledExpenseIds={settledExpenseIds}
      />

      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ExpenseForm
            onAdd={async () => {
              await fetchExpenses();
              await fetchCategories();
              await fetchFullySettled();
              setShowFormModal(false);
              setShowCheck(true);
              setTimeout(() => setShowCheck(false), 2500);
            }}
            categories={categories}
            fetchCategories={fetchCategories}
            users={users}
          />
        </Modal.Body>
      </Modal>

      {showCheck && (
        <div className="check-overlay">
          <Lottie
            animationData={checkAnimation}
            loop={false}
            style={{ width: 200, height: 200 }}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
