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