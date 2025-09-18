const PushTokens = require("../models/pushTokens.model");
const ApiResponse = require("../utils/apiResponse");

exports.register = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { token, platform } = req.body;
    if (!userId || !token) {
      return res
        .status(400)
        .json(ApiResponse.error("token is required", 400));
    }
    await PushTokens.upsertToken(userId, token, platform || null);
    return res.json(ApiResponse.success({ token }, 1, 200));
  } catch (e) {
    return res.status(500).json(ApiResponse.error(e.message, 500));
  }
};

exports.unregister = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;
    if (!userId || !token) {
      return res
        .status(400)
        .json(ApiResponse.error("token is required", 400));
    }
    await PushTokens.removeToken(userId, token);
    return res.json(ApiResponse.success({ token }, 1, 200));
  } catch (e) {
    return res.status(500).json(ApiResponse.error(e.message, 500));
  }
};

exports.test = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("Unauthorized", 401));
    }

    const notificationService = require("../services/notification.service");
    const result = await notificationService.sendToUserIds([userId], {
      notification: {
        title: "Test Notification",
        body: "This is a test notification sent from the app!",
      },
      data: {
        type: "test",
        timestamp: new Date().toISOString(),
      },
    });

    return res.json(
      ApiResponse.success(
        { 
          successCount: result.successCount,
          failureCount: result.failureCount,
        },
        1,
        200
      )
    );
  } catch (e) {
    console.error("Test notification error:", e);
    return res.status(500).json(ApiResponse.error(e.message, 500));
  }
};
