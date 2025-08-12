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
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [users]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (description && !categoryOption) {
        axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/expenses/classify`, { description })
          .then(res => {
            const predicted = res.data.category;
            setCategoryOption({ label: predicted, value: predicted });
          })
          .catch(err => console.error('Failed to classify category:', err));
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [description]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !categoryOption || !selectedUserId) {
      alert('Please fill in amount, category, and user');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isShared && participants.length === 0) {
      alert('Please select at least one participant');
      return;
    }

    try {
      const category = categoryOption.value;

      // Step 1: create expense
      const expenseRes = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/expenses`, {
        amount: numericAmount,
        description,
        category,
        user_id: selectedUserId,
      });

      const expense = expenseRes.data;

      // Step 2: share if applicable
      if (isShared) {
        const participantIds = participants.map(p => parseInt(p.value));
        const totalPeople = participantIds.length;
        const splitAmount = parseFloat((numericAmount / totalPeople).toFixed(2));

        const sharedEntries = participantIds
          .filter(uid => uid !== selectedUserId) // don't owe yourself
          .map(uid => ({
            owed_by: uid,
            amount: splitAmount,
          }));

        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/expenses/shared-expenses`, {
          expense_id: expense.id,
          paid_by: selectedUserId,
          participants: participantIds,
          amount: numericAmount
        });
      }

      onAdd(expense);
      setAmount('');
      setDescription('');
      setCategoryOption(null);
      setParticipants([]);
      setIsShared(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  const handleCreateCategory = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setCategoryOption(newOption);
    fetchCategories();
  };

  const handleDeleteCategory = async () => {
    const categoryToDelete = categoryOption?.label;
    if (!categoryToDelete) return;

    const confirmDelete = window.confirm(`Delete category "${categoryToDelete}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/expenses/categories/${categoryToDelete}`);
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
          <label className="form-label">Participants (including yourself)</label>
          <Select
            isMulti
            options={userOptions}
            value={participants}
            onChange={setParticipants}
            placeholder="Select all users involved"
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
            setParticipants([]);
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