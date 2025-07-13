# ExpenseTracker

A full-stack personal and shared finance tracker built with **React**, **Node.js**, and **PostgreSQL**, designed to help users take control of their spending. The app supports **intelligent categorization**, **shared debt tracking**, **financial insights**, and **secure authentication**.

## Features

### 🔐 Authentication
- Secure email/password login using **bcrypt** and **JWT**
- Session-based user state management with `AuthContext` in React
- Protected API routes with middleware validation

### 📊 My Spending (Dashboard)
- Personal and shared expenses visualized in one place
- Top category, money owed, and reimbursable balances at a glance
- Interactive **Chart.js** trends (monthly, category-wise, anomaly detection)

### 🤝 Group Spending
- Split purchases among users
- Tracks who owes who and how much
- Supports settle-up with automatic **minimum transaction suggestions**

### 📂 Smart Categorization
- NLP-based classifier trained on JSON expense data
- Automatically assigns categories to transactions
- Continually improving model (Logistic Regression, MultinomialNB tested)

### 📥 Bank Integration (Planned)
- Integration with **Plaid/Yodlee API** to import real transactions

### 📷 Receipt Scanner (Planned)
- OCR + NLP pipeline to extract items and split shared purchases from photos

### 🔒 Security
- JWT-based route protection
- Rate limiting for sensitive endpoints (e.g. login)
- Secure data handling with hashed passwords

## 🛠️ Tech Stack

| Frontend        | Backend         | Database      | AI / NLP         | Infra      |
|-----------------|------------------|---------------|------------------|---------------------|
| React.js        | Node.js (Express)| PostgreSQL     | scikit-learn, nltk | Docker (WIP), REST APIs |
| Context API     | JWT Auth         | pg-promise     | Logistic Regression, Naive Bayes | Git, GitHub        |
| Chart.js        | Middleware       | Sequelize (optional) | Custom JSON classifier | VSCode   |

## 📷 Screenshots

_Screenshots to be added here_

## Running Locally

### Prerequisites
- Node.js + npm
- PostgreSQL
- Python 3 (for NLP service)

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```
### NLP Classifier API
```bash
cd ml-service
source .venv/bin/activate
python3 classifier_api.py
```
