import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'meditalk_dev_secret_2026';

// Validates Bearer token — attaches decoded user payload to req.user
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — missing token' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, userId, name, email, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
  }
}

// Role guard — must be chained after requireAuth.
// Usage: router.get('/stats', requireAuth, requireRole('admin'), handler)
// Usage (multiple): requireAuth, requireRole('admin', 'doctor')
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized — not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden — requires role: ${allowedRoles.join(' or ')}`,
      });
    }
    next();
  };
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    } catch {
      // ignore invalid tokens — treat as unauthenticated
    }
  }
  next();
}

