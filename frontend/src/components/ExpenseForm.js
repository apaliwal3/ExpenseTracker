import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';

const ExpenseForm = ({ onAdd, categories, fetchCategories, users }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryOption, setCategoryOption] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [sharedWith, setSharedWith] = useState([]);

  useEffect(() => {
    if (users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [users]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !categoryOption || !selectedUserId) {
      alert('Please fill in amount, category, and user');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isShared && sharedWith.length === 0) {
      alert('Please select at least one user to share with.');
      return;
    }

    try {
      // Step 1: create expense
      const category = categoryOption.value;
      const expenseRes = await axios.post('http://localhost:5001/api/expenses', {
        amount: numericAmount,
        description,
        category,
        user_id: selectedUserId,
      });

      const expense = expenseRes.data;

      // Step 2: shared logic (if applicable)
      if (isShared) {
        const perUserShare = parseFloat((numericAmount / sharedWith.length).toFixed(2));

        const sharedEntries = sharedWith.map(user => ({
          owed_by: user.value,
          amount: perUserShare,
        }));

        await axios.post('http://localhost:5001/api/expenses/shared-expenses', {
          expense_id: expense.id,
          paid_by: selectedUserId,
          shared_with: sharedEntries,
        });
      }

      onAdd(expense);
      setAmount('');
      setDescription('');
      setCategoryOption(null);
      setSharedWith([]);
      setIsShared(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  const handleCreateCategory = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setCategoryOption(newOption);
    fetchCategories(); // Refresh categories
  };

  const handleDeleteCategory = async () => {
    const categoryToDelete = categoryOption?.label;
    if (!categoryToDelete) return;

    const confirmDelete = window.confirm(`Delete category "${categoryToDelete}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5001/api/expenses/categories/${categoryToDelete}`);
      await fetchCategories();
      setCategoryOption(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Category could not be deleted. It may still be used by some expenses.');
    }
  };

  const categoryOptions = (categories || []).map((cat) => ({
    value: cat,
    label: cat,
  }));

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Amount</label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Category</label>
        <CreatableSelect
          placeholder="Select or create category"
          isClearable
          value={categoryOption}
          onChange={setCategoryOption}
          options={categoryOptions}
          onCreateOption={handleCreateCategory}
        />
        {categoryOption && (
          <button
            type="button"
            className="btn btn-sm btn-danger mt-2"
            onClick={handleDeleteCategory}
          >
            Delete Selected Category
          </button>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <input
          type="text"
          className="form-control"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Paid by</label>
        <select
          className="form-select"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
          required
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-check mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={isShared}
          onChange={(e) => setIsShared(e.target.checked)}
          id="isSharedCheck"
        />
        <label className="form-check-label" htmlFor="isSharedCheck">
          Shared Expense
        </label>
      </div>

      {isShared && (
        <div className="mb-3">
          <label className="form-label">Split With</label>
          <Select
            isMulti
            options={userOptions.filter(u => u.value !== selectedUserId)}
            value={sharedWith}
            onChange={setSharedWith}
            placeholder="Select users to split with"
          />
        </div>
      )}

      <div className="d-flex justify-content-between">
        <button className="btn btn-primary" type="submit">
          Add Expense
        </button>
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => {
            setAmount('');
            setDescription('');
            setCategoryOption(null);
            setSharedWith([]);
            setIsShared(false);
            setSelectedUserId(users[0]?.id || '');
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;