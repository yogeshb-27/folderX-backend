const {
  register,
  login,
  getUserStorageStats,
} = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const router = require("express").Router();

router
  .post("/register", register)
  .post("/login", login)
  .get("/stats", authenticateUser, getUserStorageStats);

module.exports = router;
