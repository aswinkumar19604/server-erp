import Supplier
from "../models/Supplier.js";

export const createSupplier =
async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      address,
      gstNumber
    } = req.body;

    // CHECK DUPLICATE

    const existingSupplier =
      await Supplier.findOne({

        $or: [
          { email },
          { phone }
        ]
      });

    if (existingSupplier) {

      return res.status(400).json({
        message:
          "Supplier already exists"
      });
    }

    const supplier =
      await Supplier.create({

        name,
        email,
        phone,
        address,
        gstNumber
      });

    res.status(201).json({

      message:
        "Supplier Created",

      supplier
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const getSuppliers =
async (req, res) => {

  try {

    const suppliers =
      await Supplier.find()
      .sort({ createdAt: -1 });

    res.status(200).json(
      suppliers
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const updateSupplier =
async (req, res) => {

  try {

    const supplier =
      await Supplier.findByIdAndUpdate(

        req.params.id,

        req.body,

        { new: true }
      );

    res.status(200).json({

      message:
        "Supplier Updated",

      supplier
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const deleteSupplier =
async (req, res) => {

  try {

    await Supplier.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({

      message:
        "Supplier Deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};