const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { initDB } = require("./config/dbConfig");
const logger = require("./logger");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*", // your frontend URL
    credentials: true, // allow cookies / auth headers
  })
);

// Setup Morgan with Winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.get("/", (req, res) => {
  res.json({
    status: "Backend running",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
    message: "Welcome to the Remainder Queen Backend API!"
  });
});

// Routes
const userRoutes = require("./routes/users.routes");
app.use("/api/v1/users", userRoutes);
const authRoutes = require("./routes/auth.routes");
app.use("/api/v1/auth", authRoutes);
const taskRoutes = require("./routes/task.routes");
app.use("/api/v1/task", taskRoutes);
// Routes

// Notifications routes (FCM token register/unregister)
const notificationsRoutes = require("./routes/notifications.routes");
app.use("/api/v1/notifications", notificationsRoutes);

const PORT = process.env.PORT || 5000;

(async () => {
  await initDB(); // ✅ DB + tables ready once
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
