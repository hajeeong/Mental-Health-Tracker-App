const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId,  // Make sure this matches what you set in login
      role: decoded.role
    };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};