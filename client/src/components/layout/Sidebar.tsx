import type { Customer, Section } from "../../types/domain";
type Props = {
  section: Section;
  onNavigate: (section: Section) => void;
  activeCustomers: number;
  customers: Customer[];
};
const items: [Section, string, string][] = [
  ["overview", "⌂", "Overview"],
  ["customers", "♙", "Customers"],
  ["plans", "◇", "Plans"],
  ["invoices", "▤", "Invoices"],
  ["payments", "◷", "Payment history"],
  ["settings", "⚙", "Settings"],
];
export function Sidebar({ section, onNavigate, activeCustomers, customers }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">JM</span>
        <div>
          <strong>JM Car Wash</strong>
          <small>Billing Manager</small>
        </div>
      </div>
      <nav>
        {items.map(([id, icon, label]) => (
          <button
            key={id}
            className={`nav-item ${section === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <span>{icon}</span>
            {label}
            {id === "customers" && <b>{activeCustomers}</b>}
            {id === "invoices" && <b>{customers.filter((c) => c.status !== "Paid").length}</b>}
          </button>
        ))}
      </nav>
      <div className="profile">
        <div className="avatar">HA</div>
        <div>
          <strong>Haroon Ahmed</strong>
          <small>Administrator</small>
        </div>
        <button>⋮</button>
      </div>
    </aside>
  );
}
