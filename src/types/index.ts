export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  category: string;
  balance: number;
  parentId?: string;
  isActive: boolean;
  created: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  status: 'Active' | 'Inactive' | 'Prospect';
  totalRevenue: number;
  lastContact: Date;
  created: Date;
  notes: string;
}

export interface Transaction {
  id: string;
  date: Date;
  reference: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  customerId?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created: Date;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  date: Date;
  dueDate: Date;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  items: InvoiceItem[];
  created: Date;
  attachments?: File[];
  lastUpdated?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'opportunity' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  created: Date;
  category: string;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'Balance Sheet' | 'Income Statement' | 'Cash Flow' | 'Trial Balance';
  period: string;
  data: any;
  created: Date;
}