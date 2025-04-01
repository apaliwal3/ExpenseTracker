import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/expenses')
      .then(response => setExpenses(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Expense Tracker</h1>
      <ul>
        {expenses.map(expense => (
          <li key={expense.id}>
            {expense.category}: ${expense.amount} ({expense.description})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
