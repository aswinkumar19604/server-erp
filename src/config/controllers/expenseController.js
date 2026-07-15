import Expense from "../models/Expense.js";

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    return res.status(201).json(expense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    return res.status(200).json(expense);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    return res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const pending = expenses.filter((item) => item.status === "Pending").reduce((sum, item) => sum + (item.amount || 0), 0);
    const approved = expenses.filter((item) => item.status === "Approved").reduce((sum, item) => sum + (item.amount || 0), 0);
    const paid = expenses.filter((item) => item.status === "Paid").reduce((sum, item) => sum + (item.amount || 0), 0);

    return res.status(200).json({ totalExpenses, pending, approved, paid, count: expenses.length });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
