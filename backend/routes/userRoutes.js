const express = require('express');
const router = express.Router();
const pool = require('../src/db');

router.get('/users/:userId/spending', async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const client = await pool.connect();

    // Summary: personal paid
    const personalRes = await client.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_paid
      FROM expenses
      WHERE user_id = $1
    `, [userId]);

    // Summary: shared paid
    const sharedPaidRes = await client.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_shared_paid
      FROM shared_expenses
      WHERE paid_by = $1
    `, [userId]);

    // Summary: reimbursed
    const reimbursedRes = await client.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_reimbursed
      FROM settled_debts
      WHERE paid_to = $1
    `, [userId]);

    // Summary: owed but not settled
    const owedRes = await client.query(`
      SELECT COALESCE(SUM(se.amount), 0) AS total_owed
      FROM shared_expenses se
      LEFT JOIN settled_debts sd ON
        sd.expense_id = se.expense_id AND
        sd.owed_by = se.owed_by AND
        sd.paid_to = se.paid_by AND
        sd.amount = se.amount
      WHERE se.owed_by = $1 AND sd.id IS NULL
    `, [userId]);

    // Top category (based on user's expenses)
    const topCategoryRes = await client.query(`
      SELECT c.name, SUM(e.amount) AS total
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = $1
      GROUP BY c.name
      ORDER BY total DESC
      LIMIT 1
    `, [userId]);

    // Shared participants per expense
    const sharedWithMapRes = await client.query(`
      SELECT se.expense_id, ARRAY_AGG(DISTINCT u.name) AS shared_with
      FROM shared_expenses se
      JOIN users u ON se.owed_by = u.id
      GROUP BY se.expense_id
    `);

    const sharedWithMap = {};
    sharedWithMapRes.rows.forEach(row => {
      sharedWithMap[row.expense_id] = row.shared_with;
    });

    // Raw transactions
    const transactionsRes = await client.query(`
      SELECT
        e.id,
        e.amount,
        e.description,
        c.name AS category,
        e.created_at,
        CASE
          WHEN se.id IS NOT NULL THEN 'shared'
          ELSE 'personal'
        END AS type,
        se.paid_by,
        se.owed_by,
        sd.id IS NOT NULL AS settled
      FROM expenses e
      LEFT JOIN shared_expenses se ON e.id = se.expense_id
      LEFT JOIN settled_debts sd ON
        sd.expense_id = se.expense_id AND
        sd.owed_by = se.owed_by AND
        sd.paid_to = se.paid_by AND
        sd.amount = se.amount
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = $1 OR se.owed_by = $1 OR se.paid_by = $1
      ORDER BY e.created_at DESC
    `, [userId]);

    client.release();

    // 🔁 Deduplicate by expense ID and merge shared_with + settled status
    const expenseMap = new Map();

    transactionsRes.rows.forEach(txn => {
      const id = txn.id;
      if (!expenseMap.has(id)) {
        expenseMap.set(id, {
          ...txn,
          shared_with: new Set(sharedWithMap[txn.id] || []),
          settled_flags: [txn.settled]
        });
      } else {
        const existing = expenseMap.get(id);
        (sharedWithMap[txn.id] || []).forEach(name => existing.shared_with.add(name));
        existing.settled_flags.push(txn.settled);
      }
    });

    const transactions = Array.from(expenseMap.values()).map(txn => ({
      ...txn,
      shared_with: Array.from(txn.shared_with),
      settled: txn.settled_flags.every(Boolean),
    }));

    // 🧾 Final output
    res.json({
      total_paid: parseFloat(personalRes.rows[0].total_paid),
      total_shared_paid: parseFloat(sharedPaidRes.rows[0].total_shared_paid),
      total_reimbursed: parseFloat(reimbursedRes.rows[0].total_reimbursed),
      total_owed: parseFloat(owedRes.rows[0].total_owed),
      net_spent:
        parseFloat(personalRes.rows[0].total_paid) -
        parseFloat(reimbursedRes.rows[0].total_reimbursed),
      top_category: topCategoryRes.rows[0]?.name || null,
      transactions
    });

  } catch (err) {
    console.error('Failed to fetch spending data:', err);
    res.status(500).json({ error: 'Failed to calculate user spending' });
  }
});

module.exports = router;