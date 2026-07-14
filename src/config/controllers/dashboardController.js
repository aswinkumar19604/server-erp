import Employee from "../models/Employee.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";

export const getDashboard = async (req, res) => {

  try {

    // =====================
    // BASIC COUNTS
    // =====================
    const totalEmployees = await Employee.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalInventory = await Inventory.countDocuments();

    // =====================
    // LOAD DATA
    // =====================
    const products = await Product.find();
    const inventories = await Inventory.find().populate("product");

    // =====================
    // MAP INVENTORY
    // =====================
    const inventoryMap = new Map();

    inventories.forEach((inv) => {
      if (inv.product) {
        inventoryMap.set(inv.product._id.toString(), inv);
      }
    });

    // =====================
    // LOW STOCK LOGIC (FIXED ERP)
    // =====================
    let lowStock = 0;
    const lowStockProducts = [];

    for (let product of products) {

      const inv = inventoryMap.get(product._id.toString());

      // fallback stock (important fix)
      const availableStock = inv?.availableStock ?? product.stock;

      const minQty = product.minimum_record_qty || 10;

      if (availableStock <= minQty) {
        lowStock++;

        lowStockProducts.push({
          productId: product._id,
          productName: product.name,
          availableStock,
          minimum_record_qty: minQty
        });
      }
    }

    // =====================
    // STOCK VALUE
    // =====================
    let totalStockValue = 0;

    inventories.forEach((item) => {
      totalStockValue +=
        (item.availableStock || 0) *
        (item.product?.price || 0);
    });

    // =====================
    // RECENT INVENTORY
    // =====================
    const recentInventory = await Inventory.find()
      .populate("product")
      .sort({ createdAt: -1 })
      .limit(10);

    // =====================
    // SALES TOTAL
    // =====================
    const sales = await Sale.find();

    const totalSalesAmount = sales.reduce(
      (acc, item) => acc + (item.total || 0),
      0
    );

    // =====================
    // PURCHASE TOTAL
    // =====================
    const purchases = await Purchase.find();

    const totalPurchaseAmount = purchases.reduce(
      (acc, item) => acc + (item.total || 0),
      0
    );

    // =====================
    // PROFIT
    // =====================
    const profit = totalSalesAmount - totalPurchaseAmount;

    // =====================
    // RESPONSE
    // =====================
    return res.status(200).json({
      totalEmployees,
      totalProducts,
      totalInventory,

      lowStock,
      lowStockProducts, // optional but useful

      totalStockValue,
      recentInventory,

      totalSalesAmount,
      totalPurchaseAmount,
      profit
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });
  }
};




  export const getMonthlyReport = async (req, res) => {
    try {

      // =========================
      // SALES MONTHLY
      // =========================
      const salesData = await Sale.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: "$total" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // FORMAT SALES
      const sales = salesData.map((item) => ({
        month: item._id,

        monthName: new Date(
          2024,
          item._id - 1
        ).toLocaleString("default", {
          month: "short"
        }),

        total: item.total
      }));

      // =========================
      // PURCHASE MONTHLY
      // =========================
      const purchaseData = await Purchase.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: "$total" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // FORMAT PURCHASES
      const purchases = purchaseData.map((item) => ({
        month: item._id,

        monthName: new Date(
          2024,
          item._id - 1
        ).toLocaleString("default", {
          month: "short"
        }),

      total: item.total
    }));

    // RESPONSE
    res.status(200).json({
      sales,
      purchases
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};