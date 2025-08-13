import { useState, useEffect } from 'react';
import { Account, Customer, Transaction, Invoice, KPI, AIInsight, UAECustomer, UAESupplier } from '../types';
import { mockKPIs, mockAIInsights, mockAccounts, mockCustomers, mockTransactions, mockInvoices } from '../data/mockData';

export const useAccounting = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [kpis, setKPIs] = useState<KPI[]>(mockKPIs);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(mockAIInsights);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock functions for CRUD operations
  const addAccount = async (account: Omit<Account, 'id'>) => {
    const newAccount = { ...account, id: Date.now().toString() };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount;
  };

  const updateAccount = async (id: string, account: Partial<Account>) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...account } : acc));
  };

  const deleteAccount = async (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: Date.now().toString() };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(cust => cust.id === id ? { ...cust, ...customer } : cust));
  };

  const deleteCustomer = async (id: string) => {
    setCustomers(prev => prev.filter(cust => cust.id !== id));
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: Date.now().toString() };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...invoice } : inv));
  };

  const deleteInvoice = async (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // Calculate totals
  const getTotalAssets = () => {
    return accounts.filter(acc => acc.type === 'Asset').reduce((sum, acc) => sum + (acc.balance || 0), 0);
  };

  const getTotalLiabilities = () => {
    return accounts.filter(acc => acc.type === 'Liability').reduce((sum, acc) => sum + (acc.balance || 0), 0);
  };

  const getTotalEquity = () => {
    return getTotalAssets() - getTotalLiabilities();
  };

  const getTotalRevenue = () => {
    return accounts.filter(acc => acc.type === 'Revenue').reduce((sum, acc) => sum + (acc.balance || 0), 0);
  };

  const getTotalExpenses = () => {
    return accounts.filter(acc => acc.type === 'Expense').reduce((sum, acc) => sum + (acc.balance || 0), 0);
  };

  const getNetIncome = () => {
    return getTotalRevenue() - getTotalExpenses();
  };

  // Update KPIs based on current data
  useEffect(() => {
    if (accounts.length > 0) {
      const updatedKPIs = [...mockKPIs];
      
      // Update Monthly Revenue KPI
      const revenueKPI = updatedKPIs.find(kpi => kpi.name === 'Monthly Revenue');
      if (revenueKPI) {
        revenueKPI.value = getTotalRevenue();
        revenueKPI.change = ((revenueKPI.value / revenueKPI.target) * 100) - 100;
        revenueKPI.trend = revenueKPI.change >= 0 ? 'up' : 'down';
      }

      setKPIs(updatedKPIs);
    }
  }, [accounts]);

  return {
    accounts,
    customers,
    transactions,
    invoices,
    uaeCustomers: [] as UAECustomer[],
    uaeSuppliers: [] as UAESupplier[],
    kpis,
    aiInsights,
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
    getTotalAssets,
    getTotalLiabilities,
    getTotalEquity,
    getTotalRevenue,
    getTotalExpenses,
    getNetIncome,
    loading,
    error,
    isOfflineMode: false
  };
};
