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
import { mockAccounts, mockCustomers, mockTransactions, mockInvoices } from '../data/mockData';

// Maximum time to wait for Supabase operations before timing out
const TIMEOUT_MS = 10000;

// Function to add timeout to promises
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeout]);
};

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
  const [user, setUser] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Initialize with mock data if offline mode is active
  useEffect(() => {
    if (isOfflineMode) {
      console.log("Using offline mode with mock data");
      setAccounts(mockAccounts);
      setCustomers(mockCustomers);
      setTransactions(mockTransactions);
      setInvoices(mockInvoices);
      setLoading(false);
    }
  }, [isOfflineMode]);

  // Check if Supabase is available
  const checkSupabaseAvailability = async () => {
    try {
      const { data, error } = await withTimeout(
        supabase.from('accounts').select('count').limit(1),
        5000
      );
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn("Supabase availability check failed:", err.message);
      return false;
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if Supabase is available
        const isAvailable = await checkSupabaseAvailability();
        
        if (!isAvailable) {
          console.warn("Supabase is not available, switching to offline mode");
          setIsOfflineMode(true);
          setError("Unable to connect to Supabase. Using offline mode with mock data.");
          return;
        }
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session ? session.user : null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchAllData();
        } else {
          // Not logged in, but Supabase is available
          setLoading(false);
        }
      } catch (err) {
        console.error("Error initializing app:", err);
        setError("Failed to initialize the application. Using offline mode.");
        setIsOfflineMode(true);
        setLoading(false);
      }
    };
    
    initializeApp();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session ? session.user : null;
      setUser(currentUser);
      
      if (currentUser && !isOfflineMode) {
        try {
          await fetchAllData();
        } catch (err) {
          console.error("Error fetching data after auth change:", err);
        }
      } else if (!currentUser) {
        // User logged out
        setLoading(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [retryCount]);

  // Fetch all data from Supabase with retry mechanism and timeout
  const fetchAllData = async () => {
    setLoading(true);
    try {
      setError(null);
      
      // Helper function to fetch data with timeout and fallback
      const fetchWithFallback = async (tableName, setStateFunction, mockData = []) => {
        try {
          const { data, error } = await withTimeout(
            supabase.from(tableName).select('*'),
            TIMEOUT_MS
          );
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            setStateFunction(data);
            return data;
          } else {
            console.warn(`No data found for ${tableName}, using fallback data`);
            setStateFunction(mockData);
            return mockData;
          }
        } catch (err) {
          console.error(`Error fetching ${tableName}:`, err.message);
          setStateFunction(mockData);
          return mockData;
        }
      };
    
      // Fetch accounts
      await fetchWithFallback('accounts', setAccounts, mockAccounts);
      
      // Fetch customers with transformation
      const customersData = await fetchWithFallback('customers', data => {
        // Transform customer data to match interface
        const transformedCustomers = (data || []).map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          company: customer.company || '',
          status: customer.status || 'Active',
          totalRevenue: customer.total_revenue || 0,
          lastContact: customer.last_contact ? new Date(customer.last_contact) : undefined,
          created: new Date(customer.created_at),
          notes: customer.notes || ''
        }));
        
        setCustomers(transformedCustomers);
      }, mockCustomers);
      
      // Fetch transactions
      await fetchWithFallback('transactions', setTransactions, mockTransactions);
      
      // Fetch invoices with items
      try {
        const { data: invoicesData, error: invoicesError } = await withTimeout(
          supabase.from('invoices').select(`*, items:invoice_items(*)`),
          TIMEOUT_MS
        );
        
        if (invoicesError) throw invoicesError;
        
        if (invoicesData && invoicesData.length > 0) {
          setInvoices(invoicesData);
        } else {
          setInvoices(mockInvoices);
        }
      } catch (err) {
        console.error("Error fetching invoices:", err.message);
        setInvoices(mockInvoices);
      }
      
      // Fetch other entities with fallback to empty arrays
      await fetchWithFallback('uae_customers', setUAECustomers, []);
      await fetchWithFallback('uae_suppliers', setUAESuppliers, []);
      await fetchWithFallback('sales_quotations', setSalesQuotations, []);
      await fetchWithFallback('purchase_invoices', setPurchaseInvoices, []);
      await fetchWithFallback('inventory_items', setInventoryItems, []);
      await fetchWithFallback('stock_movements', setStockMovements, []);
      await fetchWithFallback('stock_allocations', setStockAllocations, []);
      await fetchWithFallback('receipts', setReceipts, []);
      await fetchWithFallback('payments', setPayments, []);
      await fetchWithFallback('bank_accounts', setBankAccounts, []);
      await fetchWithFallback('bank_transactions', setBankTransactions, []);
      await fetchWithFallback('cash_book_entries', setCashBookEntries, []);
      await fetchWithFallback('inter_account_transfers', setInterAccountTransfers, []);
      await fetchWithFallback('uae_einvoices', setUAEEInvoices, []);
      
    } catch (err) {
      console.error('Error in fetchAllData:', err);
      setError(`Failed to fetch data: ${err.message}. Using offline mode with mock data.`);
      setIsOfflineMode(true);
      
      // Set mock data as fallback
      setAccounts(mockAccounts);
      setCustomers(mockCustomers);
      setTransactions(mockTransactions);
      setInvoices(mockInvoices);
    } finally {
      setLoading(false);
    }
  };

  // Retry connection
  const retryConnection = () => {
    setRetryCount(prev => prev + 1);
    setIsOfflineMode(false);
    setLoading(true);
    setError(null);
  };

  // CRUD operations for accounts with error handling
  const addAccount = async (account: Omit<Account, 'id' | 'created'>) => {
    try {
      if (isOfflineMode) {
        const newAccount = {
          ...account,
          id: Date.now().toString(),
          created: new Date()
        };
        setAccounts([...accounts, newAccount]);
        return newAccount;
      }

      const { data, error } = await withTimeout(
        supabase
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
          .single(),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      setAccounts([...accounts, data]);
      return data;
    } catch (error) {
      console.error('Error adding account:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to add account: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Add to local state even if Supabase operation failed
      const newAccount = {
        ...account,
        id: Date.now().toString(),
        created: new Date()
      };
      setAccounts([...accounts, newAccount]);
      return newAccount;
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      if (isOfflineMode) {
        const updatedAccounts = accounts.map(acc => 
          acc.id === id ? { ...acc, ...updates } : acc
        );
        setAccounts(updatedAccounts);
        return updatedAccounts.find(acc => acc.id === id);
      }

      const { data, error } = await withTimeout(
        supabase
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
          .single(),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      setAccounts(accounts.map(acc => acc.id === id ? data : acc));
      return data;
    } catch (error) {
      console.error('Error updating account:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to update account: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Update local state even if Supabase operation failed
      const updatedAccounts = accounts.map(acc => 
        acc.id === id ? { ...acc, ...updates } : acc
      );
      setAccounts(updatedAccounts);
      return updatedAccounts.find(acc => acc.id === id);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      if (isOfflineMode) {
        setAccounts(accounts.filter(acc => acc.id !== id));
        return;
      }

      const { error } = await withTimeout(
        supabase
          .from('accounts')
          .delete()
          .eq('id', id),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      setAccounts(accounts.filter(acc => acc.id !== id));
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to delete account: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Delete from local state even if Supabase operation failed
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  // CRUD operations for customers with error handling
  const addCustomer = async (customer: Omit<Customer, 'id' | 'created'>) => {
    try {
      if (isOfflineMode) {
        const newCustomer = {
          ...customer,
          id: Date.now().toString(),
          created: new Date()
        };
        setCustomers([...customers, newCustomer]);
        return newCustomer;
      }

      const { data, error } = await withTimeout(
        supabase
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
          .single(),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      // Transform the returned data
      const transformedCustomer = {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        company: data.company || '',
        status: data.status || 'Active',
        totalRevenue: data.total_revenue || 0,
        lastContact: data.last_contact ? new Date(data.last_contact) : undefined,
        created: new Date(data.created_at),
        notes: data.notes || ''
      };
      
      setCustomers([...customers, transformedCustomer]);
      return transformedCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to add customer: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Add to local state even if Supabase operation failed
      const newCustomer = {
        ...customer,
        id: Date.now().toString(),
        created: new Date()
      };
      setCustomers([...customers, newCustomer]);
      return newCustomer;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      if (isOfflineMode) {
        const updatedCustomers = customers.map(cust => 
          cust.id === id ? { ...cust, ...updates } : cust
        );
        setCustomers(updatedCustomers);
        return updatedCustomers.find(cust => cust.id === id);
      }

      const { data, error } = await withTimeout(
        supabase
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
          .single(),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      // Transform the returned data
      const transformedCustomer = {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        company: data.company || '',
        status: data.status || 'Active',
        totalRevenue: data.total_revenue || 0,
        lastContact: data.last_contact ? new Date(data.last_contact) : undefined,
        created: new Date(data.created_at),
        notes: data.notes || ''
      };
      
      setCustomers(customers.map(cust => cust.id === id ? transformedCustomer : cust));
      return transformedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to update customer: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Update local state even if Supabase operation failed
      const updatedCustomers = customers.map(cust => 
        cust.id === id ? { ...cust, ...updates } : cust
      );
      setCustomers(updatedCustomers);
      return updatedCustomers.find(cust => cust.id === id);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      if (isOfflineMode) {
        setCustomers(customers.filter(cust => cust.id !== id));
        return;
      }

      const { error } = await withTimeout(
        supabase
          .from('customers')
          .delete()
          .eq('id', id),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      setCustomers(customers.filter(cust => cust.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to delete customer: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Delete from local state even if Supabase operation failed
      setCustomers(customers.filter(cust => cust.id !== id));
    }
  };

  // CRUD operations for transactions with error handling
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created'>) => {
    try {
      if (isOfflineMode) {
        const newTransaction = {
          ...transaction,
          id: Date.now().toString(),
          created: new Date()
        };
        setTransactions([...transactions, newTransaction]);
        return newTransaction;
      }

      const { data, error } = await withTimeout(
        supabase
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
          .single(),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      setTransactions([...transactions, data]);
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to add transaction: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Add to local state even if Supabase operation failed
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        created: new Date()
      };
      setTransactions([...transactions, newTransaction]);
      return newTransaction;
    }
  };

  // CRUD operations for invoices with error handling
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'created'>) => {
    try {
      if (isOfflineMode) {
        const newInvoice = {
          ...invoice,
          id: Date.now().toString(),
          created: new Date()
        };
        setInvoices([...invoices, newInvoice]);
        return newInvoice;
      }

      // First, insert the invoice
      const { data: invoiceData, error: invoiceError } = await withTimeout(
        supabase
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
          .single(),
        TIMEOUT_MS
      );
      
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
        
        const { error: itemsError } = await withTimeout(
          supabase
            .from('invoice_items')
            .insert(invoiceItems),
          TIMEOUT_MS
        );
        
        if (itemsError) throw itemsError;
      }
      
      // Fetch the complete invoice with items
      const { data: completeInvoice, error: fetchError } = await withTimeout(
        supabase
          .from('invoices')
          .select(`
            *,
            items:invoice_items(*)
          `)
          .eq('id', invoiceData.id)
          .single(),
        TIMEOUT_MS
      );
      
      if (fetchError) throw fetchError;
      
      setInvoices([...invoices, completeInvoice]);
      return completeInvoice;
    } catch (error) {
      console.error('Error adding invoice:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to add invoice: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Add to local state even if Supabase operation failed
      const newInvoice = {
        ...invoice,
        id: Date.now().toString(),
        created: new Date()
      };
      setInvoices([...invoices, newInvoice]);
      return newInvoice;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      if (isOfflineMode) {
        const updatedInvoices = invoices.map(inv => 
          inv.id === id ? { ...inv, ...updates } : inv
        );
        setInvoices(updatedInvoices);
        return updatedInvoices.find(inv => inv.id === id);
      }

      // First, update the invoice
      const { data: invoiceData, error: invoiceError } = await withTimeout(
        supabase
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
          .single(),
        TIMEOUT_MS
      );
      
      if (invoiceError) throw invoiceError;
      
      // If items are provided, update them
      if (updates.items) {
        // First, delete existing items
        const { error: deleteError } = await withTimeout(
          supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', id),
          TIMEOUT_MS
        );
        
        if (deleteError) throw deleteError;
        
        // Then, insert new items
        const invoiceItems = updates.items.map(item => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }));
        
        const { error: itemsError } = await withTimeout(
          supabase
            .from('invoice_items')
            .insert(invoiceItems),
          TIMEOUT_MS
        );
        
        if (itemsError) throw itemsError;
      }
      
      // Fetch the complete invoice with items
      const { data: completeInvoice, error: fetchError } = await withTimeout(
        supabase
          .from('invoices')
          .select(`
            *,
            items:invoice_items(*)
          `)
          .eq('id', id)
          .single(),
        TIMEOUT_MS
      );
      
      if (fetchError) throw fetchError;
      
      setInvoices(invoices.map(inv => inv.id === id ? completeInvoice : inv));
      return completeInvoice;
    } catch (error) {
      console.error('Error updating invoice:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to update invoice: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Update local state even if Supabase operation failed
      const updatedInvoices = invoices.map(inv => 
        inv.id === id ? { ...inv, ...updates } : inv
      );
      setInvoices(updatedInvoices);
      return updatedInvoices.find(inv => inv.id === id);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      if (isOfflineMode) {
        setInvoices(invoices.filter(inv => inv.id !== id));
        return;
      }

      // Delete the invoice (cascade will delete items)
      const { error } = await withTimeout(
        supabase
          .from('invoices')
          .delete()
          .eq('id', id),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      
      // Fallback to offline mode if operation fails
      if (!isOfflineMode) {
        setError(`Failed to delete invoice: ${error.message}. Changes will not be saved to the database.`);
        setIsOfflineMode(true);
      }
      
      // Delete from local state even if Supabase operation failed
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  // Authentication functions with error handling
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
        }),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      setError(`Failed to sign up: ${error.message}`);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        TIMEOUT_MS
      );
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      setError(`Failed to sign in: ${error.message}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        TIMEOUT_MS
      );
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      setError(`Failed to sign out: ${error.message}`);
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
    isOfflineMode,
    
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
    fetchAllData,
    retryConnection
  };
};