import express from "express";

import {

  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier

}
from "../controllers/supplierController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  createSupplier
);

router.get(
  "/",
  getSuppliers
);

router.put(
  "/:id",
  updateSupplier
);

router.delete(
  "/:id",
  deleteSupplier
);

export default router;