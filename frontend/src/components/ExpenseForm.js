import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable';

const ExpenseForm = ({ onAdd, categories, onAddCategory, users }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryOption, setCategoryOption] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (users.length > 0) {
      setSelectedUserId(users[0].id); // Default to first user
    }
  }, [users]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !categoryOption || !selectedUserId) {
      alert('Please fill in amount, category, and user');
      return;
    }

    try {
      const category = categoryOption.value;
      const response = await axios.post('http://localhost:5001/api/expenses', {
        amount,
        description,
        category,
        user_id: selectedUserId,
      });

      onAdd(response.data);
      setAmount('');
      setDescription('');
      setCategoryOption(null);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleCreateCategory = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setCategoryOption(newOption);
    onAddCategory(inputValue);
  };

  const categoryOptions = (categories || []).map((cat) => ({
    value: cat,
    label: cat,
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
        <label className="form-label">User</label>
        <select
          className="form-select"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
          required
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

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
