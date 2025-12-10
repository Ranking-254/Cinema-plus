const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Hii itasoma CLERK_SECRET_KEY kutoka kwenye .env kiotomatiki
const requireAuth = ClerkExpressRequireAuth();

module.exports = requireAuth;