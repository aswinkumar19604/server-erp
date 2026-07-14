import ExcelJS from "exceljs";
import Sale from "../models/Sale.js";

export const exportSalesReport = async (req, res) => {

  try {

    // =========================
    // GET SALES (POPULATED)
    // =========================
    const sales = await Sale.find()
      .populate({
        path: "customer",
        select: "name"
      })
      .populate({
        path: "product",
        select: "name"
      })
      .sort({ createdAt: -1 });

    // =========================
    // CREATE WORKBOOK
    // =========================
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    // =========================
    // COLUMN SETUP (IMPORTANT)
    // =========================
    worksheet.columns = [

      { header: "Invoice", key: "invoice", width: 25 },

      { header: "Customer", key: "customer", width: 25 },

      { header: "Product", key: "product", width: 25 },

      { header: "Quantity", key: "quantity", width: 15 },

      { header: "Price", key: "price", width: 15 },

      { header: "Total", key: "total", width: 15 },

      { header: "Payment Status", key: "paymentStatus", width: 18 },

      { header: "Date", key: "date", width: 20 }
    ];

    // =========================
    // ADD DATA ROWS
    // =========================
    sales.forEach((sale) => {

      worksheet.addRow({

        invoice: sale.invoiceNumber || "",

        customer: sale.customer?.name || "Deleted Customer",

        product: sale.product?.name || "Deleted Product",

        quantity: sale.quantity || 0,

        price: sale.price || 0,

        total: sale.total || 0,

        paymentStatus: sale.paymentStatus || "",

        date: sale.createdAt
          ? sale.createdAt.toISOString().split("T")[0]
          : ""
      });

    });

    // =========================
    // HEADER STYLE
    // =========================
    worksheet.getRow(1).font = {
      bold: true
    };

    // =========================
    // RESPONSE HEADERS
    // =========================
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.xlsx"
    );

    // =========================
    // SEND FILE
    // =========================
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {

    console.log("Excel Export Error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};