const pool = require('../src/db');

async function getAllExpenses() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        expenses.id,
        amount,
        description,
        categories.name AS category,
        COALESCE(users.name, 'Unassigned') AS contributor,
        expenses.created_at
      FROM expenses
      LEFT JOIN categories ON expenses.category_id = categories.id
      LEFT JOIN users ON expenses.user_id = users.id
      ORDER BY expenses.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error; // Let the route return 500 with context
  }
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

async function addExpense(amount, categoryName, description, userId) {
  const categoryId = await getOrCreateCategoryId(categoryName);
  const { rows } = await pool.query(
    'INSERT INTO expenses (amount, category_id, description, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [amount, categoryId, description, userId]
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