const pool = require('../src/db');

async function addSettlement(owed_by, paid_to, amount) {
  const { rows } = await pool.query(
    `INSERT INTO settled_debts (owed_by, paid_to, amount)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [owed_by, paid_to, amount]
  );
  return rows[0];
}

module.exports = { addSettlement };
