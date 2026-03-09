const jwt = require('jsonwebtoken');
const { MEMBER_STATUS } = require('../config/constants');

// Simple auth middleware for single user application
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // For single user app, we can use a simple user object
    req.user = {
      id: decoded.userId || 1,
      username: decoded.username || 'admin',
      role: 'admin'
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Generate token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = { auth, generateToken };
