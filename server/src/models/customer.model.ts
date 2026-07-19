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
      c.plan_start_date AS "planStartDate", c.status, c.deleted_at AS "archivedAt",
      p.name AS plan, p.price
    FROM customers c LEFT JOIN plans p ON p.id=c.plan_id
    WHERE ${condition} ORDER BY c.created_at DESC
  `)
  ).rows;
}

export async function createCustomer(input: CustomerInput) {
  const { name, phone, email, plateNumber, planId, planStartDate } = input;
  return (
    await requireDatabase().query(
      `INSERT INTO customers (name,phone,email,plate_number,plan_id,plan_start_date)
     VALUES ($1,$2,NULLIF($3,''),$4,$5,$6) RETURNING *`,
      [name, phone, email, plateNumber, planId, planStartDate],
    )
  ).rows[0];
}

export async function updateCustomer(id: number, input: CustomerInput) {
  const { name, phone, email, plateNumber, planId, planStartDate } = input;
  return (
    await requireDatabase().query(
      `UPDATE customers SET name=$1,phone=$2,email=NULLIF($3,''),plate_number=$4,plan_id=$5,
     plan_start_date=$6,updated_at=NOW() WHERE id=$7 AND deleted_at IS NULL RETURNING *`,
      [name, phone, email, plateNumber, planId, planStartDate, id],
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
