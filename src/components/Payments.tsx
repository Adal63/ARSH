import React, { useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { Plus, Edit2, Trash2, Search, Download, Eye, DollarSign, CreditCard, Banknote, FileCheck, Building } from 'lucide-react';
import { Payment } from '../types';

const Payments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');

  // Mock suppliers/vendors data
  const suppliers = [
    { id: '1', name: 'Pirelli UAE', company: 'Pirelli Tyre Trading LLC' },
    { id: '2', name: 'ExxonMobil', company: 'ExxonMobil Lubricants' },
    { id: '3', name: 'BMW Parts', company: 'BMW Parts & Accessories' }
  ];

  // Mock payments data
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      paymentNumber: 'PAY-2024-001',
      supplierId: '1',
      amount: 50000,
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: 'TXN987654321',
      date: new Date('2024-01-15'),
      description: 'Payment for tire purchase - PO-2024-001',
      status: 'CLEARED',
      bankAccount: 'Emirates Islamic Bank - 3708440789901',
      approvedBy: 'Manager',
      created: new Date('2024-01-15'),
      createdBy: 'Admin'
    },
    {
      id: '2',
      paymentNumber: 'PAY-2024-002',
      supplierId: '2',
      amount: 15000,
      paymentMethod: 'CHEQUE',
      paymentReference: 'CHQ002345',
      chequeNumber: '002345',
      chequeDate: new Date('2024-01-16'),
      date: new Date('2024-01-16'),
      description: 'Payment for lubricants supply',
      status: 'PENDING',
      bankAccount: 'ADCB - 1234567890',
      approvedBy: 'Manager',
      created: new Date('2024-01-16'),
      createdBy: 'Admin'
    },
    {
      id: '3',
      paymentNumber: 'PAY-2024-003',
      supplierId: '3',
      amount: 8500,
      paymentMethod: 'CASH',
      date: new Date('2024-01-17'),
      description: 'Cash payment for spare parts',
      status: 'CLEARED',
      approvedBy: 'Supervisor',
      created: new Date('2024-01-17'),
      createdBy: 'Cashier'
    }
  ]);

  const [formData, setFormData] = useState({
    supplierId: '',
    vendorId: '',
    billId: '',
    amount: 0,
    paymentMethod: 'CASH' as const,
    paymentReference: '',
    description: '',
    bankAccount: '',
    chequeNumber: '',
    chequeDate: '',
    approvedBy: ''
  });

  const filteredPayments = payments.filter(payment => {
    const supplier = suppliers.find(s => s.id === payment.supplierId);
    const supplierName = supplier?.name || '';
    
    const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'All' || payment.paymentMethod === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayment: Payment = {
      ...formData,
      id: Date.now().toString(),
      paymentNumber: `PAY-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}`,
      date: new Date(),
      status: 'PENDING',
      created: new Date(),
      createdBy: 'Current User',
      chequeDate: formData.chequeDate ? new Date(formData.chequeDate) : undefined
    };
    setPayments([...payments, newPayment]);
    setFormData({
      supplierId: '',
      vendorId: '',
      billId: '',
      amount: 0,
      paymentMethod: 'CASH',
      paymentReference: '',
      description: '',
      bankAccount: '',
      chequeNumber: '',
      chequeDate: '',
      approvedBy: ''
    });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      setPayments(payments.filter(p => p.id !== id));
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
      case 'BANK_TRANSFER': return Building;
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

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const clearedAmount = filteredPayments.filter(p => p.status === 'CLEARED').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = filteredPayments.filter(p => p.status === 'PENDING').reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Payments Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Payments</p>
              <p className="text-2xl font-bold text-white">{filteredPayments.length}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-red-400">AED {totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-400" />
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
            placeholder="Search payments..."
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

      {/* Payments Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Approved By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPayments.map((payment) => {
                const supplier = suppliers.find(s => s.id === payment.supplierId);
                const PaymentIcon = getPaymentMethodIcon(payment.paymentMethod);
                const paymentColor = getPaymentMethodColor(payment.paymentMethod);
                
                return (
                  <tr key={payment.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {payment.paymentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {supplier?.name || 'Unknown Supplier'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {payment.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-400">
                      AED {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`flex items-center ${paymentColor}`}>
                        <PaymentIcon className="w-4 h-4 mr-2" />
                        {payment.paymentMethod.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {payment.approvedBy}
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
                          onClick={() => handleDelete(payment.id)}
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

      {/* Add Payment Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Add New Payment</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} - {supplier.company}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bill/Invoice ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.billId}
                    onChange={(e) => setFormData({ ...formData, billId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Related bill or invoice number"
                  />
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Approved By</label>
                  <input
                    type="text"
                    value={formData.approvedBy}
                    onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Approver name"
                  />
                </div>
                
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;