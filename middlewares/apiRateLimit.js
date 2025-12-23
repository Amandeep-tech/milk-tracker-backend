const rateLimit = require('express-rate-limit');

exports.apiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 20,                // 20 requests per IP per window  
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 1,
      message: "Too many requests. Please try again later."
    }
  });
