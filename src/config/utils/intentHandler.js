export const detectIntent = (message) => {
    const text = message.toLowerCase();

    // Product
    if (
        text.includes("product") ||
        text.includes("products")
    ) {
        return "PRODUCT";
    }

    // Inventory
    if (
        text.includes("inventory") ||
        text.includes("stock") ||
        text.includes("low stock")
    ) {
        return "INVENTORY";
    }

    // Customer
    if (
        text.includes("customer") ||
        text.includes("customers")
    ) {
        return "CUSTOMER";
    }

    // Supplier
    if (
        text.includes("supplier") ||
        text.includes("suppliers")
    ) {
        return "SUPPLIER";
    }

    // Employee
    if (
        text.includes("employee") ||
        text.includes("employees")
    ) {
        return "EMPLOYEE";
    }

    // Sales
    if (
        text.includes("sale") ||
        text.includes("sales")
    ) {
        return "SALE";
    }

    // Notification
    if (
        text.includes("notification") ||
        text.includes("notifications") ||
        text.includes("alert") ||
        text.includes("alerts")
    ) {
        return "NOTIFICATION";
    }

    // Stock History
    if (
        text.includes("history") ||
        text.includes("log") ||
        text.includes("logs") ||
        text.includes("activity") ||
        text.includes("activities") ||
        text.includes("transaction") ||
        text.includes("transactions")
    ) {
        return "HISTORY";
    }

    // Accounting Ledger
    if (
        text.includes("ledger") ||
        text.includes("general ledger") ||
        text.includes("balance sheet") ||
        text.includes("p&l") ||
        text.includes("profit and loss") ||
        text.includes("trial balance") ||
        text.includes("accounts")
    ) {
        return "LEDGER";
    }

    // Purchase Order
    if (
        text.includes("purchase order") ||
        text.includes("purchaseorders") ||
        text.includes("po")
    ) {
        return "PURCHASE_ORDER";
    }

    // Goods Receipt
    if (
        text.includes("goods receipt") ||
        text.includes("goodsreceipt") ||
        text.includes("grn")
    ) {
        return "GOODS_RECEIPT";
    }

    // Purchase
    if (
        text.includes("purchase") ||
        text.includes("purchases")
    ) {
        return "PURCHASE";
    }

    // Dashboard
    if (
        text.includes("dashboard") ||
        text.includes("summary")
    ) {
        return "DASHBOARD";
    }

    // Attendance
    if (
        text.includes("attendance") ||
        text.includes("present") ||
        text.includes("absent")
    ) {
        return "ATTENDANCE";
    }

    // Leave
    if (
        text.includes("leave") ||
        text.includes("leaves") ||
        text.includes("vacation")
    ) {
        return "LEAVE";
    }

    // Payroll
    if (
        text.includes("payroll") ||
        text.includes("salary") ||
        text.includes("salaries") ||
        text.includes("payslip") ||
        text.includes("net salary")
    ) {
        return "PAYROLL";
    }

    // Projects
    if (
        text.includes("project") ||
        text.includes("projects") ||
        text.includes("task") ||
        text.includes("tasks")
    ) {
        return "PROJECT";
    }

    // CRM Leads
    if (
        text.includes("lead") ||
        text.includes("leads") ||
        text.includes("crm")
    ) {
        return "LEAD";
    }

    // Expenses
    if (
        text.includes("expense") ||
        text.includes("expenses") ||
        text.includes("receipt")
    ) {
        return "EXPENSE";
    }

    // BOM (Bill of Materials)
    if (
        text.includes("bom") ||
        text.includes("bill of material") ||
        text.includes("bill of materials")
    ) {
        return "BOM";
    }

    // Work Orders
    if (
        text.includes("work order") ||
        text.includes("work orders") ||
        text.includes("workorder") ||
        text.includes("manufacturing") ||
        text.includes("produce")
    ) {
        return "WORK_ORDER";
    }

    // Quotations
    if (
        text.includes("quotation") ||
        text.includes("quotations") ||
        text.includes("quote") ||
        text.includes("quotes")
    ) {
        return "QUOTATION";
    }

    // Sales Orders
    if (
        text.includes("sales order") ||
        text.includes("sales orders") ||
        text.includes("so-")
    ) {
        return "SALES_ORDER";
    }

    // Audit Logs
    if (
        text.includes("audit") ||
        text.includes("audits") ||
        text.includes("audit log") ||
        text.includes("audit logs") ||
        text.includes("activity log") ||
        text.includes("action log")
    ) {
        return "AUDIT_LOG";
    }

    // Greeting
    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {
        return "GREETING";
    }

    return "GENERAL";
};

export default  detectIntent;