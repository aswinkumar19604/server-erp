import express from "express";

import {
  getNotifications,
  markAsRead
} from "../controllers/notificationController.js";

const router = express.Router();

router.get(
  "/",
  getNotifications
);

router.put(
  "/:id",
  markAsRead
);

export default router;