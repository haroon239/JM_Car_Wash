import type { Invoice, Payment } from "../types/domain";
export function PaymentsPage({ payments, invoices }: { payments: Payment[]; invoices: Invoice[] }) {
  return (
    <section className="section-panel">
      <div className="payment-summary">
        <article>
          <small>COLLECTED</small>
          <strong>AED {payments.reduce((s, p) => s + p.amount, 0).toFixed(2)}</strong>
          <p>{payments.length} recorded payments</p>
        </article>
        <article>
          <small>AWAITING PAYMENT</small>
          <strong>
            AED{" "}
            {invoices
              .filter((i) => i.status !== "paid")
              .reduce((s, i) => s + i.total, 0)
              .toFixed(2)}
          </strong>
          <p>Pending, sent and overdue invoices</p>
        </article>
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Payment history</h2>
            <p>Permanent payment records from PostgreSQL</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Invoice</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    {new Date(p.paidAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>
                    <strong>{p.customerName}</strong>
                  </td>
                  <td>{p.invoiceNumber}</td>
                  <td>
                    <span className="method-badge">{p.method.replace("_", " ")}</span>
                  </td>
                  <td>{p.reference || "—"}</td>
                  <td>
                    <strong>AED {p.amount.toFixed(2)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <div className="empty-state">No payments recorded yet.</div>}
        </div>
      </section>
    </section>
  );
}
