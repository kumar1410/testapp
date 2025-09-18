const express = require("express");
const { sendOtp, verifyOtp, testLogin } = require("../controllers/auth.controller");
const { getDB } = require("../config/dbConfig");
const ApiResponse = require("../utils/apiResponse");

const router = express.Router();

// Get list of available test users (only in development)
router.get("/test-users", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json(ApiResponse.error("Not available in production", 403));
  }
  try {
    const db = getDB();
    const [users] = await db.execute(
      "SELECT username, name, role FROM test_users ORDER BY role DESC, username ASC"
    );
    return res.json(ApiResponse.success(users));
  } catch (err) {
    return res.status(500).json(ApiResponse.error(err.message));
  }
});

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Direct login for test/admin user (no OTP)
router.post("/test-login", testLogin);

module.exports = router;
