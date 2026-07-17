import express from "express";

import {
  createPurchase,
  getPurchases,
  deletePurchase
}
from "../controllers/purchaseController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  createPurchase
);

router.get(
  "/",
  getPurchases
);

router.delete(
  "/:id",
  deletePurchase
);

export default router;