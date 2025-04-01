const express = require('express');
const router = express.Router();
const { getAllExpenses, addExpense } = require('../models/expense');

router.get('/', async (req, res) => {
  res.json(await getAllExpenses());
});

router.post('/', async (req, res) => {
  const { amount, category, description } = req.body;
  res.json(await addExpense(amount, category, description));
});

module.exports = router;