const pool = require('../src/db');

async function getAllExpenses() {
  const { rows } = await pool.query('SELECT * FROM expenses');
  return rows;
}

async function addExpense(amount, category, description) {
  const { rows } = await pool.query(
    'INSERT INTO expenses (amount, category, description) VALUES ($1, $2, $3) RETURNING *',
    [amount, category, description]
  );
  return rows[0];
}

async function deleteExpense(id) {
  await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
}

module.exports = { getAllExpenses, addExpense, deleteExpense };