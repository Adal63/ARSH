import { Account, Customer, Transaction, Invoice, KPI, AIInsight } from '../types';

export const mockAccounts: Account[] = [
  {
    id: '1',
    code: '1000',
    name: 'Cash',
    type: 'Asset',
    category: 'Current Assets',
    balance: 125000,
    isActive: true,
    created: new Date('2024-01-01')
  },
  {
    id: '2',
    code: '1200',
    name: 'Accounts Receivable',
    type: 'Asset',
    category: 'Current Assets',
    balance: 45000,
    isActive: true,
    created: new Date('2024-01-01')
  },
  {
    id: '3',
    code: '1500',
    name: 'Equipment',
    type: 'Asset',
    category: 'Fixed Assets',
    balance: 85000,
    isActive: true,
    created: new Date('2024-01-01')
  },
  {
    id: '4',
    code: '2000',
    name: 'Accounts Payable',
    type: 'Liability',
    category: 'Current Liabilities',
    balance: 25000,
    isActive: true,
    created: new Date('2024-01-01')
  },
  {
    id: '5',
    code: '3000',
    name: 'Owner\'s Equity',
    type: 'Equity',
    category: 'Equity',
    balance: 180000,
    isActive: true,
    created: new Date('2024-01-01')
  },
  {
    id: '6',
    code: '4000',
    name: 'Sales Revenue',
    type: 'Revenue',
    category: 'Revenue',
    balance: 250000,
    isActive: true,
    created: new Date('2024-01-01')
  },
  {
    id: '7',
    code: '5000',
    name: 'Cost of Goods Sold',
    type: 'Expense',
    category: 'Cost of Sales',
    balance: 120000,
    isActive: true,
    created: new Date('2024-01-01')
  },
  {
    id: '8',
    code: '6000',
    name: 'Operating Expenses',
    type: 'Expense',
    category: 'Operating Expenses',
    balance: 65000,
    isActive: true,
    created: new Date('2024-01-01')
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    company: 'Tech Solutions Inc.',
    status: 'Active',
    totalRevenue: 45000,
    lastContact: new Date('2024-01-15'),
    created: new Date('2024-01-01'),
    notes: 'Key client, always pays on time'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    company: 'Marketing Pro LLC',
    status: 'Active',
    totalRevenue: 32000,
    lastContact: new Date('2024-01-12'),
    created: new Date('2024-01-05'),
    notes: 'Expanding business, potential for more services'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '+1 (555) 456-7890',
    address: '789 Pine St, Chicago, IL 60601',
    company: 'Davis Consulting',
    status: 'Prospect',
    totalRevenue: 0,
    lastContact: new Date('2024-01-10'),
    created: new Date('2024-01-08'),
    notes: 'Interested in our premium package'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    reference: 'INV-001',
    description: 'Payment received from Tech Solutions Inc.',
    debitAccount: '1000',
    creditAccount: '1200',
    amount: 5000,
    customerId: '1',
    status: 'Approved',
    created: new Date('2024-01-15')
  },
  {
    id: '2',
    date: new Date('2024-01-16'),
    reference: 'BILL-001',
    description: 'Office supplies purchase',
    debitAccount: '6000',
    creditAccount: '1000',
    amount: 250,
    status: 'Approved',
    created: new Date('2024-01-16')
  },
  {
    id: '3',
    date: new Date('2024-01-17'),
    reference: 'SAL-001',
    description: 'Service revenue',
    debitAccount: '1200',
    creditAccount: '4000',
    amount: 8000,
    customerId: '2',
    status: 'Approved',
    created: new Date('2024-01-17')
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    date: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    total: 5000,
    status: 'paid',
    items: [
      {
        id: '1',
        description: 'Consulting Services',
        quantity: 40,
        rate: 125,
        amount: 5000
      }
    ],
    created: new Date('2024-01-15')
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerId: '2',
    date: new Date('2024-01-17'),
    dueDate: new Date('2024-02-17'),
    total: 8000,
    status: 'pending',
    items: [
      {
        id: '2',
        description: 'Marketing Campaign',
        quantity: 1,
        rate: 8000,
        amount: 8000
      }
    ],
    created: new Date('2024-01-17')
  }
];

export const mockKPIs: KPI[] = [
  {
    id: '1',
    name: 'Monthly Revenue',
    value: 45000,
    target: 50000,
    unit: '$',
    trend: 'up',
    change: 12.5,
    category: 'Revenue'
  },
  {
    id: '2',
    name: 'Gross Margin',
    value: 65.2,
    target: 70,
    unit: '%',
    trend: 'up',
    change: 2.8,
    category: 'Profitability'
  },
  {
    id: '3',
    name: 'Cash Flow',
    value: 125000,
    target: 100000,
    unit: '$',
    trend: 'up',
    change: 25,
    category: 'Liquidity'
  },
  {
    id: '4',
    name: 'Collection Period',
    value: 28,
    target: 30,
    unit: 'days',
    trend: 'down',
    change: -6.7,
    category: 'Efficiency'
  }
];

export const mockAIInsights: AIInsight[] = [
  {
    id: '1',
    title: 'Cash Flow Optimization',
    description: 'Your cash flow is strong, but consider investing excess cash in short-term securities to maximize returns.',
    type: 'opportunity',
    priority: 'medium',
    created: new Date('2024-01-15'),
    category: 'Cash Management'
  },
  {
    id: '2',
    title: 'Accounts Receivable Alert',
    description: 'Invoice INV-2024-002 is approaching due date. Consider sending a reminder to Marketing Pro LLC.',
    type: 'warning',
    priority: 'high',
    created: new Date('2024-01-16'),
    category: 'Collections'
  },
  {
    id: '3',
    title: 'Expense Trend Analysis',
    description: 'Operating expenses have increased 8% this month. Review the largest expense categories for optimization opportunities.',
    type: 'recommendation',
    priority: 'medium',
    created: new Date('2024-01-17'),
    category: 'Cost Control'
  }
];

export const monthlyRevenueData = [
  { month: 'Jan', revenue: 45000, target: 50000 },
  { month: 'Feb', revenue: 52000, target: 50000 },
  { month: 'Mar', revenue: 48000, target: 50000 },
  { month: 'Apr', revenue: 55000, target: 50000 },
  { month: 'May', revenue: 58000, target: 50000 },
  { month: 'Jun', revenue: 62000, target: 50000 }
];

export const expenseBreakdown = [
  { category: 'Cost of Goods Sold', amount: 120000, percentage: 48 },
  { category: 'Operating Expenses', amount: 65000, percentage: 26 },
  { category: 'Marketing', amount: 35000, percentage: 14 },
  { category: 'Administrative', amount: 30000, percentage: 12 }
];