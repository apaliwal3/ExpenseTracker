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

<img width="2676" height="2750" alt="Expense Tracker" src="https://github.com/user-attachments/assets/a0f2b1d6-b360-48cd-a153-e3f46c247554" />

<img width="2676" height="1858" alt="Expense Tracker · 12 31pm · 05-12" src="https://github.com/user-attachments/assets/06235629-2fee-4462-866e-13cc0c6877d8" />

<img width="2676" height="1858" alt="Expense Tracker · 12 32pm · 05-12 (1)" src="https://github.com/user-attachments/assets/238ac701-26e0-4dd6-b227-a42b0c441b52" />

<img width="2676" height="1858" alt="Expense Tracker · 12 32pm · 05-12" src="https://github.com/user-attachments/assets/601be310-0dd6-4aea-a566-eae32ba5e2fe" />


## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running

### Running the Application

**Option 1: Using the startup script (Recommended)**
```bash
./start.sh
```

**Option 1b: Start without ML service**
```bash
./start.sh --no-ml
```
This starts frontend, backend, and database only. Expense category auto-classification is disabled in this mode.

**Option 2: Using Docker Compose**
```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **ML Service**: http://localhost:5002 (not started when using `./start.sh --no-ml`)
- **Database**: localhost:5433

### Managing the Application

**Stop all services:**
```bash
./stop.sh
```

**Restart services:**
```bash
./restart.sh
```

**View logs:**
```bash
./logs.sh              # All services
./logs.sh ml_service   # Specific service
```

**Health check:**
```bash
./health-check.sh
```

For detailed instructions, see [QUICKSTART.md](QUICKSTART.md)

## Running Locally (Without Docker)

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
