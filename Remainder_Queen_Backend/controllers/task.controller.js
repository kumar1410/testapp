const Task = require("../models/task.model");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../logger");
const Users = require("../models/users.model");
const NotificationService = require("../services/notification.service");

// Create Task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status = "Todo", assignTo } = req.body;

    const assignee = req.user.phoneNo;

    if (!title || !assignee || !assignTo) {
      return res
        .status(400)
        .json(ApiResponse.error("fill the required fields", 400));
    }

    const task = await Task.createTask(
      title,
      description || null,
      status,
      assignee,
      assignTo
    );

    logger.info(`Task created: ${task.title}`);
    // Fire-and-forget notification to AssignTo user, if exists
    try {
      const assignToUser = await Users.getUserByPhone(assignTo);
      if (assignToUser?.id) {
        NotificationService.sendTaskAssigned(assignToUser.id, {
          id: task.id,
          Title: title,
        });
      }
    } catch (e) {
      logger.error(`Notify on createTask failed: ${e.message}`);
    }

    res.status(201).json(ApiResponse.success(task, 1, 201));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message, 500));
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    if (!req.user?.phoneNo) {
      return res.status(401).json(ApiResponse.error("Unauthorized", 401));
    }

    const tasks = await Task.getTasks(req.user.phoneNo);

    res.json(ApiResponse.success(tasks, tasks.length, 200));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message, 500));
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json(ApiResponse.error("Task not found", 404));
    }
    res.json(ApiResponse.success(task, 1, 200));
  } catch (error) {
    res.status(500).json(ApiResponse.error(error.message, 500));
  }
};

// Update task details
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedBy = req.user.phoneNo;

    // Validate ID
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json(ApiResponse.error("Valid task ID is required", 400));
    }

    // Check if task exists and user has permission
    const existingTask = await Task.getTaskById(parseInt(id));
    if (!existingTask) {
      return res.status(404).json(ApiResponse.error("Task not found", 404));
    }

    const userPhone = req.user.phoneNo;
    // Only assignee (creator) can update task details
    if (existingTask.Assignee !== userPhone) {
      return res
        .status(403)
        .json(
          ApiResponse.error("Only task creator can update task details", 403)
        );
    }

    // Validate updates
    if (updates.Title && updates.Title.length > 255) {
      return res
        .status(400)
        .json(ApiResponse.error("Title must be less than 255 characters", 400));
    }

    if (updates.Status) {
      const validStatuses = [
        "Pending",
        "In Progress",
        "Completed",
        "Rejected",
        "Reverted",
      ];
      if (!validStatuses.includes(updates.Status)) {
        return res
          .status(400)
          .json(
            ApiResponse.error(
              `Status must be one of: ${validStatuses.join(", ")}`,
              400
            )
          );
      }
    }

    // Trim string values
    const cleanUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "string") {
        cleanUpdates[key] = value.trim();
      } else {
        cleanUpdates[key] = value;
      }
    }

    const updatedTask = await Task.updateTask(
      parseInt(id),
      cleanUpdates,
      updatedBy
    );

    logger.info(`Task ${id} updated by ${updatedBy}`);
    // Notify target user about update (prefer AssignTo)
    try {
      const targetPhone = updatedTask.AssignTo || updatedTask.Assignee;
      if (targetPhone) {
        const targetUser = await Users.getUserByPhone(targetPhone);
        if (targetUser?.id) {
          NotificationService.sendTaskUpdated(targetUser.id, updatedTask);
        }
      }
    } catch (e) {
      logger.error(`Notify on updateTask failed: ${e.message}`);
    }

    res.json(ApiResponse.success(updatedTask, 1, 200));
  } catch (error) {
    logger.error(`Error updating task: ${error.message}`);
    res.status(500).json(ApiResponse.error(error.message, 500));
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBy = req.user.phoneNo;

    // Validate ID
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json(ApiResponse.error("Valid task ID is required", 400));
    }

    // Validate status
    if (!status) {
      return res.status(400).json(ApiResponse.error("Status is required", 400));
    }

    const validStatuses = [
      "Pending",
      "In Progress",
      "Completed",
      "Rejected",
      "Reverted",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            `Status must be one of: ${validStatuses.join(", ")}`,
            400
          )
        );
    }

    // Check if task exists and user has permission
    const existingTask = await Task.getTaskById(parseInt(id));
    if (!existingTask) {
      return res.status(404).json(ApiResponse.error("Task not found", 404));
    }

    const userPhone = req.user.phoneNo;
    if (
      existingTask.Assignee !== userPhone &&
      existingTask.AssignTo !== userPhone
    ) {
      return res.status(403).json(ApiResponse.error("Access denied", 403));
    }

    const updatedTask = await Task.updateTaskStatus(parseInt(id), status);

    logger.info(`Task ${id} status updated to ${status} by ${updatedBy}`);
    // Notify the other party (or both for Reverted)
    try {
      const assigneeUser = await Users.getUserByPhone(updatedTask.Assignee);
      const assignToUser = await Users.getUserByPhone(updatedTask.AssignTo);
      if (status === "Reverted") {
        const ids = [assigneeUser?.id, assignToUser?.id].filter(Boolean);
        if (ids.length) {
          NotificationService.sendTaskStatusChanged(ids, updatedTask, status);
        }
      } else {
        const isCurrentUserAssignee = updatedTask.Assignee === userPhone;
        const notifyUserId = isCurrentUserAssignee
          ? assignToUser?.id
          : assigneeUser?.id;
        if (notifyUserId) {
          NotificationService.sendTaskStatusChanged(
            notifyUserId,
            updatedTask,
            status
          );
        }
      }
    } catch (e) {
      logger.error(`Notify on updateTaskStatus failed: ${e.message}`);
    }

    res.json(ApiResponse.success(updatedTask, 1, 200));
  } catch (error) {
    logger.error(`Error updating task status: ${error.message}`);
    res.status(500).json(ApiResponse.error(error.message, 500));
  }
};
