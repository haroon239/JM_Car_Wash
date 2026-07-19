import cors from "cors";
import express from "express";
import { z } from "zod";
import { checkDatabase, pool } from "./db.js";
const app = express();
const port = Number(process.env.PORT ?? 4000);
app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json());
const customerSchema = z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().regex(/^971\d{9}$/),
    email: z.email().optional().or(z.literal("")),
    plateNumber: z.string().trim().min(2).max(40),
    planId: z.coerce.number().int().positive(),
    planStartDate: z.iso.date()
});
const planSchema = z.object({
    name: z.string().trim().min(2).max(80),
    price: z.coerce.number().nonnegative().max(1_000_000),
    washesPerMonth: z.union([z.coerce.number().int().positive().max(1000), z.null()])
});
app.get("/api/health", async (_request, response) => {
    let database = false;
    try {
        database = await checkDatabase();
    }
    catch {
        database = false;
    }
    response.json({ ok: true, service: "jm-car-wash-api", database });
});
app.get("/api/plans", async (_request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    try {
        const result = await pool.query(`SELECT id, name, price, washes_per_month AS "washesPerMonth"
       FROM plans WHERE is_active = TRUE ORDER BY price`);
        response.json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
app.post("/api/plans", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const parsed = planSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ message: "Invalid plan details", errors: parsed.error.flatten() });
    try {
        const result = await pool.query(`INSERT INTO plans (name, price, washes_per_month) VALUES ($1, $2, $3)
       RETURNING id, name, price, washes_per_month AS "washesPerMonth"`, [parsed.data.name, parsed.data.price, parsed.data.washesPerMonth]);
        response.status(201).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
app.put("/api/plans/:id", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const id = z.coerce.number().int().positive().safeParse(request.params.id);
    const parsed = planSchema.safeParse(request.body);
    if (!id.success || !parsed.success)
        return response.status(400).json({ message: "Invalid plan details" });
    try {
        const result = await pool.query(`UPDATE plans SET name=$1, price=$2, washes_per_month=$3 WHERE id=$4 AND is_active=TRUE
       RETURNING id, name, price, washes_per_month AS "washesPerMonth"`, [parsed.data.name, parsed.data.price, parsed.data.washesPerMonth, id.data]);
        if (!result.rowCount)
            return response.status(404).json({ message: "Plan not found" });
        response.json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
app.delete("/api/plans/:id", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const id = z.coerce.number().int().positive().safeParse(request.params.id);
    if (!id.success)
        return response.status(400).json({ message: "Invalid plan id" });
    try {
        const result = await pool.query("UPDATE plans SET is_active=FALSE WHERE id=$1 AND is_active=TRUE RETURNING id", [id.data]);
        if (!result.rowCount)
            return response.status(404).json({ message: "Plan not found" });
        response.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
app.get("/api/customers", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    try {
        const view = request.query.view === "archived" ? "archived" : request.query.view === "all" ? "all" : "active";
        const condition = view === "all" ? "TRUE" : view === "archived" ? "c.deleted_at IS NOT NULL" : "c.deleted_at IS NULL";
        const result = await pool.query(`
      SELECT c.id, c.name, c.phone, c.email, c.plate_number AS "plateNumber",
             c.plan_start_date AS "planStartDate",
             c.status, c.deleted_at AS "archivedAt", p.name AS plan, p.price
      FROM customers c
      LEFT JOIN plans p ON p.id = c.plan_id
      WHERE ${condition}
      ORDER BY c.created_at DESC
    `);
        response.json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
app.post("/api/customers", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const parsed = customerSchema.safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ message: "Invalid customer details", errors: parsed.error.flatten() });
    const { name, phone, email, plateNumber, planId, planStartDate } = parsed.data;
    try {
        const result = await pool.query(`INSERT INTO customers (name, phone, email, plate_number, plan_id, plan_start_date)
       VALUES ($1, $2, NULLIF($3, ''), $4, $5, $6) RETURNING *`, [name, phone, email, plateNumber, planId, planStartDate]);
        response.status(201).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
app.put("/api/customers/:id", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const id = z.coerce.number().int().positive().safeParse(request.params.id);
    const parsed = customerSchema.safeParse(request.body);
    if (!id.success || !parsed.success)
        return response.status(400).json({ message: "Invalid customer details" });
    const { name, phone, email, plateNumber, planId, planStartDate } = parsed.data;
    try {
        const result = await pool.query(`UPDATE customers SET name=$1, phone=$2, email=NULLIF($3, ''), plate_number=$4,
       plan_id=$5, plan_start_date=$6, updated_at=NOW() WHERE id=$7 AND deleted_at IS NULL RETURNING *`, [name, phone, email, plateNumber, planId, planStartDate, id.data]);
        if (!result.rowCount)
            return response.status(404).json({ message: "Customer not found" });
        response.json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
app.delete("/api/customers/:id", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const id = z.coerce.number().int().positive().safeParse(request.params.id);
    if (!id.success)
        return response.status(400).json({ message: "Invalid customer id" });
    try {
        const result = await pool.query("UPDATE customers SET deleted_at=NOW(), status='archived' WHERE id=$1 AND deleted_at IS NULL RETURNING id", [id.data]);
        if (!result.rowCount)
            return response.status(404).json({ message: "Customer not found" });
        response.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
app.patch("/api/customers/:id/restore", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const id = z.coerce.number().int().positive().safeParse(request.params.id);
    if (!id.success)
        return response.status(400).json({ message: "Invalid customer id" });
    try {
        const result = await pool.query("UPDATE customers SET deleted_at=NULL, status='active', updated_at=NOW() WHERE id=$1 AND deleted_at IS NOT NULL RETURNING id", [id.data]);
        if (!result.rowCount)
            return response.status(404).json({ message: "Archived customer not found" });
        response.json({ id: result.rows[0].id, restored: true });
    }
    catch (error) {
        next(error);
    }
});
app.get("/api/invoices", async (_request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    try {
        const result = await pool.query(`
      SELECT i.id, i.invoice_number AS "invoiceNumber", i.customer_id AS "customerId",
             i.subtotal, i.vat_amount AS "vatAmount", i.total, i.status,
             i.issue_date AS "issueDate", i.due_date AS "dueDate", i.sent_at AS "sentAt",
             c.name AS "customerName", c.phone, c.plate_number AS "plateNumber", p.name AS "planName"
      FROM invoices i
      JOIN customers c ON c.id = i.customer_id
      LEFT JOIN plans p ON p.id = c.plan_id
      ORDER BY i.issue_date DESC, i.id DESC
    `);
        response.json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
app.post("/api/invoices", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const parsed = z.object({ customerId: z.coerce.number().int().positive() }).safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ message: "Invalid customer" });
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const customer = await client.query(`SELECT c.id, c.name, c.phone, c.plate_number, p.name AS plan_name, p.price
       FROM customers c JOIN plans p ON p.id=c.plan_id
       WHERE c.id=$1 AND c.deleted_at IS NULL`, [parsed.data.customerId]);
        if (!customer.rowCount) {
            await client.query("ROLLBACK");
            return response.status(404).json({ message: "Active customer not found" });
        }
        const total = Number(customer.rows[0].price);
        const subtotal = Number((total / 1.05).toFixed(2));
        const vatAmount = Number((total - subtotal).toFixed(2));
        const temporaryNumber = `TMP-${Date.now()}-${parsed.data.customerId}`;
        const inserted = await client.query(`INSERT INTO invoices (invoice_number, customer_id, subtotal, vat_amount, total, issue_date, due_date)
       VALUES ($1,$2,$3,$4,$5,CURRENT_DATE,CURRENT_DATE + INTERVAL '7 days') RETURNING id`, [temporaryNumber, parsed.data.customerId, subtotal, vatAmount, total]);
        const id = Number(inserted.rows[0].id);
        const invoiceNumber = `JMCW-${new Date().getFullYear()}-${String(id).padStart(6, "0")}`;
        const result = await client.query(`UPDATE invoices SET invoice_number=$1 WHERE id=$2
       RETURNING id, invoice_number AS "invoiceNumber", customer_id AS "customerId", subtotal,
       vat_amount AS "vatAmount", total, status, issue_date AS "issueDate", due_date AS "dueDate"`, [invoiceNumber, id]);
        await client.query("COMMIT");
        response.status(201).json({ ...result.rows[0], customerName: customer.rows[0].name, phone: customer.rows[0].phone, plateNumber: customer.rows[0].plate_number, planName: customer.rows[0].plan_name });
    }
    catch (error) {
        await client.query("ROLLBACK");
        next(error);
    }
    finally {
        client.release();
    }
});
app.patch("/api/invoices/:id/status", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const id = z.coerce.number().int().positive().safeParse(request.params.id);
    const body = z.object({ status: z.enum(["pending", "sent", "paid", "overdue"]) }).safeParse(request.body);
    if (!id.success || !body.success)
        return response.status(400).json({ message: "Invalid invoice status" });
    try {
        const result = await pool.query(`UPDATE invoices SET status=$1, sent_at=CASE WHEN $1='sent' THEN NOW() ELSE sent_at END
       WHERE id=$2 RETURNING id, status, sent_at AS "sentAt"`, [body.data.status, id.data]);
        if (!result.rowCount)
            return response.status(404).json({ message: "Invoice not found" });
        response.json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
app.get("/api/payments", async (_request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    try {
        const result = await pool.query(`
      SELECT pay.id, pay.invoice_id AS "invoiceId", pay.amount, pay.method, pay.reference,
             pay.paid_at AS "paidAt", pay.recorded_by AS "recordedBy",
             i.invoice_number AS "invoiceNumber", c.name AS "customerName"
      FROM payments pay
      JOIN invoices i ON i.id=pay.invoice_id
      JOIN customers c ON c.id=i.customer_id
      ORDER BY pay.paid_at DESC, pay.id DESC
    `);
        response.json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
app.post("/api/payments", async (request, response, next) => {
    if (!pool)
        return response.status(503).json({ message: "DATABASE_URL is not configured" });
    const parsed = z.object({
        invoiceId: z.coerce.number().int().positive(),
        method: z.enum(["cash", "card", "bank_transfer", "other"]),
        reference: z.string().trim().max(100).optional().default("")
    }).safeParse(request.body);
    if (!parsed.success)
        return response.status(400).json({ message: "Invalid payment details" });
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const invoice = await client.query("SELECT id, total, status FROM invoices WHERE id=$1 FOR UPDATE", [parsed.data.invoiceId]);
        if (!invoice.rowCount) {
            await client.query("ROLLBACK");
            return response.status(404).json({ message: "Invoice not found" });
        }
        if (invoice.rows[0].status === "paid") {
            await client.query("ROLLBACK");
            return response.status(409).json({ message: "Invoice is already paid" });
        }
        const result = await client.query(`INSERT INTO payments (invoice_id, amount, method, reference)
       VALUES ($1,$2,$3,NULLIF($4,''))
       RETURNING id, invoice_id AS "invoiceId", amount, method, reference, paid_at AS "paidAt", recorded_by AS "recordedBy"`, [parsed.data.invoiceId, invoice.rows[0].total, parsed.data.method, parsed.data.reference]);
        await client.query("UPDATE invoices SET status='paid' WHERE id=$1", [parsed.data.invoiceId]);
        await client.query("COMMIT");
        response.status(201).json(result.rows[0]);
    }
    catch (error) {
        await client.query("ROLLBACK");
        next(error);
    }
    finally {
        client.release();
    }
});
app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ message: "Unexpected server error" });
});
app.listen(port, () => console.log(`JM Car Wash API running at http://localhost:${port}`));
