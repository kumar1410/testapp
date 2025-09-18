const express = require("express");
const { sendOtp, verifyOtp, testLogin } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Direct login for test/admin user (no OTP)
router.post("/test-login", testLogin);

module.exports = router;
