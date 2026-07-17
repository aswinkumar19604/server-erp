import Customer from "../models/Customer.js";
import { logAudit } from "../utils/auditLogger.js";

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

    logAudit(
      req,
      "CREATE",
      "Sales",
      customer._id,
      `Customer registered: ${customer.name} (${customer.email})`,
      { name: customer.name, email: customer.email }
    );

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

    logAudit(
      req,
      "UPDATE",
      "Sales",
      customer._id,
      `Customer records updated: ${customer.name} (${customer.email})`,
      req.body
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

    const customer = await Customer.findById(req.params.id);
    if (customer) {
      await Customer.findByIdAndDelete(
        req.params.id
      );

      logAudit(
        req,
        "DELETE",
        "Sales",
        customer._id,
        `Customer record deleted: ${customer.name} (${customer.email})`,
        { name: customer.name, email: customer.email }
      );
    } else {
      await Customer.findByIdAndDelete(
        req.params.id
      );
    }

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