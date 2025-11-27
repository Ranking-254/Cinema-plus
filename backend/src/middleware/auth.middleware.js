const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// This is a pre-made middleware from Clerk that checks the request headers
// If valid, it adds req.auth to the request object.
// If invalid, it throws a 401 Unauthorized error automatically.
const requireAuth = ClerkExpressRequireAuth({
  // It will look for the secret key in process.env.CLERK_SECRET_KEY automatically
});

module.exports = requireAuth;