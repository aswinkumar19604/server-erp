import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});
import { detectIntent } from "../utils/intentHandler.js";
import systemPrompt from "../prompts/systemPrompt.js";

// Models
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Employee from "../models/Employee.js";
import Supplier from "../models/Supplier.js";
import Inventory from "../models/Inventory.js";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Notification from "../models/Notification.js";
import StockHistory from "../models/StockHistory.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import GoodsReceipt from "../models/GoodsReceipt.js";
import Account from "../models/Account.js";
import JournalEntry from "../models/JournalEntry.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";
import Project from "../models/Project.js";
import Lead from "../models/Lead.js";
import Expense from "../models/Expense.js";
import BOM from "../models/BOM.js";
import WorkOrder from "../models/WorkOrder.js";
import Quotation from "../models/Quotation.js";
import SalesOrder from "../models/SalesOrder.js";
import AuditLog from "../models/AuditLog.js";

// ----------------------------
// Helper Functions
// ----------------------------

const getDashboardSummary = async () => {
    const [
        totalProducts,
        totalCustomers,
        totalEmployees,
        totalSuppliers,
        totalSales,
        totalPurchases
    ] = await Promise.all([
        Product.countDocuments(),
        Customer.countDocuments(),
        Employee.countDocuments(),
        Supplier.countDocuments(),
        Sale.countDocuments(),
        Purchase.countDocuments()
    ]);

    return {
        totalProducts,
        totalCustomers,
        totalEmployees,
        totalSuppliers,
        totalSales,
        totalPurchases
    };
};

// ----------------------------

const getLowStockProducts = async () => {
    const products = await Product.find();

    return products.filter(product => {
        return Number(product.stock) <= Number(product.minimum_record_qty);
    });
};

// ----------------------------

const getInventorySummary = async () => {
    return await Inventory.find()
        .populate("product")
        .limit(20);
};

// ----------------------------

const getCustomerSummary = async () => {
    const total = await Customer.countDocuments();

    const customers = await Customer.find().limit(20);

    return { total, customers };
};

// ----------------------------

const getEmployeeSummary = async () => {
    const total = await Employee.countDocuments();

    const employees = await Employee.find().limit(20);

    return { total, employees };
};

// ----------------------------

const getSupplierSummary = async () => {
    const total = await Supplier.countDocuments();

    const suppliers = await Supplier.find().limit(20);

    return { total, suppliers };
};

// ----------------------------

const getProductSummary = async () => {
    const total = await Product.countDocuments();
    const products = await Product.find().limit(20);

    return { total, products };
};

// ----------------------------

const getSalesSummary = async () => {
    const totalSales = await Sale.countDocuments();

    const totalRevenueResult = await Sale.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$total" }
            }
        }
    ]);

    const recentSales = await Sale.find()
        .populate("customer")
        .populate("product")
        .sort({ createdAt: -1 })
        .limit(10);

    return {
        totalSales,
        totalRevenue:
            totalRevenueResult.length > 0
                ? totalRevenueResult[0].totalRevenue
                : 0,
        recentSales
    };
};

// ----------------------------

const getPurchaseSummary = async () => {
    const totalPurchases = await Purchase.countDocuments();

    const totalPurchaseAmount = await Purchase.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$total" }
            }
        }
    ]);

    const recentPurchases = await Purchase.find()
        .populate("supplier")
        .populate("product")
        .sort({ createdAt: -1 })
        .limit(10);

    return {
        totalPurchases,
        totalAmount: totalPurchaseAmount.length
            ? totalPurchaseAmount[0].total
            : 0,
        recentPurchases
    };
};

// ----------------------------

const getNotifications = async () => {
    return await Notification.find()
        .sort({ createdAt: -1 })
        .limit(10);
};

// ----------------------------

const getStockHistorySummary = async () => {
    return await StockHistory.find()
        .populate("product")
        .sort({ createdAt: -1 })
        .limit(20);
};

// ----------------------------

const getPurchaseOrdersSummary = async () => {
    const total = await PurchaseOrder.countDocuments();
    const purchaseOrders = await PurchaseOrder.find()
        .populate("supplier")
        .populate("items.product")
        .sort({ createdAt: -1 })
        .limit(10);
    return { total, purchaseOrders };
};

// ----------------------------

const getGoodsReceiptsSummary = async () => {
    const total = await GoodsReceipt.countDocuments();
    const receipts = await GoodsReceipt.find()
        .populate("purchaseOrder")
        .populate("itemsReceived.product")
        .sort({ createdAt: -1 })
        .limit(10);
    return { total, receipts };
};

// ----------------------------

const getLedgerSummary = async () => {
    const accounts = await Account.find().sort({ code: 1 });
    const recentJournals = await JournalEntry.find()
        .populate("lines.account")
        .sort({ createdAt: -1 })
        .limit(10);
    return { accounts: accounts.map(a => ({ name: a.name, type: a.type, balance: a.balance })), recentJournals };
};

const getAttendanceSummary = async () => {
    const total = await Attendance.countDocuments();
    const records = await Attendance.find()
        .populate("employee")
        .sort({ date: -1 })
        .limit(15);
    return { total, records };
};

const getLeaveSummary = async () => {
    const total = await Leave.countDocuments();
    const records = await Leave.find()
        .populate("employee")
        .sort({ startDate: -1 })
        .limit(15);
    return { total, records };
};

const getPayrollSummary = async () => {
    const total = await Payroll.countDocuments();
    const records = await Payroll.find()
        .populate("employee")
        .sort({ month: -1 })
        .limit(15);
    return { total, records };
};

const getProjectSummary = async () => {
    const total = await Project.countDocuments();
    const records = await Project.find()
        .populate("members")
        .sort({ createdAt: -1 })
        .limit(15);
    return { total, records };
};

const getLeadSummary = async () => {
    const total = await Lead.countDocuments();
    const records = await Lead.find()
        .sort({ createdAt: -1 })
        .limit(20);
    return { total, records };
};

const getExpenseSummary = async () => {
    const total = await Expense.countDocuments();
    const records = await Expense.find()
        .sort({ date: -1 })
        .limit(20);
    return { total, records };
};

const getBOMSummary = async () => {
    const total = await BOM.countDocuments();
    const records = await BOM.find()
        .populate("product")
        .populate("components.product")
        .limit(15);
    return { total, records };
};

const getWorkOrderSummary = async () => {
    const total = await WorkOrder.countDocuments();
    const records = await WorkOrder.find()
        .populate("productToProduce")
        .sort({ createdAt: -1 })
        .limit(15);
    return { total, records };
};

const getQuotationSummary = async () => {
    const total = await Quotation.countDocuments();
    const records = await Quotation.find()
        .populate("customer")
        .populate("items.product")
        .sort({ createdAt: -1 })
        .limit(15);
    return { total, records };
};

const getSalesOrderSummary = async () => {
    const total = await SalesOrder.countDocuments();
    const records = await SalesOrder.find()
        .populate("customer")
        .populate("items.product")
        .sort({ createdAt: -1 })
        .limit(15);
    return { total, records };
};

const getAuditLogSummary = async () => {
    const total = await AuditLog.countDocuments();
    const records = await AuditLog.find()
        .populate("operator")
        .sort({ createdAt: -1 })
        .limit(20);
    return { total, records };
};

// ----------------------------

const buildDatabaseContext = async (intent) => {
    switch (intent) {
        case "PRODUCT":
            return await getProductSummary();

        case "CUSTOMER":
            return await getCustomerSummary();

        case "EMPLOYEE":
            return await getEmployeeSummary();

        case "SUPPLIER":
            return await getSupplierSummary();

        case "INVENTORY":
            return await getInventorySummary();

        case "SALE":
            return await getSalesSummary();

        case "PURCHASE":
            return await getPurchaseSummary();

        case "PURCHASE_ORDER":
            return await getPurchaseOrdersSummary();

        case "GOODS_RECEIPT":
            return await getGoodsReceiptsSummary();

        case "LEDGER":
            return await getLedgerSummary();

        case "ATTENDANCE":
            return await getAttendanceSummary();

        case "LEAVE":
            return await getLeaveSummary();

        case "PAYROLL":
            return await getPayrollSummary();

        case "PROJECT":
            return await getProjectSummary();

        case "LEAD":
            return await getLeadSummary();

        case "EXPENSE":
            return await getExpenseSummary();

        case "BOM":
            return await getBOMSummary();

        case "WORK_ORDER":
            return await getWorkOrderSummary();

        case "QUOTATION":
            return await getQuotationSummary();

        case "SALES_ORDER":
            return await getSalesOrderSummary();

        case "AUDIT_LOG":
            return await getAuditLogSummary();

        case "DASHBOARD":
            return await getDashboardSummary();

        case "NOTIFICATION":
            return await getNotifications();

        case "HISTORY":
            return await getStockHistorySummary();

        case "GREETING":
        case "GENERAL":
            return {};

        default:
            return await getDashboardSummary();
    }
};

// ----------------------------
// AI Service
// ----------------------------

export const askAI = async (message) => {
    try {

        const intent = detectIntent(message);

        const databaseData = await buildDatabaseContext(intent);

        const context = Object.keys(databaseData).length
            ? `ERP Database:\n${JSON.stringify(databaseData, null, 2)}\n\n`
            : "";

        const prompt = `
${systemPrompt}

Detected Intent:
${intent}

${context}User Question:
${message}

Answer as an ERP Assistant. Use database information only when it is relevant to the question and do not fabricate details.
`;

        const result = await model.generateContent(prompt);

        const response = await result.response.text();

        return response;

    } catch (error) {

        console.error("Gemini Error:", error);

        throw new Error("Failed to process AI request.");

    }
};