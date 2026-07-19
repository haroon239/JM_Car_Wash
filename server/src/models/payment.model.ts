import { requireDatabase } from "../config/database.js";
import type { PaymentInput } from "../validators/payment.schema.js";

export async function findPayments() {
  return (await requireDatabase().query(`SELECT pay.id,pay.invoice_id AS "invoiceId",pay.amount,pay.method,pay.reference,pay.paid_at AS "paidAt",pay.recorded_by AS "recordedBy",i.invoice_number AS "invoiceNumber",c.name AS "customerName" FROM payments pay JOIN invoices i ON i.id=pay.invoice_id JOIN customers c ON c.id=i.customer_id ORDER BY pay.paid_at DESC,pay.id DESC`)).rows;
}

export async function createPayment(input: PaymentInput) {
  const client = await requireDatabase().connect();
  try {
    await client.query("BEGIN");
    const invoice = await client.query("SELECT id,total,status FROM invoices WHERE id=$1 FOR UPDATE", [input.invoiceId]);
    if (!invoice.rowCount) throw Object.assign(new Error("Invoice not found"), { status: 404 });
    if (invoice.rows[0].status === "paid") throw Object.assign(new Error("Invoice is already paid"), { status: 409 });
    const result = await client.query(`INSERT INTO payments (invoice_id,amount,method,reference) VALUES ($1,$2,$3,NULLIF($4,'')) RETURNING id,invoice_id AS "invoiceId",amount,method,reference,paid_at AS "paidAt",recorded_by AS "recordedBy"`, [input.invoiceId, invoice.rows[0].total, input.method, input.reference]);
    await client.query("UPDATE invoices SET status='paid' WHERE id=$1", [input.invoiceId]);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
