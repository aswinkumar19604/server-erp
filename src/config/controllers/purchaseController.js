import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Supplier from "../models/Supplier.js";
import StockHistory from "../models/StockHistory.js";
import Notification from "../models/Notification.js";
import { postJournalEntry } from "./doubleEntryController.js";
import { logAudit } from "../utils/auditLogger.js";

// =========================
// CREATE PURCHASE
// =========================
export const createPurchase = async (req, res) => {

  try {

    let {
      supplier,
      product,
      quantity,
      purchasePrice,
      paymentStatus
    } = req.body;

    quantity = Number(quantity);
    purchasePrice = Number(purchasePrice);

    console.log("PURCHASE STARTED");

    // =========================
    // CHECK SUPPLIER
    // =========================

    const supplierData =
      await Supplier.findById(
        supplier
      );

    if (!supplierData) {

      return res.status(404).json({
        message: "Supplier not found"
      });
    }

    // =========================
    // CHECK PRODUCT
    // =========================

    const productData =
      await Product.findById(
        product
      );

    if (!productData) {

      return res.status(404).json({
        message: "Product not found"
      });
    }

    // =========================
    // CALCULATE TOTAL
    // =========================

    const total =
      quantity * purchasePrice;

    // =========================
    // GENERATE INVOICE
    // =========================

    const invoiceNumber =
      "PUR-" + Date.now();

    // =========================
    // CREATE PURCHASE
    // =========================

    const purchase =
      await Purchase.create({

        supplier,

        product,

        quantity,

        purchasePrice,

        total,

        paymentStatus,

        invoiceNumber
      });

    // =========================
    // POST JOURNAL ENTRY (DOUBLE-ENTRY)
    // =========================
    postJournalEntry({
      description: `Purchase of ${productData.name} - ${invoiceNumber}`,
      lines: [
        {
          accountCode: "1300", // Inventory Asset
          type: "Debit",
          amount: total
        },
        {
          accountCode: paymentStatus === "Paid" ? "1010" : "2100", // Cash or A/P
          type: "Credit",
          amount: total
        }
      ],
      referenceId: purchase._id,
      referenceType: "Purchase"
    });

    // =========================
    // STOCK HISTORY
    // =========================

    const previousStock =
      productData.stock;

    const newStock =
      previousStock + quantity;

    // =========================
    // UPDATE PRODUCT STOCK
    // =========================

    productData.stock =
      newStock;

    await productData.save();

    // Log audit activity
    logAudit(
      req,
      "CREATE",
      "Purchases",
      purchase._id,
      `Purchase invoice logged: ${invoiceNumber} for ₹${total.toLocaleString()}`,
      { product: productData.name, quantity, total }
    );

    // =========================
    // PURCHASE NOTIFICATION
    // =========================

    await Notification.create({

      title: "New Purchase",

      message:
        `Purchase created with invoice ${invoiceNumber}`,

      type: "purchase"
    });

    // =========================
    // SAVE STOCK HISTORY
    // =========================

    await StockHistory.create({

      product,

      actionType: "PURCHASE",

      quantity,

      previousStock,

      newStock,

      referenceId:
        purchase._id,

      note:
        `Purchase created (${invoiceNumber})`
    });

    // =========================
    // UPDATE INVENTORY
    // =========================

    let inventory =
      await Inventory.findOne({
        product
      });

    if (inventory) {

      inventory.stockIn += quantity;

      inventory.availableStock += quantity;

      inventory.status =
        inventory.availableStock <= 10
        ? "Low Stock"
        : "In Stock";

      await inventory.save();

    } else {

      inventory =
        await Inventory.create({

          product,

          stockIn: quantity,

          stockOut: 0,

          availableStock:
            quantity,

          warehouse:
            "Main Warehouse",

          status:
            quantity <= 10
            ? "Low Stock"
            : "In Stock"
        });
    }

    console.log("PURCHASE COMPLETED");

    return res.status(201).json({

      message:
        "Purchase Completed Successfully",

      purchase
    });

  } catch (error) {

    console.log("PURCHASE ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

// =========================
// GET PURCHASES
// =========================
export const getPurchases = async (req, res) => {

  try {

    const purchases =
      await Purchase.find()

      .populate("product")

      .populate("supplier")

      .sort({
        createdAt: -1
      });

    return res.status(200).json(
      purchases
    );

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });
  }
};

// =========================
// DELETE PURCHASE
// =========================
export const deletePurchase = async (req, res) => {

  try {

    const purchase =
      await Purchase.findById(
        req.params.id
      );

    if (!purchase) {

      return res.status(404).json({
        message:
          "Purchase not found"
      });
    }

    // =========================
    // PRODUCT
    // =========================

    const product =
      await Product.findById(
        purchase.product
      );

    if (product) {

      // SAFETY CHECK

      if (
        product.stock <
        purchase.quantity
      ) {

        return res.status(400).json({

          message:
            "Cannot delete purchase. Stock mismatch."
        });
      }

      const previousStock =
        product.stock;

      const newStock =
        previousStock -
        purchase.quantity;

      // =========================
      // REDUCE STOCK
      // =========================

      product.stock =
        newStock;

      await product.save();

      // =========================
      // SAVE HISTORY
      // =========================

      await StockHistory.create({

        product:
          purchase.product,

        actionType:
          "PURCHASE_DELETE",

        quantity:
          purchase.quantity,

        previousStock,

        newStock,

        referenceId:
          purchase._id,

        note:
          `Purchase deleted (${purchase.invoiceNumber})`
      });

      // =========================
      // DELETE NOTIFICATION
      // =========================

      await Notification.create({

        title: "Purchase Deleted",

        message:
          `Purchase deleted (${purchase.invoiceNumber})`,

        type: "purchase"
      });
    }

    // =========================
    // UPDATE INVENTORY
    // =========================

    const inventory =
      await Inventory.findOne({

        product:
          purchase.product
      });

    if (inventory) {

      inventory.stockIn -=
        purchase.quantity;

      inventory.availableStock -=
        purchase.quantity;

      inventory.status =
        inventory.availableStock <= 10
        ? "Low Stock"
        : "In Stock";

      await inventory.save();
    }

    // =========================
    // DELETE PURCHASE
    // =========================

    await Purchase.findByIdAndDelete(
      req.params.id
    );

    // Log audit activity
    logAudit(
      req,
      "DELETE",
      "Purchases",
      purchase._id,
      `Purchase record deleted: ${purchase.invoiceNumber} for ₹${purchase.total.toLocaleString()}`,
      { invoiceNumber: purchase.invoiceNumber, total: purchase.total }
    );

    console.log("PURCHASE DELETED");

    return res.status(200).json({

      message:
        "Purchase Deleted & Stock Reduced"
    });

  } catch (error) {

    console.log("DELETE PURCHASE ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};