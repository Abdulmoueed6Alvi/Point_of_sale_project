# POS Sanitary Store (MERN) — PPT Script + Speaker Notes (Dec 28, 2025)

Use this as a **copy/paste** source for PowerPoint.

---

## Slide 1 — Title
**On slide (copy/paste):**
- POS & Inventory Management System (MERN)
- For Sanitary / Tiles / Cement / Jali store
- Full Stack Lab — 5th Semester
- Date: Dec 28, 2025

**Speaker notes:**
- This project is a full-stack POS + inventory system for a sanitary items store.
- It covers billing, invoice generation, stock control, analytics, and role-based access.

**Screenshot (optional):** Login page or Dashboard (clean look).

---

## Slide 2 — Problem Statement
**On slide:**
- Manual billing + manual stock updates cause mistakes
- No centralized sales history and invoice records
- Hard to track low stock, revenue trends, and employee actions
- Need a role-based solution for real store workflow

**Speaker notes:**
- Main issues are time loss at billing, incorrect stock, and lack of reporting.
- Also need separation of duties: admin vs manager vs cashier.

---

## Slide 3 — Objectives
**On slide:**
- Fast POS billing with automatic invoice numbers
- Real-time inventory updates after each sale
- Product + category catalog management
- Sales history & invoice records with search and date filters
- Dashboard + reports for decision making
- Secure login and audit logging

**Speaker notes:**
- We focused on practical store operations: sell quickly, track stock correctly, and report business performance.

---

## Slide 4 — Tech Stack
**On slide:**
- Frontend: React (Vite), React Router, Axios, Recharts, Lucide, date-fns
- Backend: Node.js, Express.js, JWT, bcryptjs, express-validator
- Database: MongoDB + Mongoose
- Email: Nodemailer (welcome email for employees)

**Speaker notes:**
- MERN stack is used end-to-end.
- JWT secures API access; Mongoose models structure our collections.

---

## Slide 5 — System Architecture
**On slide:**
- React UI → Axios Service Layer → Express REST API → MongoDB
- JWT authentication + role authorization
- Logs: ActivityLog + InventoryLog for audit trail

**Speaker notes:**
- Frontend calls REST APIs.
- Backend uses middleware to verify JWT and enforce role permissions.
- Every critical action can be traced through logs.

---

## Slide 6 — User Roles (RBAC)
**On slide:**
- Admin: full access (users, products, categories, inventory, reports, logs)
- Manager: manage products/categories, inventory adjustments, reports, logs
- Cashier: POS billing, sales history (limited), invoices view

**Speaker notes:**
- Admin controls staff and master data.
- Manager handles daily management tasks.
- Cashier focuses on selling only.

**Screenshot:** Sidebar menu showing role-specific options (optional).

---

## Slide 7 — Backend Structure (Modules)
**On slide:**
- Server entry: `backend/server.js`
- Models: User, Product, Sale, Category, InventoryLog, ActivityLog
- API Routes:
  - /api/auth, /api/users
  - /api/products, /api/categories
  - /api/sales, /api/invoices
  - /api/inventory, /api/logs
  - /api/dashboard

**Speaker notes:**
- We organized the backend into models (DB), routes (endpoints), and middleware (auth/logging).

---

## Slide 8 — Frontend Structure (Pages)
**On slide:**
- Auth: Login + AuthContext
- Dashboards: Admin Dashboard, ManagerDashboard
- POS: CashierPOS / NewSale flow
- Management: Products, Categories, Inventory
- Records: Sales History, Invoices (+ Print)
- Admin: Employees
- Reports: Charts & summaries

**Speaker notes:**
- Routing is protected using private routes and role-based routes.

---

## Slide 9 — Database Design (Key Collections)
**On slide:**
- Users: name, email, role, active/inactive, last login
- Products: SKU, category, unit, prices, stock, min/max thresholds
- Sales (also invoices): invoiceNumber, items, totals, payment status, customer, soldBy
- InventoryLogs: movement type, quantity change, stock before/after
- ActivityLogs: who did what, when, module/action, status

**Speaker notes:**
- Sales and invoices are represented by the same Sale model; invoice listing is a filtered view of sales records.

---

## Slide 10 — Authentication Flow
**On slide:**
- Login → JWT issued → stored in browser
- Axios attaches JWT to every API call
- 401 response auto-logs out user
- Inactive accounts cannot login

**Speaker notes:**
- This gives secure access control and protects all API endpoints.

---

## Slide 11 — Product & Category Management
**On slide:**
- Product CRUD (admin/manager)
- SKU-based identification
- Stock thresholds: low stock + out of stock alerts
- Categories are dynamic (admin/manager create/update; admin can delete permanently)

**Speaker notes:**
- Stock is not directly edited from product update API; stock changes happen through inventory adjustments or sales.

**Screenshot:** Products page + Categories page.

---

## Slide 12 — POS / Sales Workflow
**On slide:**
- Add products to cart → quantity/discount → payment method → complete sale
- Auto invoice number: `INV-YYMM-00001` format
- Inventory auto-reduced + inventory logs created
- Admin/manager can cancel sale (inventory restored)

**Speaker notes:**
- This is the core business process: sell items and ensure stock is accurate automatically.

**Screenshot:** POS page while creating a sale.

---

## Slide 13 — Sales History & Invoices
**On slide:**
- Sales History
  - View sale details (modal)
  - Search + date filtering
- Invoices
  - View invoice details
  - Search + date filtering
  - Print invoice in formatted layout

**Speaker notes:**
- These pages provide records for auditing and customer support.
- Printing creates a clean invoice for customers.

**Screenshot:** Sales History + Invoice Print preview.

---

## Slide 14 — Inventory Tracking
**On slide:**
- Inventory summary (value, low stock, out of stock)
- Inventory logs: purchase/sale/adjustment/return/damage/initial
- Manual adjustments (admin/manager)

**Speaker notes:**
- Logs show before/after stock and the user who performed the change.

**Screenshot:** Inventory logs table.

---

## Slide 15 — Dashboard & Reports
**On slide:**
- Dashboard KPIs: today/month revenue, top products, 7-day trend, recent activity
- Reports: category revenue distribution + date range analytics

**Speaker notes:**
- This provides the “business view”: performance and trends.

**Screenshot:** Dashboard charts + Reports chart.

---

## Slide 16 — Employees + Email
**On slide:**
- Admin can add/update employees
- Options: deactivate (soft) or permanently delete
- Welcome email sends credentials (Nodemailer)

**Speaker notes:**
- Email integration improves onboarding in real shops.

**Screenshot:** Employees page.

---

## Slide 17 — Security & Audit Trail
**On slide:**
- Password hashing (bcrypt)
- JWT auth + role authorization
- Server-side validation (express-validator)
- Activity logging (who did what) + inventory logging (stock movements)

**Speaker notes:**
- This ensures accountability and reduces fraud/mistakes.

---

## Slide 18 — Conclusion & Future Scope
**On slide:**
- Delivered complete POS + inventory + analytics system
- Role-based UI for Admin/Manager/Cashier
- Accurate stock control with logs
- Future scope:
  - Server-side date filtering for invoices endpoint
  - Barcode scanning
  - Export reports (PDF/Excel)
  - Multi-branch support

**Speaker notes:**
- Project is working end-to-end and is ready for store operations.

---

# Screenshots Checklist (Fast)
Take these screenshots for a strong PPT demo:
1. Login page
2. Admin Dashboard (KPIs + charts)
3. Products page (list)
4. Categories page
5. POS page (cart filled)
6. Sales History page (show search/date filters)
7. Sale details modal (opened)
8. Invoices page (show search/date filters)
9. Invoice details modal + print preview
10. Inventory logs page
11. Reports page (charts)
12. Employees page (admin)

# Demo Script (2–3 minutes)
- Login as Admin → show dashboard
- Show Products/Categories
- Go to POS (cashier) → make 1 sale
- Show Sales History → search/filter + details modal
- Show Invoices → print invoice
- Show Inventory logs → proves stock updates
- End with Reports
