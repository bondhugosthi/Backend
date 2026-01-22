const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 1000, // higher limit for local development
  message: 'Too many requests from this IP, please try again later.'
});

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 5 : 50, // higher limit for local development
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true
});

// Contact form rate limiter
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProd ? 3 : 20, // higher limit for local development
  message: 'Too many messages sent, please try again later.'
});

module.exports = { apiLimiter, loginLimiter, contactLimiter };
