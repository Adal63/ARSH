// API configuration for connecting to AWS backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  async register(email: string, password: string, name: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic CRUD methods
  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload method
  async uploadFile(file: File, endpoint: string = '/upload/single') {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(endpoint, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  async uploadFiles(files: File[], endpoint: string = '/upload/multiple') {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    return this.request(endpoint, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  // Specific API methods for your app modules
  
  // Accounts
  async getAccounts() {
    return this.get('/accounts');
  }

  async createAccount(account: any) {
    return this.post('/accounts', account);
  }

  async updateAccount(id: string, account: any) {
    return this.put(`/accounts/${id}`, account);
  }

  async deleteAccount(id: string) {
    return this.delete(`/accounts/${id}`);
  }

  // Customers
  async getCustomers() {
    return this.get('/customers');
  }

  async createCustomer(customer: any) {
    return this.post('/customers', customer);
  }

  async updateCustomer(id: string, customer: any) {
    return this.put(`/customers/${id}`, customer);
  }

  async deleteCustomer(id: string) {
    return this.delete(`/customers/${id}`);
  }

  // Invoices
  async getInvoices() {
    return this.get('/invoices');
  }

  async createInvoice(invoice: any) {
    return this.post('/invoices', invoice);
  }

  async updateInvoice(id: string, invoice: any) {
    return this.put(`/invoices/${id}`, invoice);
  }

  async deleteInvoice(id: string) {
    return this.delete(`/invoices/${id}`);
  }

  // Transactions
  async getTransactions() {
    return this.get('/transactions');
  }

  async createTransaction(transaction: any) {
    return this.post('/transactions', transaction);
  }

  // UAE Customers
  async getUAECustomers() {
    return this.get('/uae-customers');
  }

  async createUAECustomer(customer: any) {
    return this.post('/uae-customers', customer);
  }

  async updateUAECustomer(id: string, customer: any) {
    return this.put(`/uae-customers/${id}`, customer);
  }

  async deleteUAECustomer(id: string) {
    return this.delete(`/uae-customers/${id}`);
  }

  // UAE Suppliers
  async getUAESuppliers() {
    return this.get('/uae-suppliers');
  }

  async createUAESupplier(supplier: any) {
    return this.post('/uae-suppliers', supplier);
  }

  async updateUAESupplier(id: string, supplier: any) {
    return this.put(`/uae-suppliers/${id}`, supplier);
  }

  async deleteUAESupplier(id: string) {
    return this.delete(`/uae-suppliers/${id}`);
  }

  // Inventory
  async getInventoryItems() {
    return this.get('/inventory');
  }

  async createInventoryItem(item: any) {
    return this.post('/inventory', item);
  }

  async updateInventoryItem(id: string, item: any) {
    return this.put(`/inventory/${id}`, item);
  }

  async deleteInventoryItem(id: string) {
    return this.delete(`/inventory/${id}`);
  }

  // Receipts
  async getReceipts() {
    return this.get('/receipts');
  }

  async createReceipt(receipt: any) {
    return this.post('/receipts', receipt);
  }

  // Payments
  async getPayments() {
    return this.get('/payments');
  }

  async createPayment(payment: any) {
    return this.post('/payments', payment);
  }

  // Bank Management
  async getBankAccounts() {
    return this.get('/bank/accounts');
  }

  async createBankAccount(account: any) {
    return this.post('/bank/accounts', account);
  }

  async getBankTransactions() {
    return this.get('/bank/transactions');
  }

  async createBankTransaction(transaction: any) {
    return this.post('/bank/transactions', transaction);
  }

  // Cash Book
  async getCashBookEntries() {
    return this.get('/cash-book');
  }

  async createCashBookEntry(entry: any) {
    return this.post('/cash-book', entry);
  }

  // Inter-Account Transfers
  async getTransfers() {
    return this.get('/transfers');
  }

  async createTransfer(transfer: any) {
    return this.post('/transfers', transfer);
  }

  // Sales Quotations
  async getSalesQuotations() {
    return this.get('/sales-quotations');
  }

  async createSalesQuotation(quotation: any) {
    return this.post('/sales-quotations', quotation);
  }

  // Purchase Invoices
  async getPurchaseInvoices() {
    return this.get('/purchase-invoices');
  }

  async createPurchaseInvoice(invoice: any) {
    return this.post('/purchase-invoices', invoice);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;