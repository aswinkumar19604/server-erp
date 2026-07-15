import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";

const resolveEmployeeRef = async (employeeInput) => {
  if (!employeeInput) {
    throw new Error("Employee ID is required");
  }

  if (mongoose.Types.ObjectId.isValid(employeeInput)) {
    const employee = await Employee.findById(employeeInput);
    if (employee) return employee._id;
    throw new Error("Wrong employee ID");
  }

  const employee = await Employee.findOne({ employeeId: employeeInput });
  if (!employee) throw new Error("Wrong employee ID");

  return employee._id;
};

export const getHRDashboard = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const presentCount = await Attendance.countDocuments({ status: "Present" });
    const leaveCount = await Leave.countDocuments({ status: "Pending" });
    const payrollCount = await Payroll.countDocuments();

    return res.status(200).json({
      totalEmployees,
      presentCount,
      leaveCount,
      payrollCount
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.find().populate("employee").sort({ date: -1 });
    return res.status(200).json(attendances);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const { employeeId, employee, ...rest } = req.body;
    const employeeRef = await resolveEmployeeRef(employeeId ?? employee);

    const attendance = new Attendance({ ...rest, employee: employeeRef });
    await attendance.save();
    return res.status(201).json(attendance);
  } catch (error) {
    if (error.message === "Wrong employee ID" || error.message === "Employee ID is required") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employee").sort({ startDate: -1 });
    return res.status(200).json(leaves);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createLeave = async (req, res) => {
  try {
    const { employeeId, employee, ...rest } = req.body;
    const employeeRef = await resolveEmployeeRef(employeeId ?? employee);

    const leave = new Leave({ ...rest, employee: employeeRef });
    await leave.save();
    return res.status(201).json(leave);
  } catch (error) {
    if (error.message === "Wrong employee ID" || error.message === "Employee ID is required") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    return res.status(200).json(leave);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate("employee").sort({ createdAt: -1 });
    return res.status(200).json(payrolls);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createPayroll = async (req, res) => {
  try {
    const { employeeId, employee, ...rest } = req.body;
    const employeeRef = await resolveEmployeeRef(employeeId ?? employee);

    const payroll = new Payroll({ ...rest, employee: employeeRef });
    await payroll.save();
    return res.status(201).json(payroll);
  } catch (error) {
    if (error.message === "Wrong employee ID" || error.message === "Employee ID is required") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};
