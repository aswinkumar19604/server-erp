import express from "express";

import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getUsers
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

router.get("/users", authMiddleware, getUsers);

export default router;