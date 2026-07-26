export type Customer = {
  id: number;
  name: string;
  phone: string;
  plate: string;
  plan: string;
  amount: number;
  due: string;
  planStartDate: string;
  billingType: "monthly" | "weekly" | "one_time" | "manual";
  autoInvoice: boolean;
  nextInvoiceDate: string;
  status: "Paid" | "Pending" | "Sent" | "Overdue";
  archivedAt?: string | null;
};
export type CustomerForm = Pick<
  Customer,
  | "name"
  | "phone"
  | "plate"
  | "plan"
  | "planStartDate"
  | "amount"
  | "billingType"
  | "autoInvoice"
  | "nextInvoiceDate"
>;
export type Plan = { id: number; name: string; price: number; washesPerMonth: number | null };
export type Invoice = {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  plateNumber: string;
  planName: string;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
  sentAt?: string | null;
  description: string;
  revisionNumber: number;
};
export type Payment = {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  method: string;
  reference?: string | null;
  paidAt: string;
  recordedBy: string;
};
export type Section = "overview" | "customers" | "plans" | "invoices" | "payments" | "settings";
export type CustomerView = "active" | "archived" | "all";
export type CompanySettings = {
  companyName: string;
  trn: string;
  address: string;
  invoicePrefix: string;
  vatRate: number;
};
