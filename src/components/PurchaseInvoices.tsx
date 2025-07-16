import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, Calendar, Building, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { PurchaseInvoice, PurchaseInvoiceItem } from '../types';

const PurchaseInvoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<PurchaseInvoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID'>('ALL');

  // Mock suppliers data
  const suppliers = [
    { id: '1', name: 'Emirates Steel Arkan', trn: '100234567800003' },
    { id: '2', name: 'Caterpillar Middle East', trn: '100345678900003' }
  ];

  // Mock purchase invoices data
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([
    {
      id: '1',
      invoiceNumber: 'PI-2024-001',
      invoiceDate: new Date('2024-01-15'),
      supplierId: '1',
      supplierTRN: '100234567800003',
      items: [
        {
          id: '1',
          description: 'Steel Rods - Grade A',
          quantity: 100,
          rate: 50,
          discount: 0,
          vatRate: 5,
          vatTreatment: 'STANDARD_RATED',
          amount: 5000,
          vatAmount: 250,
          totalAmount: 5250
        }
      ],
      subtotal: 5000,
      vatAmount: 250,
      totalAmount: 5250,
      inputVATRecoverable: 250,
      reverseChargeApplicable: false,
      status: 'APPROVED',
      paymentDueDate: new Date('2024-02-15'),
      notes: 'Monthly steel supply order',
      created: new Date('2024-01-15'),
      createdBy: 'Procurement Team'
    }
  ]);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reverseChargeApplicable: false,
    notes: ''
  });

  const [items, setItems] = useState<PurchaseInvoiceItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      vatRate: 5,
      vatTreatment: 'STANDARD_RATED',
      amount: 0,
      vatAmount: 0,
      totalAmount: 0
    }
  ]);

  const filteredInvoices = purchaseInvoices.filter(invoice => {
    const supplier = suppliers.find(s => s.id === invoice.supplierId);
    const supplierName = supplier?.name || '';
    
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const addItem = () => {
    const newItem: PurchaseInvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      vatRate: 5,
      vatTreatment: 'STANDARD_RATED',
      amount: 0,
      vatAmount: 0,
      totalAmount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof PurchaseInvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amounts
        if (field === 'quantity' || field === 'rate' || field === 'discount' || field === 'vatRate' || field === 'vatTreatment') {
          const baseAmount = updatedItem.quantity * updatedItem.rate;
          updatedItem.amount = baseAmount - updatedItem.discount;
          
          if (updatedItem.vatTreatment === 'REVERSE_CHARGE') {
            updatedItem.vatAmount = 0; // No VAT charged by supplier
          } else {
            updatedItem.vatAmount = (updatedItem.amount * updatedItem.vatRate) / 100;
          }
          
          updatedItem.totalAmount = updatedItem.amount + updatedItem.vatAmount;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const getSubtotal = () => items.reduce((sum, item) => sum + item.amount, 0);
  const getVATAmount = () => items.reduce((sum, item) => sum + item.vatAmount, 0);
  const getTotalAmount = () => items.reduce((sum, item) => sum + item.totalAmount, 0);
  const getInputVATRecoverable = () => items.reduce((sum, item) => {
    // Input VAT is recoverable for standard rated and reverse charge items
    if (item.vatTreatment === 'STANDARD_RATED' || item.vatTreatment === 'REVERSE_CHARGE') {
      return sum + (item.amount * 5) / 100; // 5% VAT rate
    }
    return sum;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplier = suppliers.find(s => s.id === formData.supplierId);
    if (!supplier) return;

    const invoiceData: PurchaseInvoice = {
      id: editingInvoice?.id || Date.now().toString(),
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: new Date(formData.invoiceDate),
      supplierId: formData.supplierId,
      supplierTRN: supplier.trn,
      items: items.filter(item => item.description.trim() !== ''),
      subtotal: getSubtotal(),
      vatAmount: getVATAmount(),
      totalAmount: getTotalAmount(),
      inputVATRecoverable: getInputVATRecoverable(),
      reverseChargeApplicable: formData.reverseChargeApplicable,
      status: 'PENDING',
      paymentDueDate: new Date(formData.paymentDueDate),
      notes: formData.notes,
      created: editingInvoice?.created || new Date(),
      createdBy: 'Current User'
    };

    if (editingInvoice) {
      setPurchaseInvoices(purchaseInvoices.map(pi => pi.id === editingInvoice.id ? invoiceData : pi));
    } else {
      setPurchaseInvoices([...purchaseInvoices, invoiceData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      supplierId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reverseChargeApplicable: false,
      notes: ''
    });
    setItems([{
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      vatRate: 5,
      vatTreatment: 'STANDARD_RATED',
      amount: 0,
      vatAmount: 0,
      totalAmount: 0
    }]);
    setShowAddForm(false);
    setEditingInvoice(null);
  };

  const handleEdit = (invoice: PurchaseInvoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      supplierId: invoice.supplierId,
      invoiceDate: invoice.invoiceDate.toISOString().split('T')[0],
      paymentDueDate: invoice.paymentDueDate.toISOString().split('T')[0],
      reverseChargeApplicable: invoice.reverseChargeApplicable,
      notes: invoice.notes || ''
    });
    setItems(invoice.items);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase invoice?')) {
      setPurchaseInvoices(purchaseInvoices.filter(pi => pi.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PAID': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return Clock;
      case 'APPROVED': return CheckCircle;
      case 'PAID': return CheckCircle;
      default: return Clock;
    }
  };

  const stats = {
    total: purchaseInvoices.length,
    pending: purchaseInvoices.filter(pi => pi.status === 'PENDING').length,
    approved: purchaseInvoices.filter(pi => pi.status === 'APPROVED').length,
    paid: purchaseInvoices.filter(pi => pi.status === 'PAID').length,
    totalValue: purchaseInvoices.reduce((sum, pi) => sum + pi.totalAmount, 0),
    inputVATRecoverable: purchaseInvoices.reduce((sum, pi) => sum + pi.inputVATRecoverable, 0)
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🇦🇪 Purchase Invoices</h1>
          <p className="text-gray-400 mt-1">VAT-compliant purchase invoices with input tax recovery</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Purchase Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Invoices</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Paid</p>
              <p className="text-2xl font-bold text-blue-400">{stats.paid}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-red-400">AED {stats.totalValue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Input VAT</p>
              <p className="text-2xl font-bold text-purple-400">AED {stats.inputVATRecoverable.toFixed(2)}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {/* Purchase Invoices Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Input VAT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredInvoices.map((invoice) => {
                const supplier = suppliers.find(s => s.id === invoice.supplierId);
                const StatusIcon = getStatusIcon(invoice.status);
                const isOverdue = new Date() > invoice.paymentDueDate && invoice.status !== 'PAID';
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-green-400 mr-3" />
                        <span className="text-sm font-medium text-white">{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-white">{supplier?.name}</div>
                          <div className="text-sm text-gray-400">TRN: {invoice.supplierTRN}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {invoice.invoiceDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center text-sm ${isOverdue ? 'text-red-400' : 'text-gray-300'}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {invoice.paymentDueDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-red-400">AED {invoice.totalAmount.toFixed(2)}</div>
                        <div className="text-gray-400">VAT: AED {invoice.vatAmount.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-purple-400">
                        AED {invoice.inputVATRecoverable.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <StatusIcon className="w-4 h-4 mr-2" />
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Invoice"
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

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {editingInvoice ? 'Edit Purchase Invoice' : 'Add Purchase Invoice'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Invoice Number *</label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="PI-2024-001"
                      required
                    />
                  </div>
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
                          {supplier.name} (TRN: {supplier.trn})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Invoice Date *</label>
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Payment Due Date *</label>
                    <input
                      type="date"
                      value={formData.paymentDueDate}
                      onChange={(e) => setFormData({ ...formData, paymentDueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.reverseChargeApplicable}
                      onChange={(e) => setFormData({ ...formData, reverseChargeApplicable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-300">Reverse Charge Applicable</span>
                  </label>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Invoice Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter item description"
                            required
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Rate (AED)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Disc.</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">VAT Treatment</label>
                          <select
                            value={item.vatTreatment}
                            onChange={(e) => updateItem(item.id, 'vatTreatment', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="STANDARD_RATED">Standard Rated (5%)</option>
                            <option value="ZERO_RATED">Zero Rated (0%)</option>
                            <option value="EXEMPT">Exempt</option>
                            <option value="REVERSE_CHARGE">Reverse Charge</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">Total (AED)</label>
                          <input
                            type="text"
                            value={item.totalAmount.toFixed(2)}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-1">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="w-full p-2 text-red-400 hover:text-red-300 transition-colors"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="bg-gray-700 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Subtotal</p>
                      <p className="text-xl font-bold text-white">AED {getSubtotal().toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">VAT Amount</p>
                      <p className="text-xl font-bold text-blue-400">AED {getVATAmount().toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Total Amount</p>
                      <p className="text-2xl font-bold text-red-400">AED {getTotalAmount().toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Input VAT Recoverable</p>
                      <p className="text-xl font-bold text-purple-400">AED {getInputVATRecoverable().toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes for the invoice"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {editingInvoice ? 'Update' : 'Add'} Purchase Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoices;