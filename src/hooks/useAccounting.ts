import { useState, useEffect } from 'react';
import { Account, Customer, Transaction, Invoice, KPI, AIInsight } from '../types';
import { 
  mockAccounts, 
  mockCustomers, 
  mockTransactions, 
  mockInvoices, 
  mockKPIs, 
  mockAIInsights 
} from '../data/mockData';

export const useAccounting = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [kpis, setKPIs] = useState<KPI[]>(mockKPIs);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(mockAIInsights);

  // Account management
  const addAccount = (account: Omit<Account, 'id' | 'created'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      created: new Date()
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    ));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  // Customer management
  const addCustomer = (customer: Omit<Customer, 'id' | 'created'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      created: new Date()
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer; // Return the created customer
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(cust => 
      cust.id === id ? { ...cust, ...updates } : cust
    ));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(cust => cust.id !== id));
  };

  // Transaction management
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'created'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      created: new Date()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  // Invoice management
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'created'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      created: new Date()
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, ...updates } : inv
    ));
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
    accounts,
    customers,
    transactions,
    invoices,
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
    getTotalAssets,
    getTotalLiabilities,
    getTotalEquity,
    getTotalRevenue,
    getTotalExpenses,
    getNetIncome
  };
};