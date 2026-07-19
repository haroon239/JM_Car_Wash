import { requireDatabase } from "../config/database.js";

const uaeToday = "(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dubai')::DATE";
const uaeBillingMonth = "DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Dubai')::DATE";

export async function findInvoices() {
  return (
    await requireDatabase().query(`
    SELECT i.id,i.invoice_number AS "invoiceNumber",i.customer_id AS "customerId",i.subtotal,
      i.vat_amount AS "vatAmount",i.total,i.status,i.issue_date AS "issueDate",i.due_date AS "dueDate",
      i.sent_at AS "sentAt",c.name AS "customerName",c.phone,c.plate_number AS "plateNumber",p.name AS "planName"
    FROM invoices i JOIN customers c ON c.id=i.customer_id LEFT JOIN plans p ON p.id=c.plan_id
    ORDER BY i.issue_date DESC,i.id DESC
  `)
  ).rows;
}

export async function createInvoice(customerId: number) {
  const client = await requireDatabase().connect();
  try {
    await client.query("BEGIN");
    const customer = await client.query(
      `SELECT c.id,c.name,c.phone,c.plate_number,p.name AS plan_name,p.price FROM customers c JOIN plans p ON p.id=c.plan_id WHERE c.id=$1 AND c.deleted_at IS NULL`,
      [customerId],
    );
    if (!customer.rowCount)
      throw Object.assign(new Error("Active customer not found"), { status: 404 });
    const existing = await client.query(
      `SELECT id,invoice_number AS "invoiceNumber",customer_id AS "customerId",subtotal,vat_amount AS "vatAmount",total,status,issue_date AS "issueDate",due_date AS "dueDate",sent_at AS "sentAt" FROM invoices WHERE customer_id=$1 AND billing_month=${uaeBillingMonth}`,
      [customerId],
    );
    if (existing.rowCount) {
      await client.query("COMMIT");
      return {
        ...existing.rows[0],
        customerName: customer.rows[0].name,
        phone: customer.rows[0].phone,
        plateNumber: customer.rows[0].plate_number,
        planName: customer.rows[0].plan_name,
        wasExisting: true,
      };
    }
    const settings = await client.query(
      "SELECT invoice_prefix,vat_rate FROM company_settings WHERE id=1",
    );
    const vatRate = Number(settings.rows[0]?.vat_rate ?? 5);
    const prefix = String(settings.rows[0]?.invoice_prefix ?? "JMCW");
    const total = Number(customer.rows[0].price);
    const subtotal = Number((total / (1 + vatRate / 100)).toFixed(2));
    const vatAmount = Number((total - subtotal).toFixed(2));
    const inserted = await client.query(
      `INSERT INTO invoices (invoice_number,customer_id,subtotal,vat_amount,total,issue_date,due_date,billing_month) VALUES ($1,$2,$3,$4,$5,${uaeToday},${uaeToday}+7,${uaeBillingMonth}) ON CONFLICT (customer_id,billing_month) DO NOTHING RETURNING id,issue_date`,
      [`TMP-${Date.now()}-${customerId}`, customerId, subtotal, vatAmount, total],
    );
    if (!inserted.rowCount) {
      const concurrent = await client.query(
        `SELECT id,invoice_number AS "invoiceNumber",customer_id AS "customerId",subtotal,vat_amount AS "vatAmount",total,status,issue_date AS "issueDate",due_date AS "dueDate",sent_at AS "sentAt" FROM invoices WHERE customer_id=$1 AND billing_month=${uaeBillingMonth}`,
        [customerId],
      );
      await client.query("COMMIT");
      return {
        ...concurrent.rows[0],
        customerName: customer.rows[0].name,
        phone: customer.rows[0].phone,
        plateNumber: customer.rows[0].plate_number,
        planName: customer.rows[0].plan_name,
        wasExisting: true,
      };
    }
    const id = Number(inserted.rows[0].id);
    const invoiceYear = new Date(inserted.rows[0].issue_date).getUTCFullYear();
    const invoiceNumber = `${prefix}-${invoiceYear}-${String(id).padStart(6, "0")}`;
    const result = await client.query(
      `UPDATE invoices SET invoice_number=$1 WHERE id=$2 RETURNING id,invoice_number AS "invoiceNumber",customer_id AS "customerId",subtotal,vat_amount AS "vatAmount",total,status,issue_date AS "issueDate",due_date AS "dueDate"`,
      [invoiceNumber, id],
    );
    await client.query("COMMIT");
    return {
      ...result.rows[0],
      customerName: customer.rows[0].name,
      phone: customer.rows[0].phone,
      plateNumber: customer.rows[0].plate_number,
      planName: customer.rows[0].plan_name,
      wasExisting: false,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findCustomersMissingCurrentInvoice() {
  return (
    await requireDatabase().query(`
      SELECT c.id
      FROM customers c
      JOIN plans p ON p.id = c.plan_id AND p.is_active = TRUE
      WHERE c.deleted_at IS NULL
        AND c.status = 'active'
        AND c.plan_start_date IS NOT NULL
        -- The first recurring invoice is due only after one complete plan month.
        AND c.plan_start_date < DATE_TRUNC('month', ${uaeToday})::DATE
        AND ${uaeToday} >= MAKE_DATE(
          EXTRACT(YEAR FROM ${uaeToday})::INTEGER,
          EXTRACT(MONTH FROM ${uaeToday})::INTEGER,
          LEAST(
            EXTRACT(DAY FROM c.plan_start_date)::INTEGER,
            EXTRACT(
              DAY FROM (DATE_TRUNC('month', ${uaeToday}) + INTERVAL '1 month - 1 day')
            )::INTEGER
          )
        )
        AND NOT EXISTS (
          SELECT 1 FROM invoices i
          WHERE i.customer_id = c.id AND i.billing_month = ${uaeBillingMonth}
        )
      ORDER BY c.id
    `)
  ).rows as Array<{ id: string | number }>;
}

export async function markPastDueInvoicesOverdue() {
  return (
    await requireDatabase().query(`
      UPDATE invoices
      SET status = 'overdue'
      WHERE status IN ('pending', 'sent') AND due_date < ${uaeToday}
      RETURNING id
    `)
  ).rowCount;
}

export async function updateInvoiceStatus(id: number, status: string) {
  return (
    await requireDatabase().query(
      `UPDATE invoices SET status=$1,sent_at=CASE WHEN $1='sent' THEN NOW() ELSE sent_at END WHERE id=$2 RETURNING id,status,sent_at AS "sentAt"`,
      [status, id],
    )
  ).rows[0];
}
