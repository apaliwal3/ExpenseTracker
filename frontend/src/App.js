import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExpenseForm from './components/ExpenseForm';
import GroupedExpenses from './components/GroupedExpenses';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Modal, Button } from 'react-bootstrap';

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortOption, setSortOption] = useState('recent');
  const [groupBy, setGroupBy] = useState('category');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:5001/api/expenses'),
          axios.get('http://localhost:5001/api/expenses/categories')
        ]);
        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data.map(row => row)); // list of category names
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const handleDeleteExpense = async (id) => {
    console.log("Deleting expense with id:", id);
    try {
        await axios.delete(`http://localhost:5001/api/expenses/${id}`)
        setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (error) {
       console.error('Failed to delete expense:', error);
    }
  };

  const handleAddExpense = (newExpense) => {
    setExpenses([newExpense, ...expenses]);

    if (!categories.includes(newExpense.category)) {
      setCategories([newExpense.category, ...categories]);
    }
  };

  const handleAddCategory = (newCategory) => {
    if (!categories.includes(newCategory)) {
      setCategories([newCategory, ...categories]);
    }
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const filteredExpenses = expenses.filter(exp => {
    const date = new Date(exp.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (!start || date >= start) && (!end || date <= end);
  });

  return (
    <div className="container py-4">
      <h1 className="mb-4">Expense Tracker</h1>

      <button className="btn btn-primary mb-4" onClick={() => setShowFormModal(true)}>
        Add Expense
      </button>

      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ExpenseForm
            onAdd={(expense) => {
              handleAddExpense(expense);
              setShowFormModal(false);
            }}
            categories={categories}
            onAddCategory={handleAddCategory}
          />
        </Modal.Body>
      </Modal>

      <div className="row mb-3">
        <div className="col-md-6">
          <select
            className="form-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="recent">Sort by: Most Recent</option>
            <option value="amount_asc">Amount: Low to High</option>
            <option value="amount_desc">Amount: High to Low</option>
          </select>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="category">Group by: Category</option>
            <option value="user">Group by: Contributor</option>
          </select>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-4 d-grid">
          <button className="btn btn-outline-secondary mt-3" onClick={clearDateFilters}>
            Clear Filters
          </button>
        </div>
      </div>


      <GroupedExpenses
        expenses={filteredExpenses}
        onDelete={handleDeleteExpense}
        groupBy={groupBy}
        sortOption={sortOption}
      />
    </div>
  );
};

export default App;