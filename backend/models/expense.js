const pool = require('../src/db');

async function getAllExpenses() {
  const { rows } = await pool.query(`
    SELECT 
      expenses.id,
      amount,
      description,
      categories.name AS category,
      expenses.created_at
    FROM expenses 
    LEFT JOIN categories ON expenses.category_id = categories.id
    ORDER BY expenses.created_at DESC
  `);
  return rows;
}

async function getOrCreateCategoryId(categoryName) {
  const existing = await pool.query(
    'SELECT id FROM categories WHERE name = $1',
    [categoryName]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const inserted = await pool.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING id',
    [categoryName]
  );
  return inserted.rows[0].id;
}

async function addExpense(amount, categoryName, description) {
  const categoryId = await getOrCreateCategoryId(categoryName);
  const { rows } = await pool.query(
    'INSERT INTO expenses (amount, category_id, description) VALUES ($1, $2, $3) RETURNING *',
    [amount, categoryId, description]
  );
  return rows[0];
}

async function deleteExpense(id) {
  const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
  if (result.rowCount === 0) {
    throw new Error(`Expense with id ${id} not found`);
  }
}

module.exports = { getAllExpenses, addExpense, deleteExpense };