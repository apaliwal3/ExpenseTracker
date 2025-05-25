const express = require('express');
const router = express.Router();
const pool = require('../src/db');

// POST /api/settlements
router.post('/', async (req, res) => {
  const { owed_by, paid_to, amount, expense_id } = req.body;

  if (!owed_by || !paid_to || !amount || !expense_id) {
    return res.status(400).json({ error: 'owed_by, paid_to, amount, and expense_id are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO settled_debts (owed_by, paid_to, amount, expense_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [owed_by, paid_to, amount, expense_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting settlement:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/settlements
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sd.expense_id,
        sd.owed_by,
        sd.paid_to,
        sd.amount,
        sd.settled_at,
        u1.name AS owed_by_name,
        u2.name AS paid_to_name
      FROM settled_debts sd
      JOIN users u1 ON sd.owed_by = u1.id
      JOIN users u2 ON sd.paid_to = u2.id
      ORDER BY sd.settled_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch settled debts:', err);
    res.status(500).json({ error: 'Failed to fetch settled debts' });
  }
});

// GET /api/settlements/suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        se.expense_id,
        se.owed_by,
        se.paid_by AS paid_to,
        se.amount,
        u1.name AS owed_by_name,
        u2.name AS paid_to_name
      FROM shared_expenses se
      JOIN users u1 ON se.owed_by = u1.id
      JOIN users u2 ON se.paid_by = u2.id
      LEFT JOIN settled_debts sd
        ON sd.expense_id = se.expense_id
        AND sd.owed_by = se.owed_by
        AND sd.paid_to = se.paid_by
        AND sd.amount = se.amount
      WHERE sd.id IS NULL
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to get settle-up suggestions:', err);
    res.status(500).json({ error: 'Failed to load suggestions' });
  }
});

router.get('/fully-settled', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT se.expense_id
      FROM shared_expenses se
      GROUP BY se.expense_id
      HAVING COUNT(*) = (
        SELECT COUNT(*) FROM settled_debts sd
        WHERE sd.expense_id = se.expense_id
      )
    `);
    const ids = result.rows.map(r => r.expense_id);
    res.json(ids);
  } catch (err) {
    console.error('Failed to fetch fully settled expense IDs:', err);
    res.status(500).json({ error: 'Failed to fetch fully settled expenses' });
  }
});

module.exports = router;
