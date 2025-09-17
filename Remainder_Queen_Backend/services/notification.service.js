const { initFirebaseAdmin } = require("../config/firebase");
const PushTokens = require("../models/pushTokens.model");
const logger = require("../logger");

function getAdmin() {
  return initFirebaseAdmin();
}

async function sendToUserIds(userIds, message) {
  try {
    const admin = getAdmin();

    const allTokens = (
      await Promise.all(userIds.map((id) => PushTokens.getTokensForUserId(id)))
    ).flat();

    if (!allTokens.length) return { successCount: 0, failureCount: 0 };

    const multicast = {
      tokens: allTokens,
      notification: message.notification,
      data: message.data || {},
      android: { priority: "high" },
      apns: { headers: { "apns-priority": "10" } },
    };

    const response = await admin.messaging().sendEachForMulticast(multicast);
    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const err = resp.error;
        if (
          err &&
          (err.code === "messaging/invalid-registration-token" ||
            err.code === "messaging/registration-token-not-registered")
        ) {
          failedTokens.push(allTokens[idx]);
        }
      }
    });

    if (failedTokens.length) {
      await PushTokens.removeInvalidTokens(failedTokens);
    }

    logger.info(
      `FCM multicast: success=${response.successCount}, failure=${response.failureCount}`
    );
    return response;
  } catch (e) {
    logger.error(`Failed to send FCM: ${e.message}`);
    return { successCount: 0, failureCount: 0 };
  }
}

async function sendTaskAssigned(toUserId, task) {
  return sendToUserIds([toUserId], {
    notification: {
      title: "New Task Assigned",
      body: task.Title || task.title || "You have a new task",
    },
    data: {
      taskId: String(task.id),
      action: "assigned",
    },
  });
}

async function sendTaskUpdated(toUserId, task) {
  return sendToUserIds([toUserId], {
    notification: {
      title: "Task Updated",
      body: task.Title || task.title || "Task details updated",
    },
    data: {
      taskId: String(task.id),
      action: "updated",
    },
  });
}

async function sendTaskStatusChanged(toUserIds, task, status) {
  return sendToUserIds(Array.isArray(toUserIds) ? toUserIds : [toUserIds], {
    notification: {
      title: "Task Status Changed",
      body: `${task.Title || task.title} → ${status}`,
    },
    data: {
      taskId: String(task.id),
      action: "status",
      status: String(status),
    },
  });
}

module.exports = {
  sendTaskAssigned,
  sendTaskUpdated,
  sendTaskStatusChanged,
};


