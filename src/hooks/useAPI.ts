import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const executeRequest = async (requestFn: () => Promise<any>) => {
    if (!isOnline) {
      setError('No internet connection. Please check your network.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await requestFn();
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Authentication methods
  const login = async (email: string, password: string) => {
    return executeRequest(() => apiClient.login(email, password));
  };

  const register = async (email: string, password: string, name: string) => {
    return executeRequest(() => apiClient.register(email, password, name));
  };

  const logout = () => {
    apiClient.logout();
  };

  const getCurrentUser = async () => {
    return executeRequest(() => apiClient.getCurrentUser());
  };

  // Accounts
  const getAccounts = async () => {
    return executeRequest(() => apiClient.getAccounts());
  };

  const createAccount = async (account: any) => {
    return executeRequest(() => apiClient.createAccount(account));
  };

  const updateAccount = async (id: string, account: any) => {
    return executeRequest(() => apiClient.updateAccount(id, account));
  };

  const deleteAccount = async (id: string) => {
    return executeRequest(() => apiClient.deleteAccount(id));
  };

  // Customers
  const getCustomers = async () => {
    return executeRequest(() => apiClient.getCustomers());
  };

  const createCustomer = async (customer: any) => {
    return executeRequest(() => apiClient.createCustomer(customer));
  };

  const updateCustomer = async (id: string, customer: any) => {
    return executeRequest(() => apiClient.updateCustomer(id, customer));
  };

  const deleteCustomer = async (id: string) => {
    return executeRequest(() => apiClient.deleteCustomer(id));
  };

  // Invoices
  const getInvoices = async () => {
    return executeRequest(() => apiClient.getInvoices());
  };

  const createInvoice = async (invoice: any) => {
    return executeRequest(() => apiClient.createInvoice(invoice));
  };

  const updateInvoice = async (id: string, invoice: any) => {
    return executeRequest(() => apiClient.updateInvoice(id, invoice));
  };

  const deleteInvoice = async (id: string) => {
    return executeRequest(() => apiClient.deleteInvoice(id));
  };

  // File upload
  const uploadFile = async (file: File) => {
    return executeRequest(() => apiClient.uploadFile(file));
  };

  const uploadFiles = async (files: File[]) => {
    return executeRequest(() => apiClient.uploadFiles(files));
  };

  return {
    loading,
    error,
    isOnline,
    // Auth
    login,
    register,
    logout,
    getCurrentUser,
    // Accounts
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    // Customers
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    // Invoices
    getInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    // File upload
    uploadFile,
    uploadFiles,
  };
};