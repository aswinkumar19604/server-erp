import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

// Helper to construct SMTP transporter
const getTransporter = async () => {
  // If user has Gmail app password configuration set in .env
  if (process.env.MAIL_USER && process.env.MAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to auto-created Ethereal testing account
  const testAccount = await nodemailer.createTestAccount();
  console.log("----------------------------------------------------------------");
  console.log("✉️ Nodemailer generated Ethereal Test SMTP mail account:");
  console.log(`User: ${testAccount.user}`);
  console.log("----------------------------------------------------------------");
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Dispatches a transaction invoice receipt to the customer
 */
const generateInvoicePDF = (sale, customer, product) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", err => reject(err));

      // Draw header banner
      doc.rect(0, 0, doc.page.width, 110).fill("#0f172a");

      // Header text (White)
      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(22)
         .text("ERP INVOICING HUB", 50, 40);

      doc.fillColor("#94a3b8")
         .font("Helvetica")
         .fontSize(10)
         .text("Automated Sales Receipt Confirmation", 50, 68);

      // Invoice info block (Top Right on banner)
      doc.fillColor("#ffffff")
         .font("Helvetica-Bold")
         .fontSize(11)
         .text(`INVOICE: ${sale.invoiceNumber}`, 350, 42, { align: "right", width: 200 });

      doc.fillColor("#94a3b8")
         .font("Helvetica")
         .fontSize(9)
         .text(`Date: ${new Date(sale.createdAt || Date.now()).toLocaleDateString()}`, 350, 60, { align: "right", width: 200 });
         
      doc.text(`Status: ${sale.paymentStatus.toUpperCase()}`, 350, 75, { align: "right", width: 200 });

      // Move down below banner
      doc.y = 140;

      // Customer Info
      doc.fillColor("#475569")
         .font("Helvetica-Bold")
         .fontSize(10)
         .text("BILLED TO", 50, doc.y);

      doc.fillColor("#0f172a")
         .font("Helvetica-Bold")
         .fontSize(13)
         .text(customer.name || "Valued Customer", 50, doc.y + 16);

      doc.font("Helvetica")
         .fontSize(10)
         .fillColor("#334155")
         .text(`Email: ${customer.email || "-"}`, 50, doc.y + 34)
         .text(`Phone: ${customer.phone || "-"}`, 50, doc.y + 48);

      // Line Separator
      doc.moveTo(50, doc.y + 70).lineTo(doc.page.width - 50, doc.y + 70).strokeColor("#e2e8f0").lineWidth(1).stroke();

      // Table details
      const tableTop = doc.y + 90;
      doc.fillColor("#475569").font("Helvetica-Bold").fontSize(10);
      doc.text("ITEM DESCRIPTION", 50, tableTop);
      doc.text("QTY", 280, tableTop, { width: 50, align: "center" });
      doc.text("PRICE", 360, tableTop, { width: 80, align: "right" });
      doc.text("TOTAL", 460, tableTop, { width: 80, align: "right" });

      // Header underline
      doc.moveTo(50, tableTop + 16).lineTo(doc.page.width - 50, tableTop + 16).strokeColor("#cbd5e1").lineWidth(1.5).stroke();

      // Row values
      const rowY = tableTop + 28;
      doc.fillColor("#0f172a").font("Helvetica");
      doc.text(product.name || "Product Unit", 50, rowY, { width: 220 });
      doc.text(`${sale.quantity} units`, 280, rowY, { width: 50, align: "center" });
      doc.text(`Rs. ${sale.price.toLocaleString()}`, 360, rowY, { width: 80, align: "right" });
      doc.text(`Rs. ${sale.total.toLocaleString()}`, 460, rowY, { width: 80, align: "right", font: "Helvetica-Bold" });

      // Divider before total
      doc.moveTo(50, rowY + 28).lineTo(doc.page.width - 50, rowY + 28).strokeColor("#e2e8f0").lineWidth(1).stroke();

      // Total amount row
      const totalY = rowY + 40;
      doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(12);
      doc.text("GRAND TOTAL:", 320, totalY, { width: 120, align: "right" });
      doc.text(`Rs. ${sale.total.toLocaleString()}`, 460, totalY, { width: 80, align: "right" });

      // Terms/Footer
      doc.fillColor("#94a3b8")
         .font("Helvetica")
         .fontSize(9)
         .text("If you have any questions regarding this invoice receipt, please contact operations billing support.", 50, 480, { align: "center", width: doc.page.width - 100 });
         
      doc.text("Thank you for doing business with us!", 50, 500, { align: "center", width: doc.page.width - 100 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const sendInvoiceEmail = async ({ sale, customer, product }) => {
  try {
    const transporter = await getTransporter();
    const pdfBuffer = await generateInvoicePDF(sale, customer, product);

    const senderEmail = transporter.options.auth.user;
    const customerEmail = customer.email || "recipient@example.com";
    const paymentClass = sale.paymentStatus === "Paid" ? "status-paid" : "status-pending";

    const mailOptions = {
      from: `"ERP Transaction Billing" <${senderEmail}>`,
      to: customerEmail,
      subject: `Invoice Transaction Confirmation: ${sale.invoiceNumber}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice Transaction Confirmation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 20px;
          }
          .email-card {
            max-width: 600px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            margin: 0 auto;
          }
          .brand-header {
            text-align: center;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .brand-header h2 {
            font-size: 22px;
            color: #0f172a;
            margin: 0;
          }
          .brand-header p {
            color: #64748b;
            font-size: 13px;
            margin: 4px 0 0 0;
          }
          .invoice-meta-table {
            width: 100%;
            margin-bottom: 24px;
            border-spacing: 0;
          }
          .meta-cell {
            background-color: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 10px;
            padding: 14px;
            width: 50%;
            vertical-align: top;
          }
          .meta-label {
            font-size: 11px;
            color: #475569;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
            display: block;
          }
          .meta-val {
            font-size: 14px;
            color: #0f172a;
            font-weight: 500;
          }
          .ledger-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 24px;
          }
          .ledger-table th {
            background-color: #f8fafc;
            color: #475569;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-align: left;
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
          }
          .ledger-table td {
            padding: 14px 16px;
            font-size: 14px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .status-paid {
            background-color: #dcfce7;
            color: #15803d;
          }
          .status-pending {
            background-color: #fef3c7;
            color: #b45309;
          }
          .summary-row {
            background-color: #f8fafc;
            font-weight: bold;
          }
          .summary-row td {
            color: #0f172a;
            font-size: 15px;
          }
          .footer-section {
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 32px;
            border-top: 1px solid #f1f5f9;
            padding-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="email-card">
          <div class="brand-header">
            <h2>ERP Invoicing Hub</h2>
            <p>Automated Transaction Confirmation Receipt</p>
          </div>

          <table class="invoice-meta-table">
            <tr>
              <td class="meta-cell" style="padding-right: 8px;">
                <span class="meta-label">Billed To</span>
                <span class="meta-val">
                  <strong>${customer.name || "Customer"}</strong><br/>
                  ${customer.email || "-"}<br/>
                  ${customer.phone || "-"}
                </span>
              </td>
              <td class="meta-cell" style="padding-left: 8px;">
                <span class="meta-label">Invoice Details</span>
                <span class="meta-val">
                  Invoice No: <strong>${sale.invoiceNumber}</strong><br/>
                  Date: ${new Date(sale.createdAt || Date.now()).toLocaleDateString()}<br/>
                  Payment Status: <span class="status-badge ${paymentClass}">${sale.paymentStatus}</span>
                </span>
              </td>
            </tr>
          </table>

          <table class="ledger-table">
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${product.name || "Product"}</strong></td>
                <td>${sale.quantity} units</td>
                <td style="text-align: right;">₹${sale.price.toLocaleString()}</td>
                <td style="text-align: right; font-weight: 600;">₹${sale.total.toLocaleString()}</td>
              </tr>
              <tr class="summary-row">
                <td colspan="3" style="text-align: right; border-top: 1px solid #e2e8f0;">Grand Total:</td>
                <td style="text-align: right; border-top: 1px solid #e2e8f0;">₹${sale.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer-section">
            <p>Thank you for doing business with us!</p>
            <p style="font-size: 10px; color: #cbd5e1; margin-top: 8px;">This is a system generated email notification from your ERP. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
      `,
      attachments: [
        {
          filename: `invoice-${sale.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Automated transaction invoice email sent to ${customerEmail}. Message ID: ${info.messageId}`);
    
    // Log preview link for testing (only available when using Ethereal)
    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      console.log("----------------------------------------------------------------");
      console.log(`🔗 Preview Sent Email In Browser: ${testUrl}`);
      console.log("----------------------------------------------------------------");
    }
  } catch (error) {
    console.log("❌ Transaction email dispatch failed:", error);
  }
};
