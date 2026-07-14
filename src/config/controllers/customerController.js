import Customer
from "../models/Customer.js";

export const createCustomer =
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

    const existingCustomer =
      await Customer.findOne({

        $or: [
          { email },
          { phone }
        ]
      });

    if (existingCustomer) {

      return res.status(400).json({
        message:
          "Customer already exists"
      });
    }

    const customer =
      await Customer.create({

        name,
        email,
        phone,
        address,
        gstNumber
      });

    res.status(201).json({

      message:
        "Customer Created",

      customer
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const getCustomers =
async (req, res) => {

  try {

    const customers =
      await Customer.find()
      .sort({ createdAt: -1 });

    res.status(200).json(
      customers
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const updateCustomer =
async (req, res) => {

  try {

    const customer =
      await Customer.findByIdAndUpdate(

        req.params.id,

        req.body,

        { new: true }
      );

    res.status(200).json({

      message:
        "Customer Updated",

      customer
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const deleteCustomer =
async (req, res) => {

  try {

    await Customer.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({

      message:
        "Customer Deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};