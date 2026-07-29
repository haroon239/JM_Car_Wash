import type { Invoice } from "../types/domain";
export function InvoicesPage({
  invoices,
  onView,
  onPaid,
  onEdit,
}: {
  invoices: Invoice[];
  onView: (i: Invoice) => void;
  onPaid: (i: Invoice) => void;
  onEdit: (i: Invoice) => void;
}) {
  return (
    <section className="panel section-panel">
      <div className="panel-head">
        <div>
          <h2>Generated invoices</h2>
          <p>{invoices.length} invoices in the current location view</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Due date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id}>
                <td>
                  <strong>{i.invoiceNumber}</strong>
                  <small>{new Date(i.issueDate).toLocaleDateString("en-GB")}</small>
                  {i.revisionNumber > 0 && <small>Revision {i.revisionNumber}</small>}
                </td>
                <td>
                  {i.customerName}
                  <small>{i.plateNumber}</small>
                </td>
                <td>{new Date(i.dueDate).toLocaleDateString("en-GB")}</td>
                <td>
                  <strong>AED {i.total.toFixed(2)}</strong>
                  {i.paidAmount > 0 && (
                    <small>
                      Paid {i.paidAmount.toFixed(2)} · Balance {i.balance.toFixed(2)}
                    </small>
                  )}
                </td>
                <td>
                  <i className={`status ${i.status}`}>{i.status}</i>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="send-button" onClick={() => onView(i)}>
                      View PDF
                    </button>
                    {i.status !== "paid" && (
                      <button className="edit-button" onClick={() => onEdit(i)}>
                        Edit
                      </button>
                    )}
                    {i.status !== "paid" && (
                      <button className="paid-button" onClick={() => onPaid(i)}>
                        Record payment
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <div className="empty-state">No invoices generated yet.</div>}
      </div>
    </section>
  );
}
