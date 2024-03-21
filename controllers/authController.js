const User = require("../models/User");

// Register a new user
const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({ error: "Email Allready Registered" });
    }
    await User.create({ email, password });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register };
