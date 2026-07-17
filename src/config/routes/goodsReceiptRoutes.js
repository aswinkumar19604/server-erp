import express from "express";
import {
  createGoodsReceipt,
  getGoodsReceipts
} from "../controllers/goodsReceiptController.js";

const router = express.Router();

router.post("/", createGoodsReceipt);
router.get("/", getGoodsReceipts);

export default router;
