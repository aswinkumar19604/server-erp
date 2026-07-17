import GoodsReceipt from "../models/GoodsReceipt.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import StockHistory from "../models/StockHistory.js";
import Notification from "../models/Notification.js";

// ==========================================
// CREATE GOODS RECEIPT (GRN)
// ==========================================
export const createGoodsReceipt = async (req, res) => {
  try {
    const { purchaseOrder, itemsReceived, notes } = req.body;

    if (!purchaseOrder || !itemsReceived || !itemsReceived.length) {
      return res.status(400).json({ message: "Purchase Order and received items are required" });
    }

    const po = await PurchaseOrder.findById(purchaseOrder);
    if (!po) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    if (!["Ordered", "Partially Received"].includes(po.status)) {
      return res.status(400).json({ message: "Can only receive goods for Ordered or Partially Received Purchase Orders" });
    }

    // Validate quantities and products
    const finalItemsReceived = [];

    for (const item of itemsReceived) {
      const { product, quantityReceived } = item;
      const qtyRec = Number(quantityReceived);

      if (!product || qtyRec <= 0) {
        return res.status(400).json({ message: "Invalid product or quantity received" });
      }

      // Find item inside the PO
      const poItem = po.items.find(pi => pi.product.toString() === product);
      if (!poItem) {
        return res.status(400).json({ message: `Product is not in the Purchase Order` });
      }

      const remainingQty = poItem.quantity - poItem.receivedQuantity;
      if (qtyRec > remainingQty) {
        return res.status(400).json({
          message: `Received quantity (${qtyRec}) exceeds remaining ordered quantity (${remainingQty})`
        });
      }

      poItem.receivedQuantity += qtyRec;
      finalItemsReceived.push({ product, quantityReceived: qtyRec });
    }

    // Create the Goods Receipt
    const grnNumber = "GRN-" + Date.now();
    const goodsReceipt = new GoodsReceipt({
      grnNumber,
      purchaseOrder,
      itemsReceived: finalItemsReceived,
      notes
    });

    await goodsReceipt.save();

    // Process stock increments
    for (const item of finalItemsReceived) {
      const { product, quantityReceived } = item;
      const productData = await Product.findById(product);

      if (productData) {
        const previousStock = productData.stock || 0;
        const newStock = previousStock + quantityReceived;

        productData.stock = newStock;
        await productData.save();

        // Update Inventory record
        let inventory = await Inventory.findOne({ product });
        if (inventory) {
          inventory.stockIn += quantityReceived;
          inventory.availableStock += quantityReceived;
          inventory.status = inventory.availableStock <= Number(productData.minimum_record_qty || 10)
            ? "Low Stock"
            : "In Stock";
          await inventory.save();
        } else {
          inventory = await Inventory.create({
            product,
            stockIn: quantityReceived,
            stockOut: 0,
            availableStock: quantityReceived,
            warehouse: "Main Warehouse",
            status: quantityReceived <= Number(productData.minimum_record_qty || 10) ? "Low Stock" : "In Stock"
          });
        }

        // Log Stock History
        await StockHistory.create({
          product,
          actionType: "GOODS_RECEIPT",
          quantity: quantityReceived,
          previousStock,
          newStock,
          referenceId: goodsReceipt._id,
          note: `Received via receipt ${grnNumber} for order ${po.poNumber}`
        });
      }
    }

    // Update PO status
    const isFullyReceived = po.items.every(pi => pi.receivedQuantity >= pi.quantity);
    po.status = isFullyReceived ? "Fully Received" : "Partially Received";
    await po.save();

    // Create Notification
    await Notification.create({
      title: "Goods Received",
      message: `Goods received under receipt ${grnNumber} for PO ${po.poNumber}`,
      type: "inventory"
    });

    return res.status(201).json({
      message: "Goods Receipt processed successfully",
      goodsReceipt,
      poStatus: po.status
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET ALL GOODS RECEIPTS
// ==========================================
export const getGoodsReceipts = async (req, res) => {
  try {
    const receipts = await GoodsReceipt.find()
      .populate("purchaseOrder")
      .populate("itemsReceived.product")
      .sort({ createdAt: -1 });

    return res.status(200).json(receipts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
