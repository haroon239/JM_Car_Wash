import { requireDatabase } from "../config/database.js";

export async function findInvoices() {
  return (await requireDatabase().query(`
    SELECT i.id,i.invoice_number AS "invoiceNumber",i.customer_id AS "customerId",i.subtotal,
      i.vat_amount AS "vatAmount",i.total,i.status,i.issue_date AS "issueDate",i.due_date AS "dueDate",
      i.sent_at AS "sentAt",c.name AS "customerName",c.phone,c.plate_number AS "plateNumber",p.name AS "planName"
    FROM invoices i JOIN customers c ON c.id=i.customer_id LEFT JOIN plans p ON p.id=c.plan_id
    ORDER BY i.issue_date DESC,i.id DESC
  `)).rows;
}

export async function createInvoice(customerId: number) {
  const client = await requireDatabase().connect();
  try {
    await client.query("BEGIN");
    const customer = await client.query(`SELECT c.id,c.name,c.phone,c.plate_number,p.name AS plan_name,p.price FROM customers c JOIN plans p ON p.id=c.plan_id WHERE c.id=$1 AND c.deleted_at IS NULL`, [customerId]);
    if (!customer.rowCount) throw Object.assign(new Error("Active customer not found"), { status: 404 });
    const existing = await client.query(`SELECT id,invoice_number AS "invoiceNumber",customer_id AS "customerId",subtotal,vat_amount AS "vatAmount",total,status,issue_date AS "issueDate",due_date AS "dueDate",sent_at AS "sentAt" FROM invoices WHERE customer_id=$1 AND billing_month=DATE_TRUNC('month',CURRENT_DATE)::DATE`, [customerId]);
    if (existing.rowCount) {
      await client.query("COMMIT");
      return { ...existing.rows[0], customerName: customer.rows[0].name, phone: customer.rows[0].phone, plateNumber: customer.rows[0].plate_number, planName: customer.rows[0].plan_name, wasExisting: true };
    }
    const settings = await client.query("SELECT invoice_prefix,vat_rate FROM company_settings WHERE id=1");
    const vatRate = Number(settings.rows[0]?.vat_rate ?? 5);
    const prefix = String(settings.rows[0]?.invoice_prefix ?? "JMCW");
    const total = Number(customer.rows[0].price);
    const subtotal = Number((total / (1 + vatRate / 100)).toFixed(2));
    const vatAmount = Number((total - subtotal).toFixed(2));
    const inserted = await client.query(`INSERT INTO invoices (invoice_number,customer_id,subtotal,vat_amount,total,issue_date,due_date,billing_month) VALUES ($1,$2,$3,$4,$5,CURRENT_DATE,CURRENT_DATE+INTERVAL '7 days',DATE_TRUNC('month',CURRENT_DATE)::DATE) ON CONFLICT (customer_id,billing_month) DO NOTHING RETURNING id`, [`TMP-${Date.now()}-${customerId}`, customerId, subtotal, vatAmount, total]);
    if (!inserted.rowCount) {
      const concurrent = await client.query(`SELECT id,invoice_number AS "invoiceNumber",customer_id AS "customerId",subtotal,vat_amount AS "vatAmount",total,status,issue_date AS "issueDate",due_date AS "dueDate",sent_at AS "sentAt" FROM invoices WHERE customer_id=$1 AND billing_month=DATE_TRUNC('month',CURRENT_DATE)::DATE`, [customerId]);
      await client.query("COMMIT");
      return { ...concurrent.rows[0], customerName: customer.rows[0].name, phone: customer.rows[0].phone, plateNumber: customer.rows[0].plate_number, planName: customer.rows[0].plan_name, wasExisting: true };
    }
    const id = Number(inserted.rows[0].id);
    const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${String(id).padStart(6, "0")}`;
    const result = await client.query(`UPDATE invoices SET invoice_number=$1 WHERE id=$2 RETURNING id,invoice_number AS "invoiceNumber",customer_id AS "customerId",subtotal,vat_amount AS "vatAmount",total,status,issue_date AS "issueDate",due_date AS "dueDate"`, [invoiceNumber, id]);
    await client.query("COMMIT");
    return { ...result.rows[0], customerName: customer.rows[0].name, phone: customer.rows[0].phone, plateNumber: customer.rows[0].plate_number, planName: customer.rows[0].plan_name, wasExisting: false };
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}

export async function updateInvoiceStatus(id: number, status: string) {
  return (await requireDatabase().query(`UPDATE invoices SET status=$1,sent_at=CASE WHEN $1='sent' THEN NOW() ELSE sent_at END WHERE id=$2 RETURNING id,status,sent_at AS "sentAt"`, [status, id])).rows[0];
}
