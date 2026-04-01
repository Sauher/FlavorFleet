const { User } = require("../models/index");

/**
 * Middleware to verify admin authorization
 * Requires authentication middleware to run first
 */
async function adminAuthorization(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ 
        message: "Access denied. Admin role required.",
        requiredRole: "admin",
        currentRole: user.role
      });
    }

    // Attach user to request for later use
    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    return res.status(500).json({ message: "Authorization check failed" });
  }
}

module.exports = { adminAuthorization };
