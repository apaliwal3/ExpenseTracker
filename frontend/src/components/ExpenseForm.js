import React, {useState} from 'react';
import axios from 'axios';
import CreatableSelect from 'react-select/creatable'

const ExpenseForm = ({ onAdd, categories, onAddCategory }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryOption, setCategoryOption] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !categoryOption) {
      alert('Please fill in amount and category');
      return;
    }

    try {
      const category = categoryOption.value;
      const response = await axios.post('http://localhost:5001/api/expenses', {
        amount,
        description,
        category,
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
    onAddCategory(inputValue); // update category list in App
  };

  const categoryOptions = (categories || []).map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Amount ($)</label>
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
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;