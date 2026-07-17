import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Customer from "../models/Customer.js";
import StockHistory from "../models/StockHistory.js";
import Notification from "../models/Notification.js";
import { postJournalEntry } from "./doubleEntryController.js";
import { logAudit } from "../utils/auditLogger.js";
import { sendInvoiceEmail } from "../utils/emailService.js";

// =========================
// CREATE SALE
// =========================
export const createSale = async (req, res) => {

  try {

    let {
      customer,
      product,
      quantity,
      paymentStatus
    } = req.body;

    quantity = Number(quantity);

    console.log("SALE STARTED");

    // =========================
    // CHECK CUSTOMER
    // =========================

    const customerData =
      await Customer.findById(customer);

    if (!customerData) {

      return res.status(404).json({
        message: "Customer not found"
      });
    }

    // =========================
    // CHECK PRODUCT
    // =========================

    const productData =
      await Product.findById(product);

    if (!productData) {

      return res.status(404).json({
        message: "Product not found"
      });
    }

    // =========================
    // STOCK CHECK
    // =========================

    if (productData.stock < quantity) {

      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    // =========================
    // CALCULATE TOTAL
    // =========================

    const total =
      quantity * productData.price;

    // =========================
    // GENERATE INVOICE
    // =========================

    const invoiceNumber =
      "INV-" + Date.now();

    // =========================
    // CREATE SALE
    // =========================

    const sale =
      await Sale.create({

        customer,

        product,

        quantity,

        price: productData.price,

        total,

        paymentStatus,

        invoiceNumber
      });

    // =========================
    // POST JOURNAL ENTRY (DOUBLE-ENTRY)
    // =========================
    postJournalEntry({
      description: `Sale of ${productData.name} - ${invoiceNumber}`,
      lines: [
        {
          accountCode: paymentStatus === "Paid" ? "1010" : "1200", // Cash or A/R
          type: "Debit",
          amount: total
        },
        {
          accountCode: "4000", // Sales Revenue
          type: "Credit",
          amount: total
        }
      ],
      referenceId: sale._id,
      referenceType: "Sale"
    });

    // =========================
    // STOCK HISTORY
    // =========================

    const previousStock =
      productData.stock;

    const newStock =
      previousStock - quantity;

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
      "Sales",
      sale._id,
      `Sales invoice checkout completed: ${invoiceNumber} for ₹${total.toLocaleString()}`,
      { product: productData.name, quantity, total }
    );

    // =========================
    // SALE NOTIFICATION
    // =========================

    await Notification.create({

      title: "New Sale",

      message:
        `Sale created with invoice ${invoiceNumber}`,

      type: "sale"
    });

    // =========================
    // SAVE STOCK HISTORY
    // =========================

    await StockHistory.create({

      product,

      actionType: "SALE",

      quantity,

      previousStock,

      newStock,

      referenceId: sale._id,

      note:
        `Sale created (${invoiceNumber})`
    });

    // =========================
    // UPDATE INVENTORY
    // =========================

    const inventory =
      await Inventory.findOne({
        product
      });

    if (inventory) {

      inventory.stockOut += quantity;

      inventory.availableStock -= quantity;

     inventory.status =
          inventory.availableStock <= productData.minimum_record_qty
            ? "Low Stock"
            : "In Stock";

      await inventory.save();

      // =========================
      // LOW STOCK NOTIFICATION
      // =========================

      // LOW STOCK ALERT (SMART SYSTEM)
      if (inventory.availableStock <= productData.minimum_record_qty) {

        await Notification.create({
          title: "Low Stock Alert",
          message: `${productData.name} reached minimum level (${inventory.availableStock})`,
          type: "inventory"
        });

      }
    }

    // =========================
    // DISPATCH TRANSACTION INVOICE EMAIL (BACKGROUND)
    // =========================
    sendInvoiceEmail({
      sale,
      customer: customerData,
      product: productData
    }).catch(err => console.log("Email background error:", err));

    console.log("SALE COMPLETED");

    return res.status(201).json({

      message:
        "Sale Completed Successfully",

      sale
    });

  } catch (error) {

    console.log("SALE ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};

// =========================
// GET SALES
// =========================
export const getSales = async (req, res) => {

  try {

    const sales =
      await Sale.find()

      .populate("product")

      .populate("customer")

      .sort({
        createdAt: -1
      });

    return res.status(200).json(
      sales
    );

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });
  }
};

// =========================
// DELETE SALE
// =========================
export const deleteSale = async (req, res) => {

  try {

    const sale =
      await Sale.findById(
        req.params.id
      );

    if (!sale) {

      return res.status(404).json({
        message: "Sale not found"
      });
    }

    // =========================
    // PRODUCT
    // =========================

    const product =
      await Product.findById(
        sale.product
      );

    if (product) {

      const previousStock =
        product.stock;

      const newStock =
        previousStock +
        sale.quantity;

      // RESTORE STOCK

      product.stock =
        newStock;

      await product.save();

      // =========================
      // STOCK HISTORY
      // =========================

      await StockHistory.create({

        product: sale.product,

        actionType: "SALE_DELETE",

        quantity: sale.quantity,

        previousStock,

        newStock,

        referenceId: sale._id,

        note:
          `Sale deleted (${sale.invoiceNumber})`
      });

      // =========================
      // DELETE NOTIFICATION
      // =========================

      await Notification.create({

        title: "Sale Deleted",

        message:
          `Sale deleted (${sale.invoiceNumber})`,

        type: "sale"
      });
    }

    // =========================
    // UPDATE INVENTORY
    // =========================

    const inventory =
      await Inventory.findOne({

        product:
          sale.product
      });

    if (inventory) {

      inventory.stockOut -=
        sale.quantity;

      inventory.availableStock +=
        sale.quantity;

      inventory.status =
        inventory.availableStock <= 10
        ? "Low Stock"
        : "In Stock";

      await inventory.save();
    }

    // =========================
    // DELETE SALE
    // =========================

    await Sale.findByIdAndDelete(
      req.params.id
    );

    // Log audit activity
    logAudit(
      req,
      "DELETE",
      "Sales",
      sale._id,
      `Sales invoice record deleted: ${sale.invoiceNumber} for ₹${sale.total.toLocaleString()}`,
      { invoiceNumber: sale.invoiceNumber, total: sale.total }
    );

    console.log("SALE DELETED");

    return res.status(200).json({

      message:
        "Sale Deleted & Stock Restored"
    });

  } catch (error) {

    console.log("DELETE ERROR:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};