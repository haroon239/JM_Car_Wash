"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { PageHeader } from "../../components/layout/PageHeader";
import { Notice } from "../../components/common/Notice";
import { InvoicesPage } from "../../pages/InvoicesPage";
import { PaymentsPage } from "../../pages/PaymentsPage";
import { PlansPage } from "../../pages/PlansPage";
import { SettingsPage } from "../../pages/SettingsPage";
import type { CompanySettings, Customer, CustomerForm, Invoice, Payment, Plan, Section } from "../../types/domain";

const planPrices: Record<string, number> = { Basic: 99, Standard: 199, Premium: 299, Corporate: 1249 };

const initialCustomers: Customer[] = [
  { id: 1048, name: "Omar Khalid", phone: "971501234567", plate: "Dubai A 45218", plan: "Premium", planStartDate: "2026-07-01", amount: 299, due: "01 Aug 2026", status: "Pending" },
  { id: 1047, name: "Aisha Rahman", phone: "971522719834", plate: "Dubai L 9921", plan: "Standard", planStartDate: "2026-06-15", amount: 199, due: "01 Aug 2026", status: "Paid" },
  { id: 1046, name: "Nabil Motors LLC", phone: "971555410882", plate: "Fleet · 8 vehicles", plan: "Corporate", planStartDate: "2026-05-01", amount: 1249, due: "01 Aug 2026", status: "Overdue" },
  { id: 1045, name: "Hassan Ali", phone: "971504128765", plate: "Sharjah 3 71820", plan: "Basic", planStartDate: "2026-07-10", amount: 99, due: "01 Aug 2026", status: "Pending" },
];

export function DashboardController() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Customer | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerForm, setCustomerForm] = useState<CustomerForm>({ name: "", phone: "971", plate: "", plan: "Basic", planStartDate: new Date().toISOString().slice(0, 10) });
  const [notice, setNotice] = useState("");
  const [plans, setPlans] = useState<Plan[]>(Object.entries(planPrices).map(([name, price], index) => ({ id: index + 1, name, price, washesPerMonth: name === "Corporate" ? null : (index + 1) * 4 })));
  const [isSaving, setIsSaving] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({ name: "", price: "", washesPerMonth: "" });
  const [section, setSection] = useState<Section>("overview");
  const [customerView, setCustomerView] = useState<"active" | "archived" | "all">("active");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({companyName:"JM Car Wash",trn:"",address:"United Arab Emirates",invoicePrefix:"JMCW",vatRate:5});

  useEffect(() => {
    async function loadDatabaseData() {
      try {
        const [customersResponse, plansResponse, invoicesResponse, paymentsResponse,settingsResponse] = await Promise.all([fetch("/api/customers?view=all"), fetch("/api/plans"), fetch("/api/invoices"), fetch("/api/payments"),fetch("/api/settings")]);
        if (!customersResponse.ok || !plansResponse.ok || !invoicesResponse.ok || !paymentsResponse.ok||!settingsResponse.ok) return;
        const [customerRows, planRows, invoiceRows, paymentRows,settingsRow] = await Promise.all([customersResponse.json(), plansResponse.json(), invoicesResponse.json(), paymentsResponse.json(),settingsResponse.json()]);
        setSettings({...settingsRow,vatRate:Number(settingsRow.vatRate)});
        const normalizedPlans: Plan[] = planRows.map((plan: { id: string | number; name: string; price: string | number; washesPerMonth: number | null }) => ({ id: Number(plan.id), name: plan.name, price: Number(plan.price), washesPerMonth: plan.washesPerMonth }));
        setPlans(normalizedPlans);
        setInvoices(invoiceRows.map((invoice: Record<string, string | number | null>) => ({ ...invoice, id: Number(invoice.id), customerId: Number(invoice.customerId), total: Number(invoice.total) })) as Invoice[]);
        setPayments(paymentRows.map((payment: Record<string, string | number | null>) => ({ ...payment, id: Number(payment.id), invoiceId: Number(payment.invoiceId), amount: Number(payment.amount) })) as Payment[]);
        setCustomers(customerRows.map((customer: { id: string | number; name: string; phone: string; plateNumber: string; planStartDate?: string; archivedAt?: string | null; plan?: string; price?: string | number }) => ({
          id: Number(customer.id), name: customer.name, phone: customer.phone, plate: customer.plateNumber,
          plan: customer.plan ?? "No plan", planStartDate: customer.planStartDate?.slice(0, 10) ?? "", archivedAt: customer.archivedAt, amount: Number(customer.price ?? 0), due: "01 Aug 2026", status: "Pending" as const
        })));
      } catch {
        setNotice("Database is temporarily unavailable; showing demo records.");
      }
    }
    void loadDatabaseData();
  }, []);

  async function saveCompanySettings(){setIsSaving(true);try{const response=await fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});if(!response.ok)throw new Error((await response.json()).message??"Unable to save settings");const saved=await response.json();setSettings({...saved,vatRate:Number(saved.vatRate)});setNotice("Company and invoice settings saved.");}catch(error){setNotice(error instanceof Error?error.message:"Unable to save settings.");}finally{setIsSaving(false);}}

  const activeCustomers = useMemo(() => customers.filter((customer) => !customer.archivedAt), [customers]);
  const filtered = useMemo(() => activeCustomers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.plate} ${customer.plan}`.toLowerCase().includes(query.toLowerCase())
  ), [activeCustomers, query]);
  const customerFiltered = useMemo(() => customers.filter((customer) => {
    const matchesView = customerView === "all" || (customerView === "archived" ? Boolean(customer.archivedAt) : !customer.archivedAt);
    return matchesView && `${customer.name} ${customer.phone} ${customer.plate} ${customer.plan}`.toLowerCase().includes(query.toLowerCase());
  }), [customers, customerView, query]);

  function openWhatsApp(customer: Customer) {
    const invoice = activeInvoice?.invoiceNumber ?? `JMCW-${new Date().getFullYear()}-${customer.id}`;
    const message = `Hello ${customer.name}, your JM Car Wash invoice ${invoice} for AED ${customer.amount.toFixed(2)} is ready. Please find the invoice attached. Thank you.`;
    window.open(`https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setNotice(`WhatsApp opened for ${customer.name}. Attach the downloaded invoice and press Send.`);
  }

  async function markSent(customer: Customer) {
    if (!activeInvoice) return;
    try {
      const response = await fetch(`/api/invoices/${activeInvoice.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "sent" }) });
      if (!response.ok) throw new Error("Unable to update invoice status");
      setInvoices((current) => current.map((invoice) => invoice.id === activeInvoice.id ? { ...invoice, status: "sent", sentAt: new Date().toISOString() } : invoice));
      setActiveInvoice({ ...activeInvoice, status: "sent", sentAt: new Date().toISOString() });
      setNotice(`Invoice ${activeInvoice.invoiceNumber} marked as sent by Admin.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to mark invoice as sent."); }
  }

  async function prepareInvoice(customer: Customer) {
    try {
      const response = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerId: customer.id }) });
      if (!response.ok) throw new Error((await response.json()).message ?? "Unable to generate invoice");
      const row = await response.json();
      const invoice: Invoice = { ...row, id: Number(row.id), customerId: Number(row.customerId), total: Number(row.total) };
      setInvoices((current) => [invoice, ...current]);
      setActiveInvoice(invoice);
      setActive(customer);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to generate invoice."); }
  }

  function openSavedInvoice(invoice: Invoice) {
    const customer = customers.find((item) => item.id === invoice.customerId);
    if (!customer) return setNotice("Customer record for this invoice is unavailable.");
    setActiveInvoice(invoice);
    setActive(customer);
  }

  async function recordPayment(invoice: Invoice) {
    const method = window.prompt("Payment method: cash, card, bank_transfer, or other", "cash");
    if (!method) return;
    if (!["cash", "card", "bank_transfer", "other"].includes(method)) return setNotice("Invalid payment method.");
    const reference = window.prompt("Payment reference (optional)", "") ?? "";
    try {
      const response = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId: invoice.id, method, reference }) });
      if (!response.ok) throw new Error((await response.json()).message ?? "Unable to record payment");
      const row = await response.json();
      const payment: Payment = { ...row, id: Number(row.id), invoiceId: Number(row.invoiceId), amount: Number(row.amount), invoiceNumber: invoice.invoiceNumber, customerName: invoice.customerName };
      setPayments((current) => [payment, ...current]);
      setInvoices((current) => current.map((item) => item.id === invoice.id ? { ...item, status: "paid" } : item));
      if (activeInvoice?.id === invoice.id) setActiveInvoice({ ...activeInvoice, status: "paid" });
      setNotice(`${invoice.invoiceNumber} marked paid via ${method.replace("_", " ")}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to record payment."); }
  }

  function openCustomerForm(customer?: Customer) {
    setEditing(customer ?? null);
    setCustomerForm(customer
      ? { name: customer.name, phone: customer.phone, plate: customer.plate, plan: customer.plan, planStartDate: customer.planStartDate }
      : { name: "", phone: "971", plate: "", plan: "Basic", planStartDate: new Date().toISOString().slice(0, 10) });
    setShowCustomerForm(true);
  }

  async function saveCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedPlan = plans.find((plan) => plan.name === customerForm.plan);
    if (!selectedPlan) return setNotice("Please select a valid plan.");
    setIsSaving(true);
    try {
      const response = await fetch(editing ? `/api/customers/${editing.id}` : "/api/customers", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customerForm.name, phone: customerForm.phone, email: "", plateNumber: customerForm.plate, planId: selectedPlan.id, planStartDate: customerForm.planStartDate })
      });
      if (!response.ok) throw new Error((await response.json()).message ?? "Unable to save customer");
      const saved = await response.json();
      const record: Customer = { id: Number(saved.id), ...customerForm, amount: selectedPlan.price, due: "01 Aug 2026", status: editing?.status ?? "Pending" };
      setCustomers((current) => editing ? current.map((customer) => customer.id === editing.id ? record : customer) : [record, ...current]);
      setNotice(`${customerForm.name} ${editing ? "updated" : "added"} successfully.`);
      setShowCustomerForm(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save customer.");
    } finally { setIsSaving(false); }
  }

  async function archiveCustomer(customer: Customer) {
    if (!window.confirm(`Archive ${customer.name}? Their historical invoices will remain available.`)) return;
    try {
      const response = await fetch(`/api/customers/${customer.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to archive customer");
      setCustomers((current) => current.map((item) => item.id === customer.id ? { ...item, archivedAt: new Date().toISOString() } : item));
      setShowCustomerForm(false);
      setNotice(`${customer.name} archived.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to archive customer."); }
  }

  async function restoreCustomer(customer: Customer) {
    try {
      const response = await fetch(`/api/customers/${customer.id}/restore`, { method: "PATCH" });
      if (!response.ok) throw new Error("Unable to restore customer");
      setCustomers((current) => current.map((item) => item.id === customer.id ? { ...item, archivedAt: null } : item));
      setNotice(`${customer.name} restored to active customers.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to restore customer."); }
  }

  function openPlanForm(plan?: Plan) {
    setEditingPlan(plan ?? null);
    setPlanForm(plan ? { name: plan.name, price: String(plan.price), washesPerMonth: plan.washesPerMonth === null ? "" : String(plan.washesPerMonth) } : { name: "", price: "", washesPerMonth: "" });
  }

  async function savePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(editingPlan ? `/api/plans/${editingPlan.id}` : "/api/plans", {
        method: editingPlan ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: planForm.name, price: Number(planForm.price), washesPerMonth: planForm.washesPerMonth ? Number(planForm.washesPerMonth) : null })
      });
      if (!response.ok) throw new Error((await response.json()).message ?? "Unable to save plan");
      const saved = await response.json();
      const plan: Plan = { id: Number(saved.id), name: saved.name, price: Number(saved.price), washesPerMonth: saved.washesPerMonth };
      setPlans((current) => editingPlan ? current.map((item) => item.id === editingPlan.id ? plan : item) : [...current, plan].sort((a, b) => a.price - b.price));
      setEditingPlan(null);
      setPlanForm({ name: "", price: "", washesPerMonth: "" });
      setNotice(`${plan.name} plan ${editingPlan ? "updated" : "created"}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to save plan."); }
    finally { setIsSaving(false); }
  }

  async function deactivatePlan(plan: Plan) {
    if (!window.confirm(`Deactivate ${plan.name}? Existing customer records will keep their history.`)) return;
    try {
      const response = await fetch(`/api/plans/${plan.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to deactivate plan");
      setPlans((current) => current.filter((item) => item.id !== plan.id));
      setEditingPlan(null);
      setNotice(`${plan.name} plan deactivated.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to deactivate plan."); }
  }

  return (
    <main className="app-shell">
      <Sidebar section={section} onNavigate={setSection} activeCustomers={activeCustomers.length} customers={customers}/>

      <section className={`content section-${section}`}>
        <PageHeader section={section} onAddCustomer={()=>openCustomerForm()} onAddPlan={()=>{setShowPlans(true);openPlanForm();}}/>
        <Notice message={notice} onClose={()=>setNotice("")}/>

        {section === "customers" && <section className="panel section-panel"><div className="panel-head"><div><h2>Customer directory</h2><p>{activeCustomers.length} active · {customers.length - activeCustomers.length} archived</p></div><div className="view-tabs"><button className={customerView === "active" ? "active" : ""} onClick={() => setCustomerView("active")}>Active</button><button className={customerView === "archived" ? "active" : ""} onClick={() => setCustomerView("archived")}>Archived</button><button className={customerView === "all" ? "active" : ""} onClick={() => setCustomerView("all")}>All</button></div></div><div className="toolbar"><label>⌕<input aria-label="Search customers" placeholder="Search customer, phone or plate" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div><div className="table-wrap"><table><thead><tr><th>Customer</th><th>WhatsApp</th><th>Plan</th><th>Plan started</th><th>Status</th><th>Actions</th></tr></thead><tbody>{customerFiltered.map((customer) => <tr key={customer.id}><td><div className="customer-cell"><span>{customer.name.split(" ").map((part) => part[0]).slice(0,2).join("")}</span><div><strong>{customer.name}</strong><small>{customer.plate}</small></div></div></td><td>{customer.phone}</td><td>{customer.plan}<small>AED {customer.amount.toFixed(2)}/month</small></td><td>{customer.planStartDate ? new Date(`${customer.planStartDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td><td>{customer.archivedAt ? <i className="status archived">Archived</i> : <i className="status paid">Active</i>}</td><td><div className="row-actions">{customer.archivedAt ? <button className="restore-button" onClick={() => void restoreCustomer(customer)}>Restore</button> : <><button className="edit-button" onClick={() => openCustomerForm(customer)}>Edit</button><button className="send-button" onClick={() => void prepareInvoice(customer)}>Invoice</button></>}</div></td></tr>)}</tbody></table>{customerFiltered.length === 0 && <div className="empty-state">No {customerView} customers found.</div>}</div></section>}

        {section === "plans" && <PlansPage plans={plans} onEdit={(plan)=>{setShowPlans(true);openPlanForm(plan);}}/>}

        {section === "invoices" && <InvoicesPage invoices={invoices} onView={openSavedInvoice} onPaid={(invoice)=>void recordPayment(invoice)}/>} 

        {section === "payments" && <PaymentsPage payments={payments} invoices={invoices}/>} 

        {section === "settings" && <SettingsPage settings={settings} isSaving={isSaving} onChange={setSettings} onSave={()=>void saveCompanySettings()}/>} 

        <div className="stats">
          <article><div className="stat-icon aqua">♙</div><div><small>ACTIVE CUSTOMERS</small><strong>776</strong><p><em>+12</em> this month</p></div></article>
          <article><div className="stat-icon blue">د.إ</div><div><small>MONTHLY REVENUE</small><strong>AED 86,420</strong><p><em>+8.2%</em> vs last month</p></div></article>
          <article><div className="stat-icon amber">◷</div><div><small>PAYMENT PENDING</small><strong>AED 7,840</strong><p>24 invoices due</p></div></article>
          <article><div className="stat-icon red">!</div><div><small>OVERDUE</small><strong>8</strong><p>Needs attention</p></div></article>
        </div>

        <div className="workspace-grid">
          <section className="panel customers-panel">
            <div className="panel-head"><div><h2>Invoices to send</h2><p>Review, download and share through WhatsApp</p></div><button className="text-button">View all →</button></div>
            <div className="toolbar"><label>⌕<input aria-label="Search customers" placeholder="Search customer, phone or plate" value={query} onChange={(event) => setQuery(event.target.value)} /></label><button>All plans⌄</button><button>All statuses⌄</button></div>
            <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Plan</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>
              {filtered.map((customer) => <tr key={customer.id}><td><div className="customer-cell"><span>{customer.name.split(" ").map((part) => part[0]).slice(0,2).join("")}</span><div><strong>{customer.name}</strong><small>{customer.plate}</small></div></div></td><td><strong>{customer.plan}</strong><small>{customer.due}</small></td><td><strong>AED {customer.amount.toFixed(2)}</strong><small>Ready to generate</small></td><td><i className={`status ${customer.status.toLowerCase()}`}>{customer.status}</i></td><td><div className="row-actions"><button className="edit-button" onClick={() => openCustomerForm(customer)}>Edit</button><button className="send-button" onClick={() => void prepareInvoice(customer)}>Prepare invoice</button></div></td></tr>)}
            </tbody></table></div>
          </section>

          <aside className="panel plans-panel"><div className="panel-head"><div><h2>Plan breakdown</h2><p>Active subscriptions</p></div><button className="dots">⋯</button></div>
            <div className="donut"><div><strong>776</strong><small>active</small></div></div>
            <div className="legend"><p><span className="dot premium"></span><b>Premium</b><strong>312</strong></p><p><span className="dot standard"></span><b>Standard</b><strong>248</strong></p><p><span className="dot basic"></span><b>Basic</b><strong>164</strong></p><p><span className="dot corporate"></span><b>Corporate</b><strong>52</strong></p></div>
            <button className="secondary" onClick={() => { setShowPlans(true); setEditingPlan(null); }}>Manage plans</button>
          </aside>
        </div>
      </section>

      {showCustomerForm && <div className="modal-backdrop" onMouseDown={() => setShowCustomerForm(false)}><section className="customer-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head"><div><span className="ready">CUSTOMER RECORD</span><h2>{editing ? "Edit customer" : "Add new customer"}</h2><p>Enter the customer, vehicle and subscription details.</p></div><button onClick={() => setShowCustomerForm(false)}>×</button></div>
        <form className="customer-form" onSubmit={saveCustomer}>
          <label><span>Customer name</span><input required minLength={2} value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} placeholder="e.g. Ahmed Khan" /></label>
          <label><span>WhatsApp number</span><input required pattern="971[0-9]{9}" value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value.replace(/\D/g, "") })} placeholder="971501234567" /><small>Use UAE format without + or spaces</small></label>
          <label><span>Vehicle / plate number</span><input required value={customerForm.plate} onChange={(event) => setCustomerForm({ ...customerForm, plate: event.target.value })} placeholder="Dubai A 45218" /></label>
          <label><span>Subscription plan</span><select value={customerForm.plan} onChange={(event) => setCustomerForm({ ...customerForm, plan: event.target.value })}>{plans.map((plan) => <option key={plan.id} value={plan.name}>{plan.name} — AED {plan.price}</option>)}</select></label>
          <label><span>Plan start date</span><input required type="date" value={customerForm.planStartDate} onChange={(event) => setCustomerForm({ ...customerForm, planStartDate: event.target.value })} /></label>
          <div className="form-actions">{editing && <button type="button" className="danger" onClick={() => void archiveCustomer(editing)}>Archive customer</button>}<button type="button" className="secondary" onClick={() => setShowCustomerForm(false)}>Cancel</button><button type="submit" className="primary" disabled={isSaving}>{isSaving ? "Saving…" : editing ? "Save changes" : "Add customer"}</button></div>
        </form>
      </section></div>}

      {showPlans && <div className="modal-backdrop" onMouseDown={() => setShowPlans(false)}><section className="plans-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head"><div><span className="ready">SUBSCRIPTIONS</span><h2>Manage plans</h2><p>Create plans and update monthly pricing or wash limits.</p></div><button onClick={() => setShowPlans(false)}>×</button></div>
        <div className="plans-manager">
          <div className="plan-list">{plans.map((plan) => <button key={plan.id} className={editingPlan?.id === plan.id ? "selected" : ""} onClick={() => openPlanForm(plan)}><span><strong>{plan.name}</strong><small>{plan.washesPerMonth === null ? "Custom / unlimited washes" : `${plan.washesPerMonth} washes per month`}</small></span><b>AED {plan.price}</b></button>)}<button className="new-plan" onClick={() => openPlanForm()}>＋ Create new plan</button></div>
          <form className="plan-form" onSubmit={savePlan}><h3>{editingPlan ? `Edit ${editingPlan.name}` : "New plan"}</h3><label><span>Plan name</span><input required minLength={2} value={planForm.name} onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })} placeholder="e.g. Gold" /></label><label><span>Monthly price (AED)</span><input required type="number" min="0" step="0.01" value={planForm.price} onChange={(event) => setPlanForm({ ...planForm, price: event.target.value })} placeholder="299" /></label><label><span>Washes per month</span><input type="number" min="1" value={planForm.washesPerMonth} onChange={(event) => setPlanForm({ ...planForm, washesPerMonth: event.target.value })} placeholder="Leave blank for custom" /></label><div className="form-actions">{editingPlan && <button type="button" className="danger" onClick={() => void deactivatePlan(editingPlan)}>Deactivate</button>}<button type="submit" className="primary" disabled={isSaving}>{isSaving ? "Saving…" : editingPlan ? "Save changes" : "Create plan"}</button></div></form>
        </div>
      </section></div>}

      {active && <div className="modal-backdrop" onMouseDown={() => { setActive(null); setActiveInvoice(null); }}><section className="invoice-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head"><div><span className="ready">READY TO SEND</span><h2>Invoice {activeInvoice?.invoiceNumber}</h2><p>Review the invoice before sharing it with the customer.</p></div><button onClick={() => { setActive(null); setActiveInvoice(null); }}>×</button></div>
        <div className="invoice-paper">
          <div className="invoice-brand"><div className="brand-mark">JM</div><div><strong>{settings.companyName.toUpperCase()}</strong><small>{settings.address}{settings.trn?` · TRN ${settings.trn}`:""}</small></div><h3>TAX INVOICE</h3></div>
          <div className="invoice-meta"><div><small>BILL TO</small><strong>{active.name}</strong><p>{active.phone}<br/>{active.plate}</p></div><div><p><span>Invoice no.</span><b>{activeInvoice?.invoiceNumber}</b></p><p><span>Issue date</span><b>{activeInvoice ? new Date(activeInvoice.issueDate).toLocaleDateString("en-GB") : "—"}</b></p><p><span>Due date</span><b>{activeInvoice ? new Date(activeInvoice.dueDate).toLocaleDateString("en-GB") : "—"}</b></p></div></div>
          <table><thead><tr><th>Description</th><th>Qty</th><th>VAT</th><th>Amount</th></tr></thead><tbody><tr><td><strong>{active.plan} Car Wash Plan</strong><small>Monthly subscription</small></td><td>1</td><td>{settings.vatRate}%</td><td>AED {(active.amount/(1+settings.vatRate/100)).toFixed(2)}</td></tr></tbody></table>
          <div className="totals"><p><span>Subtotal</span><b>AED {(active.amount/(1+settings.vatRate/100)).toFixed(2)}</b></p><p><span>VAT {settings.vatRate}%</span><b>AED {(active.amount-active.amount/(1+settings.vatRate/100)).toFixed(2)}</b></p><p className="total"><span>Total due</span><b>AED {active.amount.toFixed(2)}</b></p></div>
        </div>
        <div className="send-steps"><p><span>1</span><b>Download invoice</b><small>Save this invoice as PDF</small></p><p><span>2</span><b>Open WhatsApp</b><small>Message is prepared for you</small></p><p><span>3</span><b>Attach & send</b><small>Select the PDF and press Send</small></p></div>
        <div className="modal-actions"><button className="secondary" onClick={() => window.print()}>↓ Download / Print PDF</button><button className="whatsapp" onClick={() => openWhatsApp(active)}>Open in WhatsApp ↗</button><button className="primary" onClick={() => void markSent(active)}>✓ Mark as sent</button></div>
      </section></div>}
    </main>
  );
}
