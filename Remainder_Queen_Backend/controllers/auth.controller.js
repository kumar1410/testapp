// Direct login for test/admin user (no OTP)
exports.testLogin = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json(ApiResponse.error("Username is required", 400));
    }
    // You can change this logic to check for a specific admin/test username
    if (username !== "admin" && username !== "test") {
      return res.status(401).json(ApiResponse.error("Unauthorized", 401));
    }
    // Simulate a user object for admin/test
    const userPayload = { id: 0, username };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).json(
      ApiResponse.success(
        {
          message: "Test login successful",
          token,
          user: userPayload,
        },
        1
      )
    );
  } catch (err) {
    res.status(500).json(ApiResponse.error(
      process.env.NODE_ENV === "production"
        ? `Error in test login: ${err.message}`
        : `Error in test login: ${err.message}\n${err.stack}`,
      500
    ));
  }
};
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const Users = require("../models/users.model");
const ApiResponse = require("../utils/apiResponse"); // ✅ import the template class
const { default: axios } = require("axios");

const JWT_SECRET = process.env.JWT_SECRET;
const OTP_SECRET = process.env.OTP_SECRET;

exports.sendOtp = async (req, res) => {
  try {
    const { phoneNo } = req.body;

    if (!phoneNo) {
      return res
        .status(400)
        .json(ApiResponse.error("Phone number is required", 400));
    }

    // ✅ Check if user exists in DB
    const existingUser = await Users.getUserByPhone(phoneNo);
    if (!existingUser) {
      return res
        .status(404)
        .json(ApiResponse.error("User not found. Please register first.", 404));
    }

    const otp = speakeasy.totp({
      secret: `${OTP_SECRET}:${phoneNo}`,
      encoding: "ascii",
      digits: 6,
      step: 30,
    });

    const API_KEY = process.env.TWO_FACTOR_API_KEY; // 🔑 store in .env
    // const message = `Your login OTP is ${otp}. It is valid for 30 seconds.`;

    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/${phoneNo}/${otp}/Apptest`;
    const response = await axios.get(url);
    console.log("2factor:", response.data);
    console.log(`📲 OTP for ${phoneNo}: ${otp}`);

    res.status(200).json(
      ApiResponse.success(
        {
          message: "OTP sent successfully",
          phoneNo,
          otp, // ✅ Show OTP for testing (remove in production)
        },
        1
      )
    );
  } catch (err) {
    res.status(500).json(ApiResponse.error(
      process.env.NODE_ENV === "production"
        ? `Error generating OTP: ${err.message}`
        : `Error generating OTP: ${err.message}\n${err.stack}`,
      500
    ));
  }
};

// Verify OTP & issue JWT
exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;

    if (!phoneNo || !otp) {
      return res
        .status(400)
        .json(ApiResponse.error("Phone number and OTP are required", 400));
    }

    // ✅ Ensure user exists
    const existingUser = await Users.getUserByPhone(phoneNo);
    if (!existingUser) {
      return res
        .status(404)
        .json(ApiResponse.error("User not found. Please register first.", 404));
    }

    const verified = speakeasy.totp.verify({
      secret: `${OTP_SECRET}:${phoneNo}`,
      encoding: "ascii",
      token: String(otp).padStart(6, "0"),
      digits: 6,
      step: 30,
      window: 2,
    });

    if (!verified) {
      return res
        .status(401)
        .json(ApiResponse.error("Invalid or expired OTP", 401));
    }

    // ✅ Issue JWT with userId + phone
    const userPayload = {
      id: existingUser.id,
      phoneNo: existingUser.phoneno,
    };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json(
      ApiResponse.success(
        {
          message: "OTP verified successfully",
          token,
          user: existingUser,
        },
        1
      )
    );
  } catch (err) {
    res.status(500).json(ApiResponse.error(
      process.env.NODE_ENV === "production"
        ? `Error verifying OTP: ${err.message}`
        : `Error verifying OTP: ${err.message}\n${err.stack}`,
      500
    ));
  }
};
