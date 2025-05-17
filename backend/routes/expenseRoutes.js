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

router.delete('/categories/:name', async (req, res) => {
  const categoryName = req.params.name;

  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE name = $1 RETURNING *',
      [categoryName]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') {
      // foreign key violation
      return res.status(400).json({ error: 'Cannot delete category: it is currently in use by expenses.' });
    }

    console.error('Error deleting category:', err.message);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

router.post('/shared-expenses', async (req, res) => {
  const { expense_id, paid_by, shared_with } = req.body;

  if (!expense_id || !paid_by || !Array.isArray(shared_with) || shared_with.length === 0) {
    return res.status(400).json({ error: 'Invalid shared expense payload' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const { owed_by, amount } of shared_with) {
      await client.query(
        `INSERT INTO shared_expenses (expense_id, paid_by, owed_by, amount)
         VALUES ($1, $2, $3, $4)`,
        [expense_id, paid_by, owed_by, amount]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to insert shared expenses:', err);
    res.status(500).json({ error: 'Failed to save shared expenses' });
  } finally {
    client.release();
  }
});

router.get('/shared-expenses/user-totals', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH paid AS (
        SELECT paid_by AS user_id, SUM(amount) AS total_paid
        FROM shared_expenses
        GROUP BY paid_by
      ),
      owed AS (
        SELECT owed_by AS user_id, SUM(amount) AS total_owed
        FROM shared_expenses
        GROUP BY owed_by
      )
      SELECT
        u.id AS user_id,
        u.name,
        COALESCE(p.total_paid, 0) AS total_paid,
        COALESCE(o.total_owed, 0) AS total_owed,
        COALESCE(p.total_paid, 0) - COALESCE(o.total_owed, 0) AS net_balance
      FROM users u
      LEFT JOIN paid p ON u.id = p.user_id
      LEFT JOIN owed o ON u.id = o.user_id
      ORDER BY u.name;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching shared totals:', err);
    res.status(500).json({ error: 'Failed to fetch user totals' });
  }
});



module.exports = router;