import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

// =========================
// CREATE / UPDATE INVENTORY
// =========================
export const createInventory = async (req, res) => {
  try {
    const {
      product,
      stockIn = 0,
      stockOut = 0,
      warehouse = "Main Warehouse"
    } = req.body;

    const productExists = await Product.findById(product);

    if (!productExists) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    let inventory = await Inventory.findOne({ product });

    if (!inventory) {
      inventory = new Inventory({
        product,
        stockIn: 0,
        stockOut: 0,
        availableStock: 0,
        warehouse,
        status: "In Stock"
      });
    }

    // update stock
    inventory.stockIn += Number(stockIn);
    inventory.stockOut += Number(stockOut);

    inventory.availableStock =
      inventory.stockIn - inventory.stockOut;

    // LOW STOCK LOGIC (IMPORTANT)
    const minQty = productExists.minimum_record_qty || 10;

    inventory.status =
      inventory.availableStock <= minQty
        ? "Low Stock"
        : "In Stock";

    await inventory.save();

    // OPTIONAL: sync product stock (only display purpose)
    productExists.stock = inventory.availableStock;
    await productExists.save();

    // NOTIFICATION
    if (inventory.availableStock <= minQty) {
      await Notification.create({
        title: "Low Stock Alert",
        message: `${productExists.name} reached minimum stock level`,
        type: "inventory"
      });
    }

    return res.status(200).json({
      message: "Inventory Updated Successfully",
      inventory
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// =========================
// GET INVENTORY
// =========================
export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json(inventory);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// =========================
// DELETE INVENTORY
// =========================
export const deleteInventory = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Inventory Deleted"
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};