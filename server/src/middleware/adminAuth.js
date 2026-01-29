const env = require('../config/env');

/**
 * Simple admin authentication middleware.
 * Checks for ADMIN_SECRET in Authorization header or query param.
 *
 * Usage:
 *   Authorization: Bearer <ADMIN_SECRET>
 *   or
 *   ?token=<ADMIN_SECRET>
 */
function adminAuth(req, res, next) {
  if (!env.ADMIN_SECRET) {
    return res.status(503).json({
      error: 'Admin access not configured',
      hint: 'Set ADMIN_SECRET environment variable',
    });
  }

  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;

  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (token !== env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Invalid credentials' });
  }

  next();
}

module.exports = adminAuth;
