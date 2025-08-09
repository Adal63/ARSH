import { useState, useEffect } from 'react';
import { Account, Customer, Transaction, Invoice, KPI, AIInsight, UAECustomer, UAESupplier } from '../types';
import { mockKPIs, mockAIInsights, mockAccounts, mockCustomers, mockTransactions, mockInvoices } from '../data/mockData';

export const useAccounting = () => {
  // For now, we'll use mock data until API integration is complete
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock functions for now
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

  // Rest of your existing code stays the same...
  return {
    accounts,
    customers,
    transactions,
    invoices,
    uaeCustomers: [], // Empty for now
    uaeSuppliers: [], // Empty for now
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
  
  const [kpis, setKPIs] = useState<KPI[]>(mockKPIs);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(mockAIInsights);

  // Use mock data if there's an error or no data from Supabase
  const effectiveAccounts = accounts.length > 0 ? accounts : mockAccounts;
  const effectiveCustomers = customers.length > 0 ? customers : mockCustomers;
  const effectiveTransactions = transactions.length > 0 ? transactions : mockTransactions;
  const effectiveInvoices = invoices.length > 0 ? invoices : mockInvoices;

  // Update KPIs based on current data
  useEffect(() => {
    if (effectiveAccounts.length > 0) {
      // Update KPIs based on actual data
      const updatedKPIs = [...mockKPIs];
      
      // Update Monthly Revenue KPI
      const revenueKPI = updatedKPIs.find(kpi => kpi.name === 'Monthly Revenue');
      if (revenueKPI) {
        revenueKPI.value = getTotalRevenue();
        revenueKPI.change = ((revenueKPI.value / revenueKPI.target) * 100) - 100;
        revenueKPI.trend = revenueKPI.change >= 0 ? 'up' : 'down';
      }
      
      // Update Gross Margin KPI
      const marginKPI = updatedKPIs.find(kpi => kpi.name === 'Gross Margin');
      if (marginKPI) {
        const revenue = getTotalRevenue();
        const expenses = getTotalExpenses();
        if (revenue > 0) {
          marginKPI.value = ((revenue - expenses) / revenue) * 100;
          marginKPI.change = ((marginKPI.value / marginKPI.target) * 100) - 100;
          marginKPI.trend = marginKPI.change >= 0 ? 'up' : 'down';
        }
      }
      
      // Update Cash Flow KPI
      const cashFlowKPI = updatedKPIs.find(kpi => kpi.name === 'Cash Flow');
      if (cashFlowKPI) {
        const cashAccounts = effectiveAccounts.filter(acc => 
          acc.type === 'Asset' && 
          (acc.name.toLowerCase().includes('cash') || acc.name.toLowerCase().includes('bank'))
        );
        cashFlowKPI.value = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        cashFlowKPI.change = ((cashFlowKPI.value / cashFlowKPI.target) * 100) - 100;
        cashFlowKPI.trend = cashFlowKPI.change >= 0 ? 'up' : 'down';
      }
      
      setKPIs(updatedKPIs);
    }
  }, [effectiveAccounts, getTotalRevenue, getTotalExpenses]);

  // Update AI Insights based on current data
  useEffect(() => {
    if (effectiveAccounts.length > 0 && effectiveInvoices.length > 0) {
      // Generate insights based on actual data
      const updatedInsights = [...mockAIInsights];
      
      // Check for overdue invoices
      const overdueInvoices = effectiveInvoices.filter(inv => 
        inv.status === 'pending' && new Date(inv.dueDate) < new Date()
      );
      
      if (overdueInvoices.length > 0) {
        // Add or update overdue invoice insight
        const overdueIndex = updatedInsights.findIndex(insight => 
          insight.title.includes('Accounts Receivable Alert')
        );
        
        if (overdueIndex >= 0) {
          updatedInsights[overdueIndex] = {
            ...updatedInsights[overdueIndex],
            description: `You have ${overdueInvoices.length} overdue invoice(s). The oldest is invoice ${overdueInvoices[0].invoiceNumber} which was due on ${new Date(overdueInvoices[0].dueDate).toLocaleDateString()}.`,
            created: new Date()
          };
        } else {
          updatedInsights.push({
            id: Date.now().toString(),
            title: 'Accounts Receivable Alert',
            description: `You have ${overdueInvoices.length} overdue invoice(s). The oldest is invoice ${overdueInvoices[0].invoiceNumber} which was due on ${new Date(overdueInvoices[0].dueDate).toLocaleDateString()}.`,
            type: 'warning',
            priority: 'high',
            created: new Date(),
            category: 'Collections'
          });
        }
      }
      
      setAIInsights(updatedInsights);
    }
  }, [effectiveAccounts, effectiveInvoices]);

  return {
    accounts: effectiveAccounts,
    customers: effectiveCustomers,
    transactions: effectiveTransactions,
    invoices: effectiveInvoices,
    uaeCustomers,
    uaeSuppliers,
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
    isOfflineMode
  };
};
