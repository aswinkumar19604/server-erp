# ERP Backend - Project Brief

This document serves as the persistent project brief and knowledge item for the Antigravity AI agent. It details the system architecture, folder structure, module definitions, and identified conventions or issues.

---

## 🛠️ Tech Stack

*   **Runtime/Framework:** Node.js with Express.js (ES Modules, `"type": "module"`)
*   **Database:** MongoDB via Mongoose ORM
*   **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing
*   **Mail Service:** Nodemailer using Gmail SMTP
*   **AI Integration:** `@google/generative-ai` (using `gemini-2.5-flash`) and `openai`
*   **File Exports:** `pdfkit` (invoice PDF generation), `exceljs` (Excel spreadsheet generation)
*   **Asset Helpers:** `bwip-js` (barcodes), `qrcode` (QR codes)

---

## 📁 Folder Structure

All core backend directories are currently located inside `src/config/`:

```
server/
├── src/
│   └── config/
│       ├── controllers/       # Business logic controllers
│       ├── middleware/        # Express request middleware (auth, etc.)
│       ├── models/            # Mongoose schemas/models
│       ├── prompts/           # Prompts for AI service
│       ├── routes/            # Express route declarations
│       ├── services/          # External API integrations (AI, etc.)
│       ├── utils/             # Utility classes (intent handlers, helpers)
│       ├── app.js             # Express app setup and middleware configuration
│       ├── db.js              # Mongoose DB connection setup
│       ├── mail.js            # Nodemailer transport configuration
│       └── server.js          # App entrypoint listener
├── .env                       # Environment variables (port, db connection, secret keys)
├── Dockerfile                 # Container settings
├── package.json               # Dependencies and scripts
└── GEMINI.md                  # Persistent agent context (this file)
```

---

## 📦 ERP Modules Map

Here is the correspondence between modules and files:

### 1. Employee
*   **Files:**
    *   Model: [Employee.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/models/Employee.js)
    *   Controller: [employeeController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/employeeController.js)
    *   Route: [employeeRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/employeeRoutes.js)
*   **Description:** Manages employee records (ID, name, email, department, designation, salary, status). Performs duplicate validation checks for IDs, emails, and phone numbers.

### 2. Product
*   **Files:**
    *   Model: [Product.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/models/Product.js)
    *   Controller: [productController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/productController.js)
    *   Route: [productRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/productRoutes.js)
*   **Description:** Manages items in stock (SKU, name, category, brand, price, stock quantity, status). Synchronizes stock alterations automatically with the Inventory module.

### 3. Inventory
*   **Files:**
    *   Model: [Inventory.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/models/Inventory.js)
    *   Controller: [inventoryController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/inventoryController.js)
    *   Route: [inventoryRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/inventoryRoutes.js)
*   **Description:** Registers stock entry (`stockIn`) and exit (`stockOut`), computes available stock, checks alerts against `minimum_record_qty`, and triggers low stock notifications.

### 4. Sales
*   **Files:**
    *   Model: [Sale.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/models/Sale.js)
    *   Controller: [saleController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/saleController.js)
    *   Route: [saleRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/saleRoutes.js)
*   **Description:** Records consumer sales. Generates unique invoice numbers prefix `INV-`, updates product/inventory levels, creates stock history logs, and publishes sales notifications.

### 5. Purchase
*   **Files:**
    *   Model: [Purchase.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/models/Purchase.js)
    *   Controller: [purchaseController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/purchaseController.js)
    *   Route: [purchaseRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/purchaseRoutes.js)
*   **Description:** Tracks purchases from suppliers. Generates unique invoice numbers prefix `PUR-`, scales up stock levels, updates inventory metrics, and fires low-stock triggers if necessary.

### 6. Supplier
*   **Files:**
    *   Model: [Supplier.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/models/Supplier.js)
    *   Controller: [supplierController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/supplierController.js)
    *   Route: [supplierRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/supplierRoutes.js)
*   **Description:** Stores vendor contact specifications (email, phone, address, GSTIN). Checks duplicates upon email or phone.

### 7. Customer
*   **Files:**
    *   Model: [Customer.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/models/Customer.js)
    *   Controller: [customerController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/customerController.js)
    *   Route: [customerRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/customerRoutes.js)
*   **Description:** Stores buyer records (name, email, phone, address, GSTIN) and enforces duplicate validation.

### 8. Dashboard
*   **Files:**
    *   Controller: [dashboardController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/dashboardController.js)
    *   Route: [dashboardRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/dashboardRoutes.js)
*   **Description:** Aggregates dashboard cards (total counts, profit calculations, stock values, monthly chart data for sales and purchases, and list of low-stock alerts).

### 9. AI Assistant (ERP Copilot)
*   **Files:**
    *   Service: [aiService.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/services/aiService.js)
    *   Controller: [aiController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/aiController.js)
    *   Route: [aiRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/aiRoutes.js)
    *   Intent Handler: [intentHandler.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/utils/intentHandler.js)
    *   System Prompt: [systemPrompt.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/prompts/systemPrompt.js)
*   **Description:** Evaluates user text messages, matches entity intents via a simple classifier, fetches corresponding records, and asks Gemini to output conversational data.

### 10. History (StockHistory) & Invoices/Reports
*   **Files:**
    *   Model: [StockHistory.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/models/StockHistory.js)
    *   Route: [stockHistoryRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/stockHistoryRoutes.js)
    *   Route: [invoiceRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/invoiceRoutes.js)
    *   Controller: [invoiceController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/invoiceController.js)
    *   Route: [reportRoutes.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/routes/reportRoutes.js)
    *   Controller: [reportController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/reportController.js)
*   **Description:** Logs stock change events (`SALE`, `PURCHASE`, `SALE_DELETE`, `PURCHASE_DELETE`), exports Excel lists of transactions, and renders PDF sales invoices.

---

## 🔍 Key Bugs and Potential Issues Identified

> [!WARNING]
> The following issues exist in the codebase and should be resolved to avoid runtime failures or missing data.

1.  **[RESOLVED] AI Intent Handler Mismatch (AI Service Mismatch):**
    *   **Location:** [intentHandler.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/utils/intentHandler.js) vs [aiService.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/services/aiService.js)
    *   **Resolution:** Modified `intentHandler.js` to return `"SALE"` instead of `"SALES"`, aligning it with `aiService.js`. Extended intents to support notifications and stock history, and set default fallback context to dashboard statistics.

2.  **Invoice PDF Customer Reference Failure:**
    *   **Location:** [invoiceController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/invoiceController.js#L11-L15) and [invoiceController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/invoiceController.js#L121)
    *   **Problem:** The database query inside `generateInvoice` does not populate the `customer` field. Additionally, it references `sale.customerName` which is not a field in the `Sale` schema (it uses a `customer` reference field instead).
    *   **Impact:** The client's name displays as `: undefined` on the generated invoice PDF.

3.  **Circular & Broken Supplier Schema:**
    *   **Location:** [Supplier.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/models/Supplier.js#L6-L9) and [supplierController.js](file:///c:/Users/Aswin%20Kumar/OneDrive/Desktop/server/src/config/controllers/supplierController.js#L36-L44)
    *   **Problem:** The `Supplier` model schema is missing a `name` field, and instead contains `supplier: { type: ObjectId, ref: 'Supplier' }` (circular reference). However, the controller tries to register suppliers passing a `name` field.
    *   **Impact:** Supplier names will not be stored in the database.

4.  **Non-Standard Base Directories:**
    *   **Problem:** All controllers, models, routes, prompts, and utilities are located under `src/config/`.
    *   **Recommendation:** Move controllers, models, and routes to `src/` to follow Node.js clean architecture patterns, keeping `config` dedicated only to databases, mailers, and ports.

5.  **API Key Naming Inconsistency:**
    *   **Problem:** The Google Generative AI client is initialized with `process.env.OPENAI_API_KEY`.
    *   **Recommendation:** Rename the environment variable in `.env` and config files to `GEMINI_API_KEY` for clarity.
