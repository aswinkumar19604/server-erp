import PDFDocument from "pdfkit";

import Sale
from "../models/Sale.js";

export const generateInvoice =
async (req, res) => {

  try {

    const sale =
      await Sale.findById(
        req.params.id
      ).populate("product").populate("customer");

    if (!sale) {

      return res.status(404).json({
        message:
          "Sale not found"
      });
    }

    const doc =
      new PDFDocument({
        margin: 50,
        size: "A4"
      });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "inline; filename=invoice.pdf"
    );

    doc.pipe(res);

    // ======================
    // COMPANY NAME
    // ======================

    doc
      .fontSize(24)
      .text(
        "ERP SYSTEM",
        {
          align: "center"
        }
      );

    doc
      .fontSize(11)
      .text(
        "Chennai, Tamil Nadu",
        {
          align: "center"
        }
      );

    doc.moveDown(2);

    // ======================
    // LINE
    // ======================

    doc
      .moveTo(50, 110)
      .lineTo(550, 110)
      .stroke();

    // ======================
    // INVOICE TITLE
    // ======================

    doc.moveDown();

    doc
      .fontSize(18)
      .text(
        "SALES INVOICE",
        {
          align: "center"
        }
      );

    doc.moveDown(2);

    // ======================
    // CUSTOMER DETAILS
    // ======================

    const leftX = 60;
    const rightX = 300;

    doc.fontSize(12);

    doc.text(
      "Invoice No",
      leftX,
      170
    );

    doc.text(
      `: ${sale.invoiceNumber}`,
      160,
      170
    );

    doc.text(
      "Customer Name",
      leftX,
      195
    );

    doc.text(
      `: ${sale.customer?.name || "N/A"}`,
      160,
      195
    );

    doc.text(
      "Payment Status",
      leftX,
      220
    );

    doc.text(
      `: ${sale.paymentStatus}`,
      160,
      220
    );

    doc.text(
      "Invoice Date",
      rightX,
      170
    );

    doc.text(
      `: ${
        new Date(
          sale.createdAt
        ).toLocaleDateString()
      }`,
      400,
      170
    );

    // ======================
    // TABLE
    // ======================

    const tableTop = 300;

    // HEADER LINE

    doc
      .moveTo(50, tableTop)
      .lineTo(550, tableTop)
      .stroke();

    doc
      .fontSize(12)
      .text(
        "Product",
        60,
        tableTop + 10
      );

    doc.text(
      "Quantity",
      260,
      tableTop + 10
    );

    doc.text(
      "Price",
      360,
      tableTop + 10
    );

    doc.text(
      "Total",
      470,
      tableTop + 10
    );

    // HEADER BOTTOM LINE

    doc
      .moveTo(
        50,
        tableTop + 30
      )
      .lineTo(
        550,
        tableTop + 30
      )
      .stroke();

    // ROW DATA

    const rowY =
      tableTop + 45;

    doc.text(
      sale.product?.name || "N/A",
      60,
      rowY
    );

    doc.text(
      `${sale.quantity}`,
      280,
      rowY
    );

    doc.text(
      `₹ ${sale.price}`,
      360,
      rowY
    );

    doc.text(
      `₹ ${sale.total}`,
      470,
      rowY
    );

    // BOTTOM LINE

    doc
      .moveTo(
        50,
        rowY + 25
      )
      .lineTo(
        550,
        rowY + 25
      )
      .stroke();

    // ======================
    // GRAND TOTAL
    // ======================

    doc.moveDown(8);

    doc
      .fontSize(14)
      .text(
        `Grand Total : ₹ ${sale.total}`,
        350,
        rowY + 80
      );

    // ======================
    // FOOTER
    // ======================

    doc.moveDown(6);

    doc
      .fontSize(11)
      .text(
        "Thank you for your business.",
        {
          align: "center"
        }
      );

    doc.end();

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });
  }
};