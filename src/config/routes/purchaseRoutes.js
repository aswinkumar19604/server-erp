import express from "express";

import {
  createPurchase,
  getPurchases,
  deletePurchase
}
from "../controllers/purchaseController.js";

const router = express.Router();

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