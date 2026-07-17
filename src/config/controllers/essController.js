import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";
import Project from "../models/Project.js";
import { logAudit } from "../utils/auditLogger.js";

// Helper: Get linked employee profile
const getLinkedEmployee = async (req) => {
  if (req.user.role === "admin" && req.query.employeeId) {
    const employee = await Employee.findById(req.query.employeeId);
    if (!employee) throw new Error("Employee profile not found.");
    return employee;
  }
  const employee = await Employee.findOne({ email: req.user.email });
  if (!employee) {
    throw new Error("No Employee profile matches your account email. Contact your Admin.");
  }
  return employee;
};

// ==========================================
// GET ESS PROFILE
// ==========================================
export const getESSProfile = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req);
    return res.status(200).json(employee);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// ==========================================
// CLOCK IN / OUT ATTENDANCE
// ==========================================
export const clockAttendance = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req);

    // Get today's range (00:00 to 23:59)
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Check if attendance already exists for today
    const existing = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    if (existing) {
      return res.status(400).json({ message: "You have already clocked in for today!" });
    }

    const attendance = new Attendance({
      employee: employee._id,
      date: new Date(),
      status: "Present",
      notes: req.body.notes || "Clocked in via Employee Self-Service"
    });

    await attendance.save();

    logAudit(
      req,
      "CREATE",
      "HR",
      attendance._id,
      `Employee clocked in attendance: ${employee.name}`,
      { status: "Present", notes: attendance.notes }
    );

    return res.status(201).json({ message: "Attendance clocked in successfully", attendance });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET ESS ATTENDANCE HISTORY
// ==========================================
export const getESSAttendance = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req);
    const attendance = await Attendance.find({ employee: employee._id }).sort({ date: -1 });
    return res.status(200).json(attendance);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// REQUEST ESS LEAVE
// ==========================================
export const requestESSLeave = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req);
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and End date are required" });
    }

    const leave = new Leave({
      employee: employee._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: "Pending"
    });

    await leave.save();

    logAudit(
      req,
      "CREATE",
      "HR",
      leave._id,
      `Employee submitted leave request: ${employee.name} - ${leaveType}`,
      { leaveType, startDate, endDate, reason }
    );

    return res.status(201).json({ message: "Leave request submitted successfully", leave });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET ESS LEAVE HISTORY
// ==========================================
export const getESSLeaves = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req);
    const leaves = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 });
    return res.status(200).json(leaves);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET ESS PAYROLL RECORDS
// ==========================================
export const getESSPayrolls = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req);
    const payrolls = await Payroll.find({ employee: employee._id }).sort({ createdAt: -1 });
    return res.status(200).json(payrolls);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET ESS ASSIGNED TASKS (NEW)
// ==========================================
export const getESSTasks = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req);
    // Find all projects containing tasks assigned to the employee email (case-insensitive query)
    const projects = await Project.find({
      "tasks.assignee": { $regex: new RegExp("^" + employee.email + "$", "i") }
    });

    const assignedTasks = [];
    projects.forEach((proj) => {
      proj.tasks.forEach((t) => {
        if (t.assignee && t.assignee.toLowerCase() === employee.email.toLowerCase()) {
          assignedTasks.push({
            projectId: proj._id,
            projectTitle: proj.title,
            title: t.title,
            status: t.status,
            dueDate: t.dueDate
          });
        }
      });
    });

    return res.status(200).json(assignedTasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// UPDATE ESS TASK STATUS (NEW)
// ==========================================
export const updateESSTaskStatus = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req);
    const { projectId, taskTitle, status } = req.body;

    if (!projectId || !taskTitle || !status) {
      return res.status(400).json({ message: "projectId, taskTitle, and status are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const task = project.tasks.find(
      (t) => t.title === taskTitle && t.assignee && t.assignee.toLowerCase() === employee.email.toLowerCase()
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found or not assigned to you" });
    }

    task.status = status;

    // Sync parent project status with task status changes
    if (status === "In Progress") {
      project.status = "In Progress";
    } else if (status === "Completed") {
      project.status = "Completed";
    }

    await project.save();

    await logAudit({
      user: employee.email,
      action: "UPDATE_TASK_STATUS",
      details: `Updated task "${taskTitle}" status to "${status}" in project "${project.title}"`
    });

    return res.status(200).json({ message: "Task status updated successfully", task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
