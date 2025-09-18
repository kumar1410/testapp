// Direct login for test/admin user (no OTP)
exports.testLogin = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json(ApiResponse.error("Username is required", 400));
    }

    // Get test user from database
    const db = require("../config/dbConfig").getDB();
    const [users] = await db.execute(
      "SELECT * FROM test_users WHERE username = ?",
      [username]
    );

    if (!users || users.length === 0) {
      return res.status(401).json(
        ApiResponse.error("Invalid test credentials. Use: admin, test, or demouser", 401)
      );
    }

    const testUser = users[0];
    const userPayload = {
      id: testUser.id,
      username: testUser.username,
      role: testUser.role,
      name: testUser.name,
      phoneno: testUser.phoneno
    };
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

    // --- 2Factor AUTOGEN2 endpoint ---
    const API_KEY = process.env.TWO_FACTOR_API_KEY;
    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/${phoneNo}/AUTOGEN2/Apptest`;
    const response = await axios.get(url);
    console.log("2factor AUTOGEN2:", response.data);
    if (response.data.Status === "Success") {
      res.status(200).json(
        ApiResponse.success(
          {
            message: "OTP sent successfully",
            phoneNo,
            sessionId: response.data.Details, // Save this on frontend if needed
          },
          1
        )
      );
    } else {
      res.status(500).json(ApiResponse.error(response.data.Details || "Failed to send OTP", 500));
    }
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

    // --- 2Factor VERIFY3 endpoint ---
    const API_KEY = process.env.TWO_FACTOR_API_KEY;
    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY3/${phoneNo}/${otp}`;
    const response = await axios.get(url);
    console.log("2factor VERIFY3:", response.data);
    if (response.data.Status === "Success") {
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
    } else {
      res.status(401).json(ApiResponse.error(response.data.Details || "Invalid or expired OTP", 401));
    }
  } catch (err) {
    res.status(500).json(ApiResponse.error(
      process.env.NODE_ENV === "production"
        ? `Error verifying OTP: ${err.message}`
        : `Error verifying OTP: ${err.message}\n${err.stack}`,
      500
    ));
  }
};
