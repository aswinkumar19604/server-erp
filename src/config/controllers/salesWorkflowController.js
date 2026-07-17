import Quotation from "../models/Quotation.js";
import SalesOrder from "../models/SalesOrder.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import StockHistory from "../models/StockHistory.js";
import { postJournalEntry } from "./doubleEntryController.js";

// ==========================================
// QUOTATION CONTROLLERS
// ==========================================

export const createQuotation = async (req, res) => {
  try {
    const { customer, items, validUntil } = req.body;

    if (!customer || !items || items.length === 0 || !validUntil) {
      return res.status(400).json({ message: "Customer, items, and validity date are required" });
    }

    const quotationNumber = "QT-" + Date.now();
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.price;
    }

    const quotation = new Quotation({
      quotationNumber,
      customer,
      items,
      totalAmount,
      validUntil,
      status: "Draft"
    });

    await quotation.save();
    return res.status(201).json(quotation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate("customer")
      .populate("items.product")
      .sort({ createdAt: -1 });
    return res.status(200).json(quotations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    quotation.status = status;
    await quotation.save();

    return res.status(200).json({ message: `Quotation updated to ${status}`, quotation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SALES ORDER CONTROLLERS
// ==========================================

export const createSalesOrder = async (req, res) => {
  try {
    const { customer, items, shippingAddress, deliveryDate, quotationRef } = req.body;

    if (!customer || !items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ message: "Customer, items, and shipping address are required" });
    }

    const salesOrderNumber = "SO-" + Date.now();

    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.price;
    }

    const salesOrder = new SalesOrder({
      salesOrderNumber,
      customer,
      quotationRef,
      items,
      totalAmount,
      shippingAddress,
      deliveryDate,
      status: "Draft"
    });

    await salesOrder.save();
    return res.status(201).json(salesOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSalesOrders = async (req, res) => {
  try {
    const salesOrders = await SalesOrder.find()
      .populate("customer")
      .populate("items.product")
      .sort({ createdAt: -1 });
    return res.status(200).json(salesOrders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// PIPELINE & CONVERSION CONTROLLERS
// ==========================================

export const convertQuoteToSO = async (req, res) => {
  try {
    const { shippingAddress, deliveryDate } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (quotation.status === "Approved") {
      return res.status(400).json({ message: "Quotation has already been approved and converted." });
    }

    quotation.status = "Approved";
    await quotation.save();

    // Create corresponding sales order
    const salesOrderNumber = "SO-" + Date.now();
    const salesOrder = new SalesOrder({
      salesOrderNumber,
      customer: quotation.customer,
      quotationRef: quotation._id,
      items: quotation.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: quotation.totalAmount,
      shippingAddress: shippingAddress || "Customer Registered Address",
      deliveryDate: deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
      status: "Approved" // Auto-approve converted SOs
    });

    await salesOrder.save();

    return res.status(201).json({
      message: "Quotation successfully approved and converted to Sales Order",
      salesOrder
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const convertSOToInvoice = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id).populate("items.product");

    if (!salesOrder) {
      return res.status(404).json({ message: "Sales Order not found" });
    }

    if (salesOrder.status === "Invoiced") {
      return res.status(400).json({ message: "Sales Order has already been invoiced." });
    }

    // Verify stock availability
    const shortfalls = [];
    for (const item of salesOrder.items) {
      if (item.product.stock < item.quantity) {
        shortfalls.push({
          name: item.product.name,
          required: item.quantity,
          available: item.product.stock,
          short: item.quantity - item.product.stock
        });
      }
    }

    if (shortfalls.length > 0) {
      return res.status(400).json({
        message: "Insufficient product inventory. Cannot invoice order.",
        shortfalls
      });
    }

    // Process checkout: deduct stock and write stock history
    const invoiceNumber = "INV-" + Date.now();

    for (const item of salesOrder.items) {
      const product = await Product.findById(item.product._id);
      const previousStock = product.stock;
      
      product.stock -= item.quantity;
      await product.save();

      // Create Sale record to show in regular Sales module list
      await Sale.create({
        customer: salesOrder.customer,
        product: product._id,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
        paymentStatus: "Unpaid", // Unpaid by default until cash journal receipt
        invoiceNumber
      });

      // Write StockHistory log
      await StockHistory.create({
        product: product._id,
        actionType: "SALE",
        quantity: item.quantity,
        previousStock,
        newStock: product.stock,
        referenceId: salesOrder._id
      });
    }

    // Post General Ledger Double-Entry journal records
    postJournalEntry({
      description: `Sales Order Invoiced - ${salesOrder.salesOrderNumber} & Invoice ${invoiceNumber}`,
      lines: [
        {
          accountCode: "1200", // Accounts Receivable (A/R)
          type: "Debit",
          amount: salesOrder.totalAmount
        },
        {
          accountCode: "4000", // Sales Revenue
          type: "Credit",
          amount: salesOrder.totalAmount
        }
      ],
      referenceId: salesOrder._id,
      referenceType: "SalesOrder"
    });

    salesOrder.status = "Invoiced";
    await salesOrder.save();

    return res.status(200).json({
      message: "Sales Order successfully finalized and converted to Sales Invoice",
      salesOrder
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSalesOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const salesOrder = await SalesOrder.findById(req.params.id);

    if (!salesOrder) {
      return res.status(404).json({ message: "Sales Order not found" });
    }

    salesOrder.status = status;
    await salesOrder.save();

    return res.status(200).json({ message: `Sales Order status updated to ${status}`, salesOrder });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
