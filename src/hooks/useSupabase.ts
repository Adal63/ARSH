import { useState, useEffect } from 'react';
import { useAPI } from './useAPI';
import { 
  Account, 
  Customer, 
  Transaction, 
  Invoice,
  UAECustomer,
  UAESupplier
} from '../types';

export const useSupabase = () => {
  const api = useAPI();
  
  // State for all entities
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uaeCustomers, setUAECustomers] = useState<UAECustomer[]>([]);
  const [uaeSuppliers, setUAESuppliers] = useState<UAESupplier[]>([]);
  
  const [user, setUser] = useState(null);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Fetch all data from AWS backend
  useEffect(() => {
    const initializeApp = async () => {
      // Check if user is logged in
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData.user);
          await fetchAllData();
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('auth_token');
        }
      }
    };
    
    initializeApp();
  }, []);

  // Fetch all data from backend
  const fetchAllData = async () => {
    try {
      const [accountsData, customersData, transactionsData, invoicesData, uaeCustomersData, uaeSuppliersData] = await Promise.all([
        api.getAccounts(),
        api.getCustomers(),
        api.getTransactions(),
        api.getInvoices(),
        api.getUAECustomers(),
        api.getUAESuppliers()
      ]);
      
      setAccounts(accountsData || []);
      setCustomers(customersData || []);
      setTransactions(transactionsData || []);
      setInvoices(invoicesData || []);
      setUAECustomers(uaeCustomersData || []);
      setUAESuppliers(uaeSuppliersData || []);
      setDataInitialized(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // CRUD operations for accounts
  const addAccount = async (account: Omit<Account, 'id' | 'created'>) => {
    try {
      const newAccount = await api.createAccount(account);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const updatedAccount = await api.updateAccount(id, updates);
      setAccounts(prev => prev.map(acc => acc.id === id ? updatedAccount : acc));
      return updatedAccount;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await api.deleteAccount(id);
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  // CRUD operations for customers
  const addCustomer = async (customer: Omit<Customer, 'id' | 'created'>) => {
    try {
      const newCustomer = await api.createCustomer(customer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const updatedCustomer = await api.updateCustomer(id, updates);
      setCustomers(prev => prev.map(cust => cust.id === id ? updatedCustomer : cust));
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await api.deleteCustomer(id);
      setCustomers(prev => prev.filter(cust => cust.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  // CRUD operations for transactions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created'>) => {
    try {
      const newTransaction = await api.createTransaction(transaction);
      setTransactions(prev => [...prev, newTransaction]);
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  // CRUD operations for invoices
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'created'>) => {
    try {
      const newInvoice = await api.createInvoice(invoice);
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    } catch (error) {
      console.error('Error adding invoice:', error);
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const updatedInvoice = await api.updateInvoice(id, updates);
      setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
      return updatedInvoice;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await api.deleteInvoice(id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  };

  // Authentication functions
  const signUp = async (email: string, password: string) => {
    try {
      const result = await api.register(email, password, email.split('@')[0]);
      setUser(result.user);
      await fetchAllData();
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      setUser(result.user);
      await fetchAllData();
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      api.logout();
      setUser(null);
      setAccounts([]);
      setCustomers([]);
      setTransactions([]);
      setInvoices([]);
      setUAECustomers([]);
      setUAESuppliers([]);
      setDataInitialized(false);
    } catch (error) {
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
    
    // Status
    loading: api.loading,
    error: api.error,
    user,
    isOfflineMode: !api.isOnline,
    dataInitialized,
    
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
    retryConnection: () => fetchAllData()
  };
};