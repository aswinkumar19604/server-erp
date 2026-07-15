import Accounting from "../models/Accounting.js";

export const getAccountingEntries = async (req, res) => {
  try {
    const entries = await Accounting.find().sort({ date: -1, createdAt: -1 });
    return res.status(200).json(entries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createAccountingEntry = async (req, res) => {
  try {
    const { type, reference = "", party, amount, status = "Pending", date, notes = "" } = req.body;

    if (!type || !party || amount === undefined) {
      return res.status(400).json({ message: "Type, party, and amount are required" });
    }

    const entry = new Accounting({
      type,
      reference,
      party,
      amount: Number(amount),
      status,
      date: date ? new Date(date) : new Date(),
      notes
    });

    await entry.save();

    return res.status(201).json(entry);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAccountingEntry = async (req, res) => {
  try {
    const entry = await Accounting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ message: "Accounting entry not found" });
    }

    return res.status(200).json(entry);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAccountingEntry = async (req, res) => {
  try {
    const entry = await Accounting.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "Accounting entry not found" });
    }

    return res.status(200).json({ message: "Accounting entry deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAccountingSummary = async (req, res) => {
  try {
    const entries = await Accounting.find();

    const invoices = entries.filter((item) => item.type === "invoice");
    const expenses = entries.filter((item) => item.type === "expense");
    const payments = entries.filter((item) => item.type === "payment");

    const totalInvoices = invoices.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalPayments = payments.reduce((sum, item) => sum + (item.amount || 0), 0);

    const pendingInvoices = invoices
      .filter((item) => item.status !== "Paid")
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const pendingExpenses = expenses
      .filter((item) => item.status !== "Paid")
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    return res.status(200).json({
      totalEntries: entries.length,
      totalInvoices,
      totalExpenses,
      totalPayments,
      pendingInvoices,
      pendingExpenses,
      netBalance: totalPayments - totalExpenses,
      outstandingReceivable: pendingInvoices
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
