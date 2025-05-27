const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const expenseRoutes = require('./routes/expenseRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/expenses', expenseRoutes);

const settlementsRoutes = require('./routes/settlementsRoutes');
app.use('/api/settlements', settlementsRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
})