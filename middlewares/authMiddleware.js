const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Authentication failed");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};

module.exports = { authenticateUser };
