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
  invoiceNumber: string;
  customerId: string;
  date: Date;
  dueDate: Date;
  total: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  created: Date;
  attachments?: File[];
  lastUpdated?: Date;
  // Additional fields from InvoiceForm
  mjNo?: string;
  salesOrder?: string;
  salesQuote?: string;
  description?: string;
  project?: string;
  division?: string;
  closedInvoice?: boolean;
  withholdingTax?: number;
  discount?: number;
  chasisNo?: string;
  vehicleNo?: string;
  carModel?: string;
  serviceKms?: string;
  termsConditions?: string;
  costOfSales?: number;
  approvedBy?: string;
  createdBy?: string;
  creditBy?: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

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

// UAE E-Invoice Types
export interface UAEEInvoice extends Invoice {
  uaeFields: {
    invoiceTypeCode: string; // 388 for tax invoice, 381 for credit note, 383 for debit note
    invoiceTypeSubCode: string; // 01 for standard, 02 for simplified
    documentCurrencyCode: string; // AED
    taxCurrencyCode: string; // AED
    supplierTaxNumber: string; // TRN
    customerTaxNumber?: string; // Customer TRN if available
    paymentMeansCode: string; // 10 for cash, 30 for credit transfer, 48 for card
    taxCategoryCode: string; // S for standard rate, Z for zero rate, E for exempt
    taxPercent: number; // 5 for standard VAT
    invoiceNote?: string;
    orderReference?: string;
    contractReference?: string;
    additionalDocumentReference?: string;
    qrCode: string; // Base64 encoded QR code
    digitalSignature?: string;
    previousInvoiceHash?: string;
    invoiceHash: string;
    uuid: string;
    submissionDateTime: Date;
    clearanceStatus: 'CLEARED' | 'NOT_CLEARED' | 'REPORTED';
    clearanceDateTime?: Date;
  };
}

// Inventory Types
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  location: string;
  supplier: string;
  barcode?: string;
  expiryDate?: Date;
  batchNumber?: string;
  isActive: boolean;
  created: Date;
  lastUpdated: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference: string;
  description: string;
  fromLocation?: string;
  toLocation?: string;
  date: Date;
  createdBy: string;
}

export interface StockAllocation {
  id: string;
  itemId: string;
  orderId?: string;
  customerId?: string;
  allocatedQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  allocationDate: Date;
  expiryDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'FULFILLED' | 'CANCELLED';
  notes?: string;
}

// Receipt Types
export interface Receipt {
  id: string;
  receiptNumber: string;
  customerId: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';
  paymentReference?: string;
  date: Date;
  description: string;
  status: 'PENDING' | 'CLEARED' | 'BOUNCED' | 'CANCELLED';
  bankAccount?: string;
  chequeNumber?: string;
  chequeDate?: Date;
  created: Date;
  createdBy: string;
}

// Payment Types
export interface Payment {
  id: string;
  paymentNumber: string;
  supplierId?: string;
  vendorId?: string;
  billId?: string;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';
  paymentReference?: string;
  date: Date;
  description: string;
  status: 'PENDING' | 'CLEARED' | 'BOUNCED' | 'CANCELLED';
  bankAccount?: string;
  chequeNumber?: string;
  chequeDate?: Date;
  approvedBy?: string;
  created: Date;
  createdBy: string;
}

// UAE FTA-Compliant Module Types

// Customer Module - UAE FTA Compliant
export interface UAECustomer {
  id: string;
  customerName: string;
  trn: string; // Tax Registration Number
  contactDetails: {
    phone: string;
    email: string;
    website?: string;
  };
  billingAddress: {
    street: string;
    city: string;
    emirate: string;
    country: string;
    poBox?: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    emirate: string;
    country: string;
    poBox?: string;
  };
  customerType: 'VAT_REGISTERED' | 'NON_VAT';
  defaultVATTreatment: 'STANDARD_RATED' | 'ZERO_RATED' | 'EXEMPT';
  accountGroup: 'DOMESTIC' | 'GCC' | 'EXPORT';
  paymentTerms: string;
  creditLimit: number;
  isActive: boolean;
  created: Date;
  lastUpdated: Date;
}

// Supplier Module - UAE FTA Compliant
export interface UAESupplier {
  id: string;
  supplierName: string;
  trn: string;
  contactDetails: {
    phone: string;
    email: string;
    website?: string;
  };
  address: {
    street: string;
    city: string;
    emirate: string;
    country: string;
    poBox?: string;
  };
  supplierType: 'LOCAL' | 'GCC' | 'OVERSEAS';
  defaultVATTreatment: 'STANDARD_RATED' | 'ZERO_RATED' | 'EXEMPT' | 'REVERSE_CHARGE';
  paymentTerms: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
  };
  isActive: boolean;
  created: Date;
  lastUpdated: Date;
}

// Sales Quotation Module
export interface SalesQuotation {
  id: string;
  quotationNumber: string;
  quotationDate: Date;
  validityDate: Date;
  customerId: string;
  customerTRN: string;
  items: QuotationItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
  notes?: string;
  terms?: string;
  convertedToSalesOrder?: string;
  created: Date;
  createdBy: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  vatRate: number;
  vatTreatment: 'STANDARD_RATED' | 'ZERO_RATED' | 'EXEMPT';
  amount: number;
  vatAmount: number;
  totalAmount: number;
}

// Purchase Invoice Module
export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  supplierId: string;
  supplierTRN: string;
  items: PurchaseInvoiceItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  inputVATRecoverable: number;
  reverseChargeApplicable: boolean;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  paymentDueDate: Date;
  notes?: string;
  attachments?: File[];
  created: Date;
  createdBy: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  vatRate: number;
  vatTreatment: 'STANDARD_RATED' | 'ZERO_RATED' | 'EXEMPT' | 'REVERSE_CHARGE';
  amount: number;
  vatAmount: number;
  totalAmount: number;
}

// Purchase Quotation Module
export interface PurchaseQuotation {
  id: string;
  quotationNumber: string;
  quotationDate: Date;
  validityDate: Date;
  supplierId: string;
  items: PurchaseQuotationItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONVERTED' | 'EXPIRED' | 'REJECTED';
  notes?: string;
  convertedToPurchaseOrder?: string;
  created: Date;
  createdBy: string;
}

export interface PurchaseQuotationItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  vatRate: number;
  vatTreatment: 'STANDARD_RATED' | 'ZERO_RATED' | 'EXEMPT';
  amount: number;
  vatAmount: number;
  totalAmount: number;
}

// Cash Book Module
export interface CashBookEntry {
  id: string;
  date: Date;
  voucherNumber: string;
  particulars: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  narration: string;
  cashAccount: string;
  vatApplicable: boolean;
  vatAmount?: number;
  vatTreatment?: 'STANDARD_RATED' | 'ZERO_RATED' | 'EXEMPT';
  linkedTransactionId?: string;
  created: Date;
  createdBy: string;
}

// Bank Module
export interface BankAccount {
  id: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountType: 'CURRENT' | 'SAVINGS' | 'FIXED_DEPOSIT';
  ifscCode?: string;
  swiftCode?: string;
  iban: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  created: Date;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  transactionDate: Date;
  transactionType: 'DEBIT' | 'CREDIT';
  amount: number;
  balance: number;
  description: string;
  reference: string;
  chequeNumber?: string;
  vatApplicable: boolean;
  vatAmount?: number;
  vatTreatment?: 'STANDARD_RATED' | 'ZERO_RATED' | 'EXEMPT';
  reconciled: boolean;
  reconciledDate?: Date;
  created: Date;
  createdBy: string;
}

// Inter-Account Transfer Module
export interface InterAccountTransfer {
  id: string;
  transferNumber: string;
  transferDate: Date;
  fromAccount: {
    id: string;
    name: string;
    type: 'CASH' | 'BANK';
  };
  toAccount: {
    id: string;
    name: string;
    type: 'CASH' | 'BANK';
  };
  amount: number;
  narration: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  approvedBy?: string;
  approvalDate?: Date;
  created: Date;
  createdBy: string;
}

// VAT Return Module
export interface VATReturn {
  id: string;
  returnPeriod: string; // e.g., "2024-Q1"
  startDate: Date;
  endDate: Date;
  standardRatedSales: number;
  zeroRatedSales: number;
  exemptSales: number;
  outputVAT: number;
  standardRatedPurchases: number;
  zeroRatedPurchases: number;
  exemptPurchases: number;
  inputVAT: number;
  netVATPayable: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  submissionDate?: Date;
  created: Date;
  createdBy: string;
}