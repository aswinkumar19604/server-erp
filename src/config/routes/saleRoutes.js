import express from "express";

import {
  createSale,
  getSales,
  deleteSale
}
from "../controllers/saleController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  createSale
);

router.get(
  "/",
  getSales
);

router.delete(
  "/:id",
  deleteSale
);

export default router;