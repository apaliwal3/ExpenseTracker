const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const expenseRoutes = require('./routes/expenseRoutes');
const settlementsRoutes = require('./routes/settlementsRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementsRoutes);
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
})