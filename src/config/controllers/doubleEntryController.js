import Account from "../models/Account.js";
import JournalEntry from "../models/JournalEntry.js";
import { logAudit } from "../utils/auditLogger.js";

// ==========================================
// SEED CHART OF ACCOUNTS (CoA)
// ==========================================
export const seedChartOfAccounts = async () => {
  try {
    const count = await Account.countDocuments();
    if (count > 0) return; // Already seeded

    const defaultAccounts = [
      { code: "1010", name: "Cash / Bank", type: "Asset", balance: 0 },
      { code: "1200", name: "Accounts Receivable", type: "Asset", balance: 0 },
      { code: "1300", name: "Inventory Asset", type: "Asset", balance: 0 },
      { code: "2100", name: "Accounts Payable", type: "Liability", balance: 0 },
      { code: "3000", name: "Retained Earnings", type: "Equity", balance: 0 },
      { code: "4000", name: "Sales Revenue", type: "Revenue", balance: 0 },
      { code: "5000", name: "Cost of Goods Sold", type: "Expense", balance: 0 },
      { code: "5100", name: "Operating Expenses", type: "Expense", balance: 0 }
    ];

    await Account.insertMany(defaultAccounts);
    console.log("Chart of Accounts seeded successfully.");
  } catch (error) {
    console.error("Failed to seed Chart of Accounts:", error.message);
  }
};

// ==========================================
// HELPER: SYNC HISTORICAL TRANSACTIONS
// ==========================================
export const syncHistoricalTransactions = async () => {
  try {
    const journalCount = await JournalEntry.countDocuments();
    if (journalCount > 0) return; // Already migrated/synced

    console.log("No journal entries found. Syncing historical transactions to general ledger...");

    // Reset account balances to 0
    await Account.updateMany({}, { balance: 0 });

    // Fetch accounts
    const cashAcc = await Account.findOne({ code: "1010" });
    const arAcc = await Account.findOne({ code: "1200" });
    const inventoryAcc = await Account.findOne({ code: "1300" });
    const apAcc = await Account.findOne({ code: "2100" });
    const salesRevAcc = await Account.findOne({ code: "4000" });
    const expenseAcc = await Account.findOne({ code: "5100" });

    if (!cashAcc || !arAcc || !inventoryAcc || !apAcc || !salesRevAcc || !expenseAcc) {
      console.error("Standard accounts not fully seeded. Cannot sync.");
      return;
    }

    // 1. Sync Sales
    const Sale = (await import("../models/Sale.js")).default;
    const sales = await Sale.find();
    for (const sale of sales) {
      const amount = Number(sale.total || 0);
      const isPaid = sale.paymentStatus === "Paid";
      const debitAcc = isPaid ? cashAcc : arAcc;

      const lines = [
        { account: debitAcc._id, type: "Debit", amount },
        { account: salesRevAcc._id, type: "Credit", amount }
      ];

      const entry = new JournalEntry({
        entryNumber: "JE-SALE-" + sale._id,
        description: `Imported Sale - Invoice ${sale.invoiceNumber || ""}`,
        date: sale.createdAt || new Date(),
        lines,
        referenceId: sale._id,
        referenceType: "Sale"
      });
      await entry.save();
      await updateAccountBalances(lines);
    }

    // 2. Sync Purchases
    const Purchase = (await import("../models/Purchase.js")).default;
    const purchases = await Purchase.find();
    for (const purchase of purchases) {
      const amount = Number(purchase.total || 0);
      const isPaid = purchase.paymentStatus === "Paid";
      const creditAcc = isPaid ? cashAcc : apAcc;

      const lines = [
        { account: inventoryAcc._id, type: "Debit", amount },
        { account: creditAcc._id, type: "Credit", amount }
      ];

      const entry = new JournalEntry({
        entryNumber: "JE-PUR-" + purchase._id,
        description: `Imported Purchase - Invoice ${purchase.invoiceNumber || ""}`,
        date: purchase.createdAt || new Date(),
        lines,
        referenceId: purchase._id,
        referenceType: "Purchase"
      });
      await entry.save();
      await updateAccountBalances(lines);
    }

    // 3. Sync Expenses
    const Expense = (await import("../models/Expense.js")).default;
    const expenses = await Expense.find();
    for (const expense of expenses) {
      const amount = Number(expense.amount || 0);
      const lines = [
        { account: expenseAcc._id, type: "Debit", amount },
        { account: cashAcc._id, type: "Credit", amount }
      ];

      const entry = new JournalEntry({
        entryNumber: "JE-EXP-" + expense._id,
        description: `Imported Expense: ${expense.title}`,
        date: expense.date || expense.createdAt || new Date(),
        lines,
        referenceId: expense._id,
        referenceType: "Expense"
      });
      await entry.save();
      await updateAccountBalances(lines);
    }

    console.log("Historical transactions synced to General Ledger successfully.");
  } catch (error) {
    console.error("Error syncing historical transactions:", error.message);
  }
};

// ==========================================
// HELPER: UPDATE ACCOUNT BALANCES
// ==========================================
export const updateAccountBalances = async (lines) => {
  for (const line of lines) {
    const account = await Account.findById(line.account);
    if (!account) continue;

    const amount = Number(line.amount);
    if (line.type === "Debit") {
      if (["Asset", "Expense"].includes(account.type)) {
        account.balance += amount;
      } else {
        account.balance -= amount;
      }
    } else if (line.type === "Credit") {
      if (["Liability", "Equity", "Revenue"].includes(account.type)) {
        account.balance += amount;
      } else {
        account.balance -= amount;
      }
    }
    await account.save();
  }
};

// ==========================================
// HELPER: POST JOURNAL ENTRY TRIGGER
// ==========================================
export const postJournalEntry = async ({ description, lines, referenceId, referenceType }) => {
  try {
    await seedChartOfAccounts();

    const resolvedLines = [];
    for (const line of lines) {
      const account = await Account.findOne({
        $or: [{ code: line.accountCode }, { name: line.accountName }]
      });
      if (!account) {
        console.error(`Account not found for code: ${line.accountCode} or name: ${line.accountName}`);
        continue;
      }
      resolvedLines.push({
        account: account._id,
        type: line.type,
        amount: Number(line.amount)
      });
    }

    if (resolvedLines.length < 2) {
      console.error("Failed to post journal entry trigger: resolved lines < 2");
      return;
    }

    const entryNumber = "JE-" + Date.now();
    const entry = new JournalEntry({
      entryNumber,
      description,
      lines: resolvedLines,
      referenceId,
      referenceType
    });

    await entry.save();
    await updateAccountBalances(resolvedLines);
  } catch (error) {
    console.error("Failed to post journal entry trigger:", error.message);
  }
};

// ==========================================
// GET CHART OF ACCOUNTS
// ==========================================
export const getAccounts = async (req, res) => {
  try {
    await seedChartOfAccounts(); // Self-healing check
    await syncHistoricalTransactions();
    const accounts = await Account.find().sort({ code: 1 });
    return res.status(200).json(accounts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET JOURNAL ENTRIES
// ==========================================
export const getJournalEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find()
      .populate("lines.account")
      .sort({ createdAt: -1 });

    return res.status(200).json(entries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// CREATE MANUAL JOURNAL ENTRY
// ==========================================
export const createJournalEntry = async (req, res) => {
  try {
    const { description, lines, date } = req.body;

    if (!lines || lines.length < 2) {
      return res.status(400).json({ message: "A journal entry must contain at least 2 lines" });
    }

    // Verify Debits === Credits
    let debitSum = 0;
    let creditSum = 0;

    for (const line of lines) {
      const amount = Number(line.amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount on line item" });
      }
      if (line.type === "Debit") debitSum += amount;
      if (line.type === "Credit") creditSum += amount;
    }

    // Precision rounding verification (diff < 0.01)
    if (Math.abs(debitSum - creditSum) > 0.01) {
      return res.status(400).json({
        message: `Debit and Credit sums must match. (Debits: ₹${debitSum}, Credits: ₹${creditSum})`
      });
    }

    const entryNumber = "JE-" + Date.now();
    const entry = new JournalEntry({
      entryNumber,
      description,
      lines,
      date: date ? new Date(date) : new Date(),
      referenceType: "Manual"
    });

    await entry.save();

    // Adjust balances
    await updateAccountBalances(lines);

    // Log audit activity
    logAudit(
      req,
      "CREATE",
      "Accounting",
      entry._id,
      `Manual journal entry created: ${entryNumber} - ${description}`,
      { description, entryNumber, totalAmount: debitSum }
    );

    return res.status(201).json({
      message: "Journal Entry posted successfully",
      entry
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ==========================================
// GET FINANCIAL REPORTS (P&L, BALANCE SHEET)
// ==========================================
export const getFinancialReports = async (req, res) => {
  try {
    await seedChartOfAccounts();
    await syncHistoricalTransactions();
    const accounts = await Account.find();

    // 1. Trial Balance (simply accounts and balances)
    const trialBalance = accounts.map(acc => ({
      code: acc.code,
      name: acc.name,
      type: acc.type,
      balance: acc.balance
    }));

    // 2. Profit & Loss (Revenue vs Expense)
    const revenues = accounts.filter(acc => acc.type === "Revenue");
    const expenses = accounts.filter(acc => acc.type === "Expense");

    const totalRevenue = revenues.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpense = expenses.reduce((sum, acc) => sum + acc.balance, 0);
    const netIncome = totalRevenue - totalExpense;

    const profitLossReport = {
      revenues: revenues.map(r => ({ name: r.name, balance: r.balance })),
      expenses: expenses.map(e => ({ name: e.name, balance: e.balance })),
      totalRevenue,
      totalExpense,
      netIncome
    };

    // 3. Balance Sheet (Assets, Liabilities, Equity)
    const assets = accounts.filter(acc => acc.type === "Asset");
    const liabilities = accounts.filter(acc => acc.type === "Liability");
    const equityList = accounts.filter(acc => acc.type === "Equity");

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    
    // Dynamic Equity check: Equity includes seeded Retained Earnings PLUS Current Net Income
    const seededEquity = equityList.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = seededEquity + netIncome;

    const balanceSheetReport = {
      assets: assets.map(a => ({ name: a.name, balance: a.balance })),
      liabilities: liabilities.map(l => ({ name: l.name, balance: l.balance })),
      equity: [
        ...equityList.map(e => ({ name: e.name, balance: e.balance })),
        { name: "Current Period Income (P&L)", balance: netIncome }
      ],
      totalAssets,
      totalLiabilities,
      totalEquity,
      netLiabilitiesAndEquity: totalLiabilities + totalEquity
    };

    return res.status(200).json({
      trialBalance,
      profitLoss: profitLossReport,
      balanceSheet: balanceSheetReport
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
