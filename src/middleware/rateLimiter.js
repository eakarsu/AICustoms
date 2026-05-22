const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req, res) => {
    // Use user ID from JWT if available, otherwise IP
    return (req.user && req.user.id) ? `user_${req.user.id}` : ipKeyGenerator(req, res);
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many AI requests. Limit is 20 per hour per user.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { aiRateLimiter, generalLimiter };
