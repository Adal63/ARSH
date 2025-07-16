import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, Calendar, User, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { SalesQuotation, QuotationItem } from '../types';

const SalesQuotations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<SalesQuotation | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED'>('ALL');

  // Mock customers data
  const customers = [
    { id: '1', name: 'Al Futtaim Group', trn: '100123456700003' },
    { id: '2', name: 'Saudi Aramco', trn: '300987654321001' }
  ];

  // Mock quotations data
  const [quotations, setQuotations] = useState<SalesQuotation[]>([
    {
      id: '1',
      quotationNumber: 'SQ-2024-001',
      quotationDate: new Date('2024-01-15'),
      validityDate: new Date('2024-02-15'),
      customerId: '1',
      customerTRN: '100123456700003',
      items: [
        {
          id: '1',
          description: 'BMW Engine Oil Change Service',
          quantity: 1,
          rate: 250,
          discount: 0,
          vatRate: 5,
          vatTreatment: 'STANDARD_RATED',
          amount: 250,
          vatAmount: 12.5,
          totalAmount: 262.5
        }
      ],
      subtotal: 250,
      vatAmount: 12.5,
      totalAmount: 262.5,
      status: 'PENDING',
      notes: 'Premium service package for BMW vehicles',
      terms: 'Valid for 30 days. Payment terms: Net 30',
      created: new Date('2024-01-15'),
      createdBy: 'Sales Team'
    }
  ]);

  const [formData, setFormData] = useState({
    customerId: '',
    quotationDate: new Date().toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: 'Valid for 30 days. Payment terms as per agreement.'
  });

  const [items, setItems] = useState<QuotationItem[]>([
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

  const filteredQuotations = quotations.filter(quotation => {
    const customer = customers.find(c => c.id === quotation.customerId);
    const customerName = customer?.name || '';
    
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const addItem = () => {
    const newItem: QuotationItem = {
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

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amounts
        if (field === 'quantity' || field === 'rate' || field === 'discount' || field === 'vatRate') {
          const baseAmount = updatedItem.quantity * updatedItem.rate;
          updatedItem.amount = baseAmount - updatedItem.discount;
          updatedItem.vatAmount = (updatedItem.amount * updatedItem.vatRate) / 100;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;

    const quotationData: SalesQuotation = {
      id: editingQuotation?.id || Date.now().toString(),
      quotationNumber: editingQuotation?.quotationNumber || `SQ-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      quotationDate: new Date(formData.quotationDate),
      validityDate: new Date(formData.validityDate),
      customerId: formData.customerId,
      customerTRN: customer.trn,
      items: items.filter(item => item.description.trim() !== ''),
      subtotal: getSubtotal(),
      vatAmount: getVATAmount(),
      totalAmount: getTotalAmount(),
      status: 'PENDING',
      notes: formData.notes,
      terms: formData.terms,
      created: editingQuotation?.created || new Date(),
      createdBy: 'Current User'
    };

    if (editingQuotation) {
      setQuotations(quotations.map(q => q.id === editingQuotation.id ? quotationData : q));
    } else {
      setQuotations([...quotations, quotationData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      quotationDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      terms: 'Valid for 30 days. Payment terms as per agreement.'
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
    setEditingQuotation(null);
  };

  const handleEdit = (quotation: SalesQuotation) => {
    setEditingQuotation(quotation);
    setFormData({
      customerId: quotation.customerId,
      quotationDate: quotation.quotationDate.toISOString().split('T')[0],
      validityDate: quotation.validityDate.toISOString().split('T')[0],
      notes: quotation.notes || '',
      terms: quotation.terms || ''
    });
    setItems(quotation.items);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      setQuotations(quotations.filter(q => q.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONVERTED': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return Clock;
      case 'CONVERTED': return CheckCircle;
      case 'EXPIRED': return XCircle;
      case 'CANCELLED': return XCircle;
      default: return Clock;
    }
  };

  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'PENDING').length,
    converted: quotations.filter(q => q.status === 'CONVERTED').length,
    expired: quotations.filter(q => q.status === 'EXPIRED').length,
    totalValue: quotations.reduce((sum, q) => sum + q.totalAmount, 0)
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🇦🇪 Sales Quotations</h1>
          <p className="text-gray-400 mt-1">VAT-compliant sales quotations with customer management</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Quotation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Quotations</p>
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
              <p className="text-gray-400 text-sm">Converted</p>
              <p className="text-2xl font-bold text-green-400">{stats.converted}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Expired</p>
              <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-green-400">AED {stats.totalValue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search quotations or customers..."
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
          <option value="CONVERTED">Converted</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Quotations Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quotation #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valid Until</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredQuotations.map((quotation) => {
                const customer = customers.find(c => c.id === quotation.customerId);
                const StatusIcon = getStatusIcon(quotation.status);
                const isExpired = new Date() > quotation.validityDate;
                
                return (
                  <tr key={quotation.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-400 mr-3" />
                        <span className="text-sm font-medium text-white">{quotation.quotationNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-white">{customer?.name}</div>
                          <div className="text-sm text-gray-400">TRN: {quotation.customerTRN}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {quotation.quotationDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center text-sm ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {quotation.validityDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-green-400">AED {quotation.totalAmount.toFixed(2)}</div>
                        <div className="text-gray-400">VAT: AED {quotation.vatAmount.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <StatusIcon className="w-4 h-4 mr-2" />
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(quotation.status)}`}>
                          {quotation.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(quotation)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit Quotation"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quotation.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Quotation"
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
                {editingQuotation ? 'Edit Sales Quotation' : 'Create Sales Quotation'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          {customer.name} (TRN: {customer.trn})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quotation Date *</label>
                    <input
                      type="date"
                      value={formData.quotationDate}
                      onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Valid Until *</label>
                    <input
                      type="date"
                      value={formData.validityDate}
                      onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Quotation Items</h4>
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
                        <div className="md:col-span-4">
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
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-300 mb-1">VAT%</label>
                          <select
                            value={item.vatRate}
                            onChange={(e) => updateItem(item.id, 'vatRate', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <p className="text-2xl font-bold text-green-400">AED {getTotalAmount().toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes for the quotation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Terms & Conditions</label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Terms and conditions"
                  />
                </div>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingQuotation ? 'Update' : 'Create'} Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesQuotations;