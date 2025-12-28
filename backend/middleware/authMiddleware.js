const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided', tokenExpired: false });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err.message);  // Log the specific error
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Token expired', tokenExpired: true });
      }
      return res.status(403).json({ error: 'Invalid token. Please log in again.', tokenExpired: true });
    }

    req.user = decoded;
    next();
  });
};

module.exports = authenticateToken;