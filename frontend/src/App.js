import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExpenseForm from './components/ExpenseForm';

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/expenses');
        console.log('Fetched expenses:', res.data);
        setExpenses(res.data);

        const uniqueCategories = [...new Set(res.data.map(e => e.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error(error);
      }
    };

    fetchExpenses();
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

  return (
    <div>
      <h1>Expense Tracker</h1>
      <ExpenseForm
        onAdd={handleAddExpense}
        categories={categories}
        onAddCategory={handleAddCategory}
      />
      <h2>Expenses</h2>
      <ul>
        {expenses.map(expense => (
          <li key={expense.id}>
            {expense.category}: ${expense.amount} ({expense.description || 'No description'})
            <button onClick={() => handleDeleteExpense(expense.id)} style={{ marginLeft: '1rem' }}>
            Delete
          </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;