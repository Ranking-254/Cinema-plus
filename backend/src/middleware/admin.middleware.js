const isAdmin = (req, res, next) => {
  const superAdminId = process.env.SUPER_ADMIN_ID;

  if (req.auth && req.auth.userId === superAdminId) {
    next(); // User is the Super Admin, proceed to the controller
  } else {
    return res.status(403).json({ 
      message: "Access Denied: Super Admin privileges required." 
    });
  }
};

module.exports = isAdmin;