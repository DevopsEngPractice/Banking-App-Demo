const jwt = require('jsonwebtoken');

// Each microservice independently verifies the JWT using the shared secret.
// This avoids a hard runtime dependency on the auth-service being up for every request.
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user ? req.user.role : 'unknown'}' is not permitted to perform this action.`,
      });
    }
    next();
  };
};

// Attaches req.user if a valid token is present, but does not block the request if absent.
// Used for routes that are publicly viewable but behave differently for logged-in staff.
const optionalAuth = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // ignore invalid token for optional auth
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
