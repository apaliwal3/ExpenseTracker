-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS settled_debts CASCADE;
DROP TABLE IF EXISTS shared_expenses CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Shared expenses table
CREATE TABLE IF NOT EXISTS shared_expenses (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    paid_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL
);

-- Settled debts table
CREATE TABLE IF NOT EXISTS settled_debts (
    id SERIAL PRIMARY KEY,
    owed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paid_to INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    settled_at TIMESTAMP DEFAULT NOW()
);