const express = require("express");
const router = express.Router();
const { authVerify } = require("../middlewares/auth.middleware");

const controller = require("../controllers/notifications.controller");
router.post("/register", authVerify, controller.register);
router.post("/unregister", authVerify, controller.unregister);
router.post("/test", authVerify, controller.test);

module.exports = router;


