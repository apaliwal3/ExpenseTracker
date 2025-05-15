const express = require('express');
const router = express.Router();
const { getAllExpenses, addExpense, deleteExpense } = require('../models/expense');
const pool = require('../src/db');

router.get('/', async (req, res) => {
  try {
    const expenses = await getAllExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

router.post('/', async (req, res) => {
  try {
    let { amount, category, description, user_id } = req.body;
    console.log('Incoming expense POST body:', req.body);

    amount = parseFloat(amount);
    user_id = parseInt(user_id);

    if (
      amount === undefined || amount === null || isNaN(amount) ||
      !category || category.trim() === '' ||
      user_id === undefined || user_id === null || isNaN(user_id)
    ) {
      return res.status(400).json({ error: 'Amount, category and user_id are required' });
    }

    const newExpense = await addExpense(amount, category, description, user_id);
    res.json(newExpense);
  } catch (err) {
    console.error('Error adding expense:', err.message);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT name FROM categories ORDER BY name');
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const {rows} = await pool.query('SELECT id, name FROM users ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Failed to retrieve users:', err);
    res.status(500).json({ error: 'Failed to retrieve users' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteExpense(req.params.id);
    res.json({ success: true, deleted });
  } catch (err) {
    console.error('Failed to delete expense:', err.message);
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;