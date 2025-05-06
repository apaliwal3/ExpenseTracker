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
    const { amount, category, description } = req.body;
    if (!amount || !category) {
      return res.status(400).json({ error: 'Amount and category are required' });
    }

    const newExpense = await addExpense(amount, category, description);
    res.json(newExpense);
  } catch (err) {
    console.error('Error adding expense:', err);
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