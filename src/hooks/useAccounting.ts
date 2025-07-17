import { useState } from 'react';
import { Account, Customer, Transaction, Invoice, KPI, AIInsight, UAECustomer, UAESupplier } from '../types';
import { mockKPIs, mockAIInsights, mockAccounts, mockCustomers, mockTransactions, mockInvoices } from '../data/mockData';
import { useSupabaseContext } from '../App';

export const useAccounting = () => {
  const {
    accounts,
    customers,
    transactions,
    invoices,
    uaeCustomers,
    uaeSuppliers,
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
    error
  } = useSupabaseContext();
  
  const [kpis, setKPIs] = useState<KPI[]>(mockKPIs);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(mockAIInsights);

  // Use mock data if there's an error or no data from Supabase
  const effectiveAccounts = accounts.length > 0 ? accounts : mockAccounts;
  const effectiveCustomers = customers.length > 0 ? customers : mockCustomers;
  const effectiveTransactions = transactions.length > 0 ? transactions : mockTransactions;
  const effectiveInvoices = invoices.length > 0 ? invoices : mockInvoices;

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
    error
  };
};