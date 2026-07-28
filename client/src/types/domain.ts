export type Customer = {
  id: number;
  name: string;
  phone: string;
  plate: string;
  buildingNo: string;
  flatNo: string;
  parkingNo: string;
  customerSince: string;
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
  | "buildingNo"
  | "flatNo"
  | "parkingNo"
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
export type CustomerActivity = {
  id: number;
  activityType: string;
  title: string;
  details?: string | null;
  actor: string;
  createdAt: string;
};
export type Section = "overview" | "customers" | "plans" | "invoices" | "payments" | "settings";
export type CustomerView = "active" | "archived" | "all";
export type CompanySettings = {
  companyName: string;
  phone: string;
  email: string;
  trn: string;
  address: string;
  invoicePrefix: string;
  vatRate: number;
};
