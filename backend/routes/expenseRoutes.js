const express = require('express');
const router = express.Router();
const { getAllExpenses, addExpense, deleteExpense } = require('../models/expense');

router.get('/', async (req, res) => {
  res.json(await getAllExpenses());
});

router.post('/', async (req, res) => {
  const { amount, category, description } = req.body;
  res.json(await addExpense(amount, category, description));
});

router.delete('/:id', async (req, res) =>{
  const {id} = req.params;
  try {
    await deleteExpense(id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Failed to delete expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;