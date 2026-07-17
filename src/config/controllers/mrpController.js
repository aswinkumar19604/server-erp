import BOM from "../models/BOM.js";
import WorkOrder from "../models/WorkOrder.js";
import Product from "../models/Product.js";
import StockHistory from "../models/StockHistory.js";
import { logAudit } from "../utils/auditLogger.js";

// ==========================================
// BILL OF MATERIALS (BOM) CONTROLLERS
// ==========================================

export const createBOM = async (req, res) => {
  try {
    const { finishedProduct, name, components } = req.body;

    if (!finishedProduct || !name || !components || components.length === 0) {
      return res.status(400).json({ message: "Finished product, name, and components are required" });
    }

    // Check if BOM already exists for this finished product
    const existing = await BOM.findOne({ finishedProduct });
    if (existing) {
      return res.status(400).json({ message: "A Bill of Materials already exists for this finished product." });
    }

    const bom = new BOM({
      finishedProduct,
      name,
      components
    });

    await bom.save();

    logAudit(
      req,
      "CREATE",
      "MRP",
      bom._id,
      `Bill of Materials (BOM) created: ${name}`,
      { name, finishedProduct }
    );

    return res.status(201).json(bom);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBOMs = async (req, res) => {
  try {
    const boms = await BOM.find()
      .populate("finishedProduct")
      .populate("components.product")
      .sort({ createdAt: -1 });
    return res.status(200).json(boms);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// WORK ORDER (PRODUCTION) CONTROLLERS
// ==========================================

export const createWorkOrder = async (req, res) => {
  try {
    const { bom, productToProduce, quantityToProduce } = req.body;

    if (!bom || !productToProduce || !quantityToProduce || quantityToProduce < 1) {
      return res.status(400).json({ message: "BOM, product to produce, and quantity are required" });
    }

    const workOrderNumber = "WO-" + Date.now();
    const workOrder = new WorkOrder({
      workOrderNumber,
      bom,
      productToProduce,
      quantityToProduce,
      status: "Planned"
    });

    await workOrder.save();

    logAudit(
      req,
      "CREATE",
      "MRP",
      workOrder._id,
      `Work Order planned: ${workOrderNumber} (Qty: ${quantityToProduce})`,
      { workOrderNumber, quantityToProduce }
    );

    return res.status(201).json(workOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      .populate("productToProduce")
      .populate({
        path: "bom",
        populate: {
          path: "finishedProduct"
        }
      })
      .populate({
        path: "bom",
        populate: {
          path: "components.product"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(workOrders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateWorkOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate("productToProduce")
      .populate({
        path: "bom",
        populate: {
          path: "finishedProduct"
        }
      })
      .populate({
        path: "bom",
        populate: {
          path: "components.product"
        }
      });

    if (!workOrder) {
      return res.status(404).json({ message: "Work Order not found" });
    }

    const validTransitions = {
      "Planned": ["In Progress", "Cancelled"],
      "In Progress": ["Completed", "Cancelled"],
      "Completed": [],
      "Cancelled": []
    };

    if (!validTransitions[workOrder.status].includes(status)) {
      return res.status(400).json({
        message: `Invalid state transition from ${workOrder.status} to ${status}`
      });
    }

    // Determine recipe formulation components to consume.
    // If producing a component instead of the BOM finished product, see if it has its own BOM formulation.
    let activeBOM = workOrder.bom;
    if (workOrder.productToProduce._id.toString() !== workOrder.bom.finishedProduct._id.toString()) {
      const subBOM = await BOM.findOne({ finishedProduct: workOrder.productToProduce._id })
        .populate("components.product");
      if (subBOM) {
        activeBOM = subBOM;
      } else {
        activeBOM = null; // Direct manual production increase (no sub-ingredients defined)
      }
    }

    // ----------------------------
    // TRANSITION: START PRODUCTION
    // ----------------------------
    if (status === "In Progress") {
      if (activeBOM) {
        // Check component inventory levels
        const shortfalls = [];
        for (const comp of activeBOM.components) {
          const requiredQty = comp.quantity * workOrder.quantityToProduce;
          const currentStock = comp.product.stock || 0;
          if (currentStock < requiredQty) {
            shortfalls.push({
              name: comp.product.name,
              required: requiredQty,
              available: currentStock,
              short: requiredQty - currentStock
            });
          }
        }

        if (shortfalls.length > 0) {
          return res.status(400).json({
            message: "Insufficient raw component stock. Production cannot start.",
            shortfalls
          });
        }
      }

      workOrder.startDate = new Date();
    }

    // ----------------------------
    // TRANSITION: COMPLETE ASSEMBLY
    // ----------------------------
    if (status === "Completed") {
      if (activeBOM) {
        // Deduct component ingredients
        for (const comp of activeBOM.components) {
          const product = await Product.findById(comp.product._id);
          const requiredQty = comp.quantity * workOrder.quantityToProduce;

          if (product.stock < requiredQty) {
            return res.status(400).json({
              message: `Inventory count error: raw material ${product.name} is now depleted below required levels.`
            });
          }

          const previousStock = product.stock;
          product.stock -= requiredQty;
          await product.save();

          // Write raw material deduction ledger entry
          await StockHistory.create({
            product: product._id,
            actionType: "DEDUCTION",
            quantity: requiredQty,
            previousStock,
            newStock: product.stock,
            referenceId: workOrder._id
          });
        }
      }

      // Add produced product stock
      const finishedProduct = await Product.findById(workOrder.productToProduce._id);
      const previousStock = finishedProduct.stock || 0;
      finishedProduct.stock = previousStock + workOrder.quantityToProduce;
      await finishedProduct.save();

      // Write finished product production ledger entry
      await StockHistory.create({
        product: finishedProduct._id,
        actionType: "PRODUCTION",
        quantity: workOrder.quantityToProduce,
        previousStock,
        newStock: finishedProduct.stock,
        referenceId: workOrder._id
      });

      workOrder.completionDate = new Date();
    }

    workOrder.status = status;
    await workOrder.save();

    logAudit(
      req,
      "UPDATE",
      "MRP",
      workOrder._id,
      `Work Order ${workOrder.workOrderNumber} status changed to ${status}`,
      { workOrderNumber: workOrder.workOrderNumber, status }
    );

    return res.status(200).json({
      message: `Work Order status updated to ${status}`,
      workOrder
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
