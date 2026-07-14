import express from "express";

import {
  createInventory,
  getInventory,
  deleteInventory
}
from "../controllers/inventoryController.js";

const router = express.Router();

router.post(
  "/",
  createInventory
);

router.get(
  "/",
  getInventory
);

router.delete(
  "/:id",
  deleteInventory
);

export default router;