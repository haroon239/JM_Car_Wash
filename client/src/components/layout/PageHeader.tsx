import type { Section } from "../../types/domain";
const copy: Record<Section, { eyebrow: string; title: string; subtitle: string }> = {
  overview: {
    eyebrow: "SATURDAY, 18 JULY",
    title: "Good evening, Haroon",
    subtitle: "Here’s what’s happening with your car wash subscriptions.",
  },
  customers: {
    eyebrow: "CUSTOMER MANAGEMENT",
    title: "Customers",
    subtitle: "Manage customer, vehicle and subscription records.",
  },
  plans: {
    eyebrow: "SUBSCRIPTIONS",
    title: "Plans",
    subtitle: "Manage monthly pricing and included car washes.",
  },
  invoices: {
    eyebrow: "BILLING",
    title: "Invoices",
    subtitle: "Prepare, download and track customer invoices.",
  },
  payments: {
    eyebrow: "FINANCE",
    title: "Payment history",
    subtitle: "Review paid, pending and overdue balances.",
  },
  settings: {
    eyebrow: "BUSINESS",
    title: "Settings",
    subtitle: "Configure company and invoice information.",
  },
};
export function PageHeader({
  section,
  onAddCustomer,
  onAddPlan,
  hidePrimaryAction = false,
}: {
  section: Section;
  onAddCustomer: () => void;
  onAddPlan: () => void;
  hidePrimaryAction?: boolean;
}) {
  const item = copy[section];
  return (
    <header>
      <div>
        <p className="eyebrow">{item.eyebrow}</p>
        <h1>{item.title}</h1>
        <p>{item.subtitle}</p>
      </div>
      <div className="header-actions">
        <button className="icon-button">◉</button>
        {!hidePrimaryAction && (
          <button className="primary" onClick={section === "plans" ? onAddPlan : onAddCustomer}>
            ＋ Add {section === "plans" ? "plan" : "customer"}
          </button>
        )}
      </div>
    </header>
  );
}
