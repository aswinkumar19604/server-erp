import Employee from "../models/Employee.js";
import { logAudit } from "../utils/auditLogger.js";

export const createEmployee =
async (req, res) => {

  try {

    const {
      employeeId,
      email,
      phone
    } = req.body;

    // CHECK EMPLOYEE ID

    const employeeIdExists =
      await Employee.findOne({
        employeeId
      });

    if (employeeIdExists) {

      return res.status(400).json({
        message:
          "Employee ID already exists"
      });
    }

    // CHECK EMAIL

    const emailExists =
      await Employee.findOne({
        email
      });

    if (emailExists) {

      return res.status(400).json({
        message:
          "Email already exists"
      });
    }

    // CHECK PHONE

    const phoneExists =
      await Employee.findOne({
        phone
      });

    if (phoneExists) {

      return res.status(400).json({
        message:
          "Phone number already exists"
      });
    }

    const employee =
      await Employee.create(
        req.body
      );

    logAudit(
      req,
      "CREATE",
      "HR",
      employee._id,
      `Employee added: ${employee.name} (${employee.designation})`,
      { name: employee.name, email: employee.email, designation: employee.designation }
    );

    res.status(201).json({
      message:
        "Employee Added",
      employee
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const getEmployees =
async (req, res) => {

  try {

    const employees =
      await Employee.find();

    res.status(200).json(
      employees
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const updateEmployee =
async (req, res) => {

  try {

    const employee =
      await Employee.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    logAudit(
      req,
      "UPDATE",
      "HR",
      employee._id,
      `Employee records updated: ${employee.name} (${employee.email})`,
      req.body
    );

    res.status(200).json({
      message:
        "Employee Updated",
      employee
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const deleteEmployee =
async (req, res) => {

  try {

    const employee = await Employee.findById(req.params.id);
    if (employee) {
      await Employee.findByIdAndDelete(
        req.params.id
      );

      logAudit(
        req,
        "DELETE",
        "HR",
        employee._id,
        `Employee contract deleted: ${employee.name} (${employee.email})`,
        { name: employee.name, email: employee.email }
      );
    } else {
      await Employee.findByIdAndDelete(
        req.params.id
      );
    }

    res.status(200).json({
      message:
        "Employee Deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};