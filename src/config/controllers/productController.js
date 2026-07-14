import Product
from "../models/Product.js";

export const createProduct =
async (req, res) => {

  try {

    const {
      sku,
      name
    } = req.body;

    const skuExists =
      await Product.findOne({
        sku
      });

    if (skuExists) {

      return res.status(400).json({
        message:
          "SKU already exists"
      });
    }

    const nameExists =
      await Product.findOne({
        name
      });

    if (nameExists) {

      return res.status(400).json({
        message:
          "Product already exists"
      });
    }

    const product =
      await Product.create(
        req.body
      );

    res.status(201).json({
      message:
        "Product Added",
      product
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const getProducts =
async (req, res) => {

  try {

    const products =
      await Product.find();

    res.status(200).json(
      products
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const oldStock = product.stock;

    // 1. update product
    Object.assign(product, req.body);
    await product.save();

    // 2. sync inventory
    const inventory = await Inventory.findOne({
      product: productId
    });

    if (inventory && req.body.stock !== undefined) {
      
      const diff = Number(req.body.stock) - oldStock;

      inventory.availableStock += diff;
      inventory.stockIn += diff; // optional sync

      inventory.status =
        inventory.availableStock <= (product.minimum_record_qty || 10)
          ? "Low Stock"
          : "In Stock";

      await inventory.save();
    }

    return res.status(200).json({
      message: "Product updated & inventory synced",
      product
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


import Inventory from "../models/Inventory.js";

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // 1. Check product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // 2. Delete inventory linked to product
    await Inventory.findOneAndDelete({
      product: productId
    });

    // 3. Delete product
    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      message: "Product & Inventory deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};