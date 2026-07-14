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