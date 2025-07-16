import React, { useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { Plus, Edit2, Trash2, Search, Download, Eye, DollarSign, CreditCard, Banknote, FileCheck } from 'lucide-react';
import { Receipt } from '../types';

const Receipts: React.FC = () => {
  const { customers, invoices } = useAccounting();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');

  // Mock receipts data - in real app, this would come from useAccounting hook
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: '1',
      receiptNumber: 'RCP-2024-001',
      customerId: '1',
      invoiceId: '1',
      amount: 5000,
      paymentMethod: 'CARD',
      paymentReference: 'TXN123456789',
      date: new Date('2024-01-15'),
      description: 'Payment for Invoice INV-2024-001',
      status: 'CLEARED',
      bankAccount: 'Emirates Islamic Bank - 3708440789901',
      created: new Date('2024-01-15'),
      createdBy: 'Admin'
    },
    {
      id: '2',
      receiptNumber: 'RCP-2024-002',
      customerId: '2',
      amount: 3500,
      paymentMethod: 'CASH',
      date: new Date('2024-01-16'),
      description: 'Cash payment for services',
      status: 'CLEARED',
      created: new Date('2024-01-16'),
      createdBy: 'Cashier'
    },
    {
      id: '3',
      receiptNumber: 'RCP-2024-003',
      customerId: '1',
      amount: 2500,
      paymentMethod: 'CHEQUE',
      paymentReference: 'CHQ001234',
      chequeNumber: '001234',
      chequeDate: new Date('2024-01-17'),
      date: new Date('2024-01-17'),
      description: 'Cheque payment',
      status: 'PENDING',
      bankAccount: 'ADCB - 1234567890',
      created: new Date('2024-01-17'),
      createdBy: 'Admin'
    }
  ]);

  const [formData, setFormData] = useState({
    customerId: '',
    invoiceId: '',
    amount: 0,
    paymentMethod: 'CASH' as const,
    paymentReference: '',
    description: '',
    bankAccount: '',
    chequeNumber: '',
    chequeDate: ''
  });

  const filteredReceipts = receipts.filter(receipt => {
    const customer = customers.find(c => c.id === receipt.customerId);
    const customerName = customer?.name || '';
    
    const matchesSearch = receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || receipt.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'All' || receipt.paymentMethod === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReceipt: Receipt = {
      ...formData,
      id: Date.now().toString(),
      receiptNumber: `RCP-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(3, '0')}`,
      date: new Date(),
      status: 'PENDING',
      created: new Date(),
      createdBy: 'Current User',
      chequeDate: formData.chequeDate ? new Date(formData.chequeDate) : undefined
    };
    setReceipts([...receipts, newReceipt]);
    setFormData({
      customerId: '',
      invoiceId: '',
      amount: 0,
      paymentMethod: 'CASH',
      paymentReference: '',
      description: '',
      bankAccount: '',
      chequeNumber: '',
      chequeDate: ''
    });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      setReceipts(receipts.filter(r => r.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED': return 'bg-green-900 text-green-300';
      case 'PENDING': return 'bg-yellow-900 text-yellow-300';
      case 'BOUNCED': return 'bg-red-900 text-red-300';
      case 'CANCELLED': return 'bg-gray-900 text-gray-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return Banknote;
      case 'CARD': return CreditCard;
      case 'BANK_TRANSFER': return DollarSign;
      case 'CHEQUE': return FileCheck;
      default: return DollarSign;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'CASH': return 'text-green-400';
      case 'CARD': return 'text-blue-400';
      case 'BANK_TRANSFER': return 'text-purple-400';
      case 'CHEQUE': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const clearedAmount = filteredReceipts.filter(r => r.status === 'CLEARED').reduce((sum, receipt) => sum + receipt.amount, 0);
  const pendingAmount = filteredReceipts.filter(r => r.status === 'PENDING').reduce((sum, receipt) => sum + receipt.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Receipts Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Receipt
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Receipts</p>
              <p className="text-2xl font-bold text-white">{filteredReceipts.length}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-green-400">AED {totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cleared</p>
              <p className="text-2xl font-bold text-green-400">AED {clearedAmount.toLocaleString()}</p>
            </div>
            <FileCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">AED {pendingAmount.toLocaleString()}</p>
            </div>
            <FileCheck className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search receipts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CLEARED">Cleared</option>
          <option value="BOUNCED">Bounced</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CHEQUE">Cheque</option>
          <option value="ONLINE">Online</option>
        </select>
      </div>

      {/* Receipts Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredReceipts.map((receipt) => {
                const customer = customers.find(c => c.id === receipt.customerId);
                const PaymentIcon = getPaymentMethodIcon(receipt.paymentMethod);
                const paymentColor = getPaymentMethodColor(receipt.paymentMethod);
                
                return (
                  <tr key={receipt.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {receipt.receiptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {customer?.name || 'Unknown Customer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {receipt.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                      AED {receipt.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`flex items-center ${paymentColor}`}>
                        <PaymentIcon className="w-4 h-4 mr-2" />
                        {receipt.paymentMethod.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(receipt.status)}`}>
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-400 hover:text-green-300 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="text-purple-400 hover:text-purple-300 transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(receipt.id)}
                          className="text-red-400 hover:text-red-300 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Receipt Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Add New Receipt</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Customer *</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.company}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Invoice (Optional)</label>
                  <select
                    value={formData.invoiceId}
                    onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Invoice</option>
                    {invoices.filter(inv => inv.customerId === formData.customerId).map(invoice => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - AED {invoice.total}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Amount (AED) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>
                
                {(formData.paymentMethod === 'CARD' || formData.paymentMethod === 'BANK_TRANSFER' || formData.paymentMethod === 'ONLINE') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Payment Reference</label>
                    <input
                      type="text"
                      value={formData.paymentReference}
                      onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Transaction ID / Reference Number"
                    />
                  </div>
                )}
                
                {(formData.paymentMethod === 'BANK_TRANSFER' || formData.paymentMethod === 'CHEQUE') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bank Account</label>
                    <input
                      type="text"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bank Name - Account Number"
                    />
                  </div>
                )}
                
                {formData.paymentMethod === 'CHEQUE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Cheque Number</label>
                      <input
                        type="text"
                        value={formData.chequeNumber}
                        onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Cheque Date</label>
                      <input
                        type="date"
                        value={formData.chequeDate}
                        onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Payment description or notes"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;