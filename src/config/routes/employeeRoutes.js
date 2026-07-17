import express from "express";

import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee
}
from "../controllers/employeeController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  createEmployee
);

router.get(
  "/",
  getEmployees
);

router.put(
  "/:id",
  updateEmployee
);

router.delete(
  "/:id",
  deleteEmployee
);

export default router;