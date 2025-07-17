import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Account, 
  Customer, 
  Transaction, 
  Invoice, 
  InvoiceItem,
  UAECustomer,
  UAESupplier,
  SalesQuotation,
  QuotationItem,
  PurchaseInvoice,
  PurchaseInvoiceItem,
  InventoryItem,
  StockMovement,
  StockAllocation,
  Receipt,
  Payment,
  BankAccount,
  BankTransaction,
  CashBookEntry,
  InterAccountTransfer,
  UAEEInvoice
} from '../types';

export const useSupabase = () => {
  // State for all entities
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uaeCustomers, setUAECustomers] = useState<UAECustomer[]>([]);
  const [uaeSuppliers, setUAESuppliers] = useState<UAESupplier[]>([]);
  const [salesQuotations, setSalesQuotations] = useState<SalesQuotation[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockAllocations, setStockAllocations] = useState<StockAllocation[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [cashBookEntries, setCashBookEntries] = useState<CashBookEntry[]>([]);
  const [interAccountTransfers, setInterAccountTransfers] = useState<InterAccountTransfer[]>([]);
  const [uaeEInvoices, setUAEEInvoices] = useState<UAEEInvoice[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(supabase.auth.getUser());

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session ? await supabase.auth.getUser() : null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchAllData();
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch all data from Supabase
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('code', { ascending: true });
      
      if (accountsError) throw new Error(`Error fetching accounts: ${accountsError.message}`);
      setAccounts(accountsData || []);
      
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });
      
      if (customersError) throw new Error(`Error fetching customers: ${customersError.message}`);
      
      // Transform customer data to match interface
      const transformedCustomers = (customersData || []).map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        company: customer.company,
        status: customer.status,
        totalRevenue: customer.total_revenue || 0,
        lastContact: customer.last_contact ? new Date(customer.last_contact) : undefined,
        created: new Date(customer.created_at),
        notes: customer.notes || ''
      }));
      
      setCustomers(transformedCustomers);
      
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (transactionsError) throw new Error(`Error fetching transactions: ${transactionsError.message}`);
      setTransactions(transactionsData || []);
      
      // Fetch invoices with items
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .order('date', { ascending: false });
      
      if (invoicesError) throw new Error(`Error fetching invoices: ${invoicesError.message}`);
      setInvoices(invoicesData || []);
      
      // Fetch UAE customers
      const { data: uaeCustomersData, error: uaeCustomersError } = await supabase
        .from('uae_customers')
        .select('*')
        .order('customer_name', { ascending: true });
      
      if (uaeCustomersError) throw new Error(`Error fetching UAE customers: ${uaeCustomersError.message}`);
      setUAECustomers(uaeCustomersData || []);
      
      // Fetch UAE suppliers
      const { data: uaeSuppliersData, error: uaeSuppliersError } = await supabase
        .from('uae_suppliers')
        .select('*')
        .order('supplier_name', { ascending: true });
      
      if (uaeSuppliersError) throw new Error(`Error fetching UAE suppliers: ${uaeSuppliersError.message}`);
      setUAESuppliers(uaeSuppliersData || []);
      
      // Fetch sales quotations with items
      const { data: salesQuotationsData, error: salesQuotationsError } = await supabase
        .from('sales_quotations')
        .select(`
          *,
          items:quotation_items(*)
        `)
        .order('quotation_date', { ascending: false });
      
      if (salesQuotationsError) throw new Error(`Error fetching sales quotations: ${salesQuotationsError.message}`);
      setSalesQuotations(salesQuotationsData || []);
      
      // Fetch purchase invoices with items
      const { data: purchaseInvoicesData, error: purchaseInvoicesError } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          items:purchase_invoice_items(*)
        `)
        .order('invoice_date', { ascending: false });
      
      if (purchaseInvoicesError) throw new Error(`Error fetching purchase invoices: ${purchaseInvoicesError.message}`);
      setPurchaseInvoices(purchaseInvoicesData || []);
      
      // Fetch inventory items
      const { data: inventoryItemsData, error: inventoryItemsError } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });
      
      if (inventoryItemsError) throw new Error(`Error fetching inventory items: ${inventoryItemsError.message}`);
      setInventoryItems(inventoryItemsData || []);
      
      // Fetch stock movements
      const { data: stockMovementsData, error: stockMovementsError } = await supabase
        .from('stock_movements')
        .select('*')
        .order('date', { ascending: false });
      
      if (stockMovementsError) throw new Error(`Error fetching stock movements: ${stockMovementsError.message}`);
      setStockMovements(stockMovementsData || []);
      
      // Fetch stock allocations
      const { data: stockAllocationsData, error: stockAllocationsError } = await supabase
        .from('stock_allocations')
        .select('*')
        .order('allocation_date', { ascending: false });
      
      if (stockAllocationsError) throw new Error(`Error fetching stock allocations: ${stockAllocationsError.message}`);
      setStockAllocations(stockAllocationsData || []);
      
      // Fetch receipts
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('receipts')
        .select('*')
        .order('date', { ascending: false });
      
      if (receiptsError) throw new Error(`Error fetching receipts: ${receiptsError.message}`);
      setReceipts(receiptsData || []);
      
      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });
      
      if (paymentsError) throw new Error(`Error fetching payments: ${paymentsError.message}`);
      setPayments(paymentsData || []);
      
      // Fetch bank accounts
      const { data: bankAccountsData, error: bankAccountsError } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('bank_name', { ascending: true });
      
      if (bankAccountsError) throw new Error(`Error fetching bank accounts: ${bankAccountsError.message}`);
      setBankAccounts(bankAccountsData || []);
      
      // Fetch bank transactions
      const { data: bankTransactionsData, error: bankTransactionsError } = await supabase
        .from('bank_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      
      if (bankTransactionsError) throw new Error(`Error fetching bank transactions: ${bankTransactionsError.message}`);
      setBankTransactions(bankTransactionsData || []);
      
      // Fetch cash book entries
      const { data: cashBookEntriesData, error: cashBookEntriesError } = await supabase
        .from('cash_book_entries')
        .select('*')
        .order('date', { ascending: false });
      
      if (cashBookEntriesError) throw new Error(`Error fetching cash book entries: ${cashBookEntriesError.message}`);
      setCashBookEntries(cashBookEntriesData || []);
      
      // Fetch inter-account transfers
      const { data: interAccountTransfersData, error: interAccountTransfersError } = await supabase
        .from('inter_account_transfers')
        .select('*')
        .order('transfer_date', { ascending: false });
      
      if (interAccountTransfersError) throw new Error(`Error fetching inter-account transfers: ${interAccountTransfersError.message}`);
      setInterAccountTransfers(interAccountTransfersData || []);
      
      // Fetch UAE E-Invoices
      const { data: uaeEInvoicesData, error: uaeEInvoicesError } = await supabase
        .from('uae_einvoices')
        .select('*')
        .order('submission_date_time', { ascending: false });
      
      if (uaeEInvoicesError) throw new Error(`Error fetching UAE E-Invoices: ${uaeEInvoicesError.message}`);
      setUAEEInvoices(uaeEInvoicesData || []);
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations for accounts
  const addAccount = async (account: Omit<Account, 'id' | 'created'>) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          code: account.code,
          name: account.name,
          type: account.type,
          category: account.category,
          balance: account.balance,
          parent_id: account.parentId,
          is_active: account.isActive
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setAccounts([...accounts, data]);
      return data;
    } catch (error: any) {
      console.error('Error adding account:', error);
      throw error;
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({
          code: updates.code,
          name: updates.name,
          type: updates.type,
          category: updates.category,
          balance: updates.balance,
          parent_id: updates.parentId,
          is_active: updates.isActive
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setAccounts(accounts.map(acc => acc.id === id ? data : acc));
      return data;
    } catch (error: any) {
      console.error('Error updating account:', error);
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAccounts(accounts.filter(acc => acc.id !== id));
    } catch (error: any) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  // CRUD operations for customers
  const addCustomer = async (customer: Omit<Customer, 'id' | 'created'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          company: customer.company,
          status: customer.status,
          total_revenue: customer.totalRevenue,
          last_contact: customer.lastContact,
          notes: customer.notes
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform the returned data
      const transformedCustomer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        company: data.company,
        status: data.status,
        totalRevenue: data.total_revenue || 0,
        lastContact: data.last_contact ? new Date(data.last_contact) : undefined,
        created: new Date(data.created_at),
        notes: data.notes || ''
      };
      
      setCustomers([...customers, transformedCustomer]);
      return transformedCustomer;
    } catch (error: any) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
          company: updates.company,
          status: updates.status,
          total_revenue: updates.totalRevenue,
          last_contact: updates.lastContact,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform the returned data
      const transformedCustomer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        company: data.company,
        status: data.status,
        totalRevenue: data.total_revenue || 0,
        lastContact: data.last_contact ? new Date(data.last_contact) : undefined,
        created: new Date(data.created_at),
        notes: data.notes || ''
      };
      
      setCustomers(customers.map(cust => cust.id === id ? transformedCustomer : cust));
      return transformedCustomer;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCustomers(customers.filter(cust => cust.id !== id));
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  // CRUD operations for transactions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          date: transaction.date,
          reference: transaction.reference,
          description: transaction.description,
          debit_account_id: transaction.debitAccount,
          credit_account_id: transaction.creditAccount,
          amount: transaction.amount,
          customer_id: transaction.customerId,
          status: transaction.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setTransactions([...transactions, data]);
      return data;
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  // CRUD operations for invoices
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'created'>) => {
    try {
      // First, insert the invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoice.invoiceNumber,
          customer_id: invoice.customerId,
          date: invoice.date,
          due_date: invoice.dueDate,
          total: invoice.total,
          status: invoice.status,
          mj_no: invoice.mjNo,
          sales_order: invoice.salesOrder,
          sales_quote: invoice.salesQuote,
          description: invoice.description,
          project: invoice.project,
          division: invoice.division,
          closed_invoice: invoice.closedInvoice,
          withholding_tax: invoice.withholdingTax,
          discount: invoice.discount,
          chasis_no: invoice.chasisNo,
          vehicle_no: invoice.vehicleNo,
          car_model: invoice.carModel,
          service_kms: invoice.serviceKms,
          terms_conditions: invoice.termsConditions,
          cost_of_sales: invoice.costOfSales,
          approved_by: invoice.approvedBy,
          created_by: invoice.createdBy,
          credit_by: invoice.creditBy
        }])
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Then, insert the invoice items
      if (invoice.items && invoice.items.length > 0) {
        const invoiceItems = invoice.items.map(item => ({
          invoice_id: invoiceData.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);
        
        if (itemsError) throw itemsError;
      }
      
      // If this is a UAE E-Invoice, insert the e-invoice data
      if ('uaeFields' in invoice) {
        const uaeInvoice = invoice as unknown as UAEEInvoice;
        const { error: eInvoiceError } = await supabase
          .from('uae_einvoices')
          .insert([{
            invoice_id: invoiceData.id,
            invoice_type_code: uaeInvoice.uaeFields.invoiceTypeCode,
            invoice_type_sub_code: uaeInvoice.uaeFields.invoiceTypeSubCode,
            document_currency_code: uaeInvoice.uaeFields.documentCurrencyCode,
            tax_currency_code: uaeInvoice.uaeFields.taxCurrencyCode,
            supplier_tax_number: uaeInvoice.uaeFields.supplierTaxNumber,
            customer_tax_number: uaeInvoice.uaeFields.customerTaxNumber,
            payment_means_code: uaeInvoice.uaeFields.paymentMeansCode,
            tax_category_code: uaeInvoice.uaeFields.taxCategoryCode,
            tax_percent: uaeInvoice.uaeFields.taxPercent,
            invoice_note: uaeInvoice.uaeFields.invoiceNote,
            order_reference: uaeInvoice.uaeFields.orderReference,
            contract_reference: uaeInvoice.uaeFields.contractReference,
            additional_document_reference: uaeInvoice.uaeFields.additionalDocumentReference,
            qr_code: uaeInvoice.uaeFields.qrCode,
            digital_signature: uaeInvoice.uaeFields.digitalSignature,
            previous_invoice_hash: uaeInvoice.uaeFields.previousInvoiceHash,
            invoice_hash: uaeInvoice.uaeFields.invoiceHash,
            uuid: uaeInvoice.uaeFields.uuid,
            submission_date_time: uaeInvoice.uaeFields.submissionDateTime,
            clearance_status: uaeInvoice.uaeFields.clearanceStatus,
            clearance_date_time: uaeInvoice.uaeFields.clearanceDateTime
          }]);
        
        if (eInvoiceError) throw eInvoiceError;
      }
      
      // Fetch the complete invoice with items
      const { data: completeInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('id', invoiceData.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      setInvoices([...invoices, completeInvoice]);
      return completeInvoice;
    } catch (error: any) {
      console.error('Error adding invoice:', error);
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      // First, update the invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          invoice_number: updates.invoiceNumber,
          customer_id: updates.customerId,
          date: updates.date,
          due_date: updates.dueDate,
          total: updates.total,
          status: updates.status,
          mj_no: updates.mjNo,
          sales_order: updates.salesOrder,
          sales_quote: updates.salesQuote,
          description: updates.description,
          project: updates.project,
          division: updates.division,
          closed_invoice: updates.closedInvoice,
          withholding_tax: updates.withholdingTax,
          discount: updates.discount,
          chasis_no: updates.chasisNo,
          vehicle_no: updates.vehicleNo,
          car_model: updates.carModel,
          service_kms: updates.serviceKms,
          terms_conditions: updates.termsConditions,
          cost_of_sales: updates.costOfSales,
          approved_by: updates.approvedBy,
          created_by: updates.createdBy,
          credit_by: updates.creditBy
        })
        .eq('id', id)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // If items are provided, update them
      if (updates.items) {
        // First, delete existing items
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);
        
        if (deleteError) throw deleteError;
        
        // Then, insert new items
        const invoiceItems = updates.items.map(item => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);
        
        if (itemsError) throw itemsError;
      }
      
      // If this is a UAE E-Invoice, update the e-invoice data
      if ('uaeFields' in updates) {
        const uaeInvoice = updates as unknown as Partial<UAEEInvoice>;
        const { error: eInvoiceError } = await supabase
          .from('uae_einvoices')
          .update({
            invoice_type_code: uaeInvoice.uaeFields?.invoiceTypeCode,
            invoice_type_sub_code: uaeInvoice.uaeFields?.invoiceTypeSubCode,
            document_currency_code: uaeInvoice.uaeFields?.documentCurrencyCode,
            tax_currency_code: uaeInvoice.uaeFields?.taxCurrencyCode,
            supplier_tax_number: uaeInvoice.uaeFields?.supplierTaxNumber,
            customer_tax_number: uaeInvoice.uaeFields?.customerTaxNumber,
            payment_means_code: uaeInvoice.uaeFields?.paymentMeansCode,
            tax_category_code: uaeInvoice.uaeFields?.taxCategoryCode,
            tax_percent: uaeInvoice.uaeFields?.taxPercent,
            invoice_note: uaeInvoice.uaeFields?.invoiceNote,
            order_reference: uaeInvoice.uaeFields?.orderReference,
            contract_reference: uaeInvoice.uaeFields?.contractReference,
            additional_document_reference: uaeInvoice.uaeFields?.additionalDocumentReference,
            qr_code: uaeInvoice.uaeFields?.qrCode,
            digital_signature: uaeInvoice.uaeFields?.digitalSignature,
            previous_invoice_hash: uaeInvoice.uaeFields?.previousInvoiceHash,
            invoice_hash: uaeInvoice.uaeFields?.invoiceHash,
            clearance_status: uaeInvoice.uaeFields?.clearanceStatus,
            clearance_date_time: uaeInvoice.uaeFields?.clearanceDateTime
          })
          .eq('invoice_id', id);
        
        if (eInvoiceError) throw eInvoiceError;
      }
      
      // Fetch the complete invoice with items
      const { data: completeInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      setInvoices(invoices.map(inv => inv.id === id ? completeInvoice : inv));
      return completeInvoice;
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      // Delete the invoice (cascade will delete items)
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  };

  // Authentication functions
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Financial calculations
  const getTotalAssets = () => {
    return accounts
      .filter(acc => acc.type === 'Asset')
      .reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getTotalLiabilities = () => {
    return accounts
      .filter(acc => acc.type === 'Liability')
      .reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getTotalEquity = () => {
    return accounts
      .filter(acc => acc.type === 'Equity')
      .reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getTotalRevenue = () => {
    return accounts
      .filter(acc => acc.type === 'Revenue')
      .reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getTotalExpenses = () => {
    return accounts
      .filter(acc => acc.type === 'Expense')
      .reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getNetIncome = () => {
    return getTotalRevenue() - getTotalExpenses();
  };

  return {
    // Data
    accounts,
    customers,
    transactions,
    invoices,
    uaeCustomers,
    uaeSuppliers,
    salesQuotations,
    purchaseInvoices,
    inventoryItems,
    stockMovements,
    stockAllocations,
    receipts,
    payments,
    bankAccounts,
    bankTransactions,
    cashBookEntries,
    interAccountTransfers,
    uaeEInvoices,
    
    // Status
    loading,
    error,
    user,
    
    // CRUD operations
    addAccount,
    updateAccount,
    deleteAccount,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addTransaction,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    
    // Auth operations
    signUp,
    signIn,
    signOut,
    
    // Financial calculations
    getTotalAssets,
    getTotalLiabilities,
    getTotalEquity,
    getTotalRevenue,
    getTotalExpenses,
    getNetIncome,
    
    // Refresh data
    fetchAllData
  };
};