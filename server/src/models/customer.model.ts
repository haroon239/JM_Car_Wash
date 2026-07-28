import { requireDatabase } from "../config/database.js";
import type { CustomerInput } from "../validators/customer.schema.js";

export async function findCustomers(view: "active" | "archived" | "all") {
  const condition =
    view === "all"
      ? "TRUE"
      : view === "archived"
        ? "c.deleted_at IS NOT NULL"
        : "c.deleted_at IS NULL";
  return (
    await requireDatabase().query(`
    SELECT c.id, c.name, c.phone, c.email, c.plate_number AS "plateNumber",
      c.building_no AS "buildingNo",c.flat_no AS "flatNo",c.parking_no AS "parkingNo",
      c.plan_start_date AS "planStartDate", c.status, c.deleted_at AS "archivedAt",
      p.name AS plan, c.agreed_price AS price, c.billing_type AS "billingType",
      c.auto_invoice AS "autoInvoice", c.next_invoice_date AS "nextInvoiceDate",
      current_invoice.status AS "invoiceStatus",
      current_invoice.due_date AS "invoiceDueDate"
    FROM customers c LEFT JOIN plans p ON p.id=c.plan_id
    LEFT JOIN LATERAL (
      SELECT i.status, i.due_date
      FROM invoices i
      WHERE i.customer_id = c.id
      ORDER BY i.billing_period DESC, i.id DESC
      LIMIT 1
    ) current_invoice ON TRUE
    WHERE ${condition} ORDER BY c.created_at DESC
  `)
  ).rows;
}

export async function createCustomer(input: CustomerInput) {
  const {
    name,
    phone,
    email,
    plateNumber,
    planId,
    planStartDate,
    agreedPrice,
    billingType,
    autoInvoice,
    nextInvoiceDate,
    buildingNo,
    flatNo,
    parkingNo,
  } = input;
  return (
    await requireDatabase().query(
      `INSERT INTO customers (
        name,phone,email,plate_number,plan_id,plan_start_date,agreed_price,
        billing_type,auto_invoice,next_invoice_date,building_no,flat_no,parking_no
      ) VALUES (
        $1,$2,NULLIF($3,''),$4,$5,$6,$7,$8,$9,$10,
        NULLIF($11,''),NULLIF($12,''),NULLIF($13,'')
      ) RETURNING *`,
      [
        name,
        phone,
        email,
        plateNumber,
        planId,
        planStartDate,
        agreedPrice,
        billingType,
        autoInvoice,
        nextInvoiceDate,
        buildingNo,
        flatNo,
        parkingNo,
      ],
    )
  ).rows[0];
}

export async function updateCustomer(id: number, input: CustomerInput) {
  const {
    name,
    phone,
    email,
    plateNumber,
    planId,
    planStartDate,
    agreedPrice,
    billingType,
    autoInvoice,
    nextInvoiceDate,
    buildingNo,
    flatNo,
    parkingNo,
  } = input;
  return (
    await requireDatabase().query(
      `UPDATE customers SET name=$1,phone=$2,email=NULLIF($3,''),plate_number=$4,plan_id=$5,
       plan_start_date=$6,agreed_price=$7,billing_type=$8,auto_invoice=$9,
       next_invoice_date=$10,building_no=NULLIF($11,''),flat_no=NULLIF($12,''),
       parking_no=NULLIF($13,''),updated_at=NOW()
       WHERE id=$14 AND deleted_at IS NULL RETURNING *`,
      [
        name,
        phone,
        email,
        plateNumber,
        planId,
        planStartDate,
        agreedPrice,
        billingType,
        autoInvoice,
        nextInvoiceDate,
        buildingNo,
        flatNo,
        parkingNo,
        id,
      ],
    )
  ).rows[0];
}

export async function archiveCustomer(id: number) {
  return (
    await requireDatabase().query(
      "UPDATE customers SET deleted_at=NOW(),status='archived' WHERE id=$1 AND deleted_at IS NULL RETURNING id",
      [id],
    )
  ).rows[0];
}

export async function restoreCustomer(id: number) {
  return (
    await requireDatabase().query(
      "UPDATE customers SET deleted_at=NULL,status='active',updated_at=NOW() WHERE id=$1 AND deleted_at IS NOT NULL RETURNING id",
      [id],
    )
  ).rows[0];
}
