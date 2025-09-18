const notificationService = require("../services/notification.service");
const ApiResponse = require("../utils/apiResponse");

exports.testNotification = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(ApiResponse.error("Unauthorized", 401));
    }
    // Send a test notification to the current user
    const result = await notificationService.sendToUserIds([userId], {
      notification: {
        title: "Test Notification",
        body: "This is a test push notification from Reminder Queen!",
      },
      data: {
        action: "test",
      },
    });
    return res.json(ApiResponse.success(result, 1, 200));
  } catch (e) {
    return res.status(500).json(ApiResponse.error(e.message, 500));
  }
};
