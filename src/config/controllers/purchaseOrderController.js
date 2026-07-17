import PurchaseOrder from "../models/PurchaseOrder.js";

// ==========================================
// CREATE PURCHASE ORDER
// ==========================================
export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, items, notes } = req.body;

    if (!supplier || !items || !items.length) {
      return res.status(400).json({ message: "Supplier and items are required" });
    }

    // Generate unique PO Number
    const poNumber = "PO-" + Date.now();

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.purchasePrice)), 0);

    const purchaseOrder = new PurchaseOrder({
      poNumber,
      supplier,
      items: items.map(item => ({
        product: item.product,
        quantity: Number(item.quantity),
        purchasePrice: Number(item.purchasePrice),
        receivedQuantity: 0
      })),
      totalAmount,
      status: "Draft",
      notes
    });

    await purchaseOrder.save();

    return res.status(201).json({
      message: "Purchase Order created successfully",
      purchaseOrder
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET ALL PURCHASE ORDERS
// ==========================================
export const getPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find()
      .populate("supplier")
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json(purchaseOrders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// UPDATE PURCHASE ORDER
// ==========================================
export const updatePurchaseOrder = async (req, res) => {
  try {
    const { items, supplier, status, notes } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    // Protection logic: cannot edit received orders except cancellation
    if (["Partially Received", "Fully Received"].includes(po.status) && status !== po.status) {
      return res.status(400).json({ message: "Cannot modify completed or partially received Purchase Orders" });
    }

    if (supplier) po.supplier = supplier;
    if (notes !== undefined) po.notes = notes;
    if (status) po.status = status;

    if (items && items.length) {
      po.items = items.map(item => ({
        product: item.product,
        quantity: Number(item.quantity),
        purchasePrice: Number(item.purchasePrice),
        receivedQuantity: item.receivedQuantity || 0
      }));
      po.totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.purchasePrice)), 0);
    }

    await po.save();

    return res.status(200).json({
      message: "Purchase Order updated successfully",
      purchaseOrder: po
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// DELETE PURCHASE ORDER
// ==========================================
export const deletePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    if (!["Draft", "Cancelled"].includes(po.status)) {
      return res.status(400).json({ message: "Can only delete Draft or Cancelled Purchase Orders" });
    }

    await PurchaseOrder.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Purchase Order deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
