import React, { useState, useRef } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { UAEEInvoice, InvoiceItem } from '../types';
import { X, Plus, Trash2, QrCode, FileCheck, Download, Send } from 'lucide-react';

interface UAEEInvoiceFormProps {
  onClose: () => void;
  invoice?: UAEEInvoice | null;
}

const UAEEInvoiceForm: React.FC<UAEEInvoiceFormProps> = ({ onClose, invoice: editingInvoice }) => {
  const { customers, addInvoice } = useAccounting();
  
  const [formData, setFormData] = useState({
    customerId: editingInvoice?.customerId || '',
    date: editingInvoice?.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    dueDate: editingInvoice?.dueDate?.toISOString().split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoiceNumber: editingInvoice?.invoiceNumber || `UAE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    status: editingInvoice?.status || 'draft',
    // UAE E-Invoice specific fields
    uaeFields: {
      invoiceTypeCode: editingInvoice?.uaeFields?.invoiceTypeCode || '388',
      invoiceTypeSubCode: editingInvoice?.uaeFields?.invoiceTypeSubCode || '01',
      documentCurrencyCode: 'AED',
      taxCurrencyCode: 'AED',
      supplierTaxNumber: '100502938200003', // Your TRN
      customerTaxNumber: editingInvoice?.uaeFields?.customerTaxNumber || '',
      paymentMeansCode: editingInvoice?.uaeFields?.paymentMeansCode || '30',
      taxCategoryCode: editingInvoice?.uaeFields?.taxCategoryCode || 'S',
      taxPercent: editingInvoice?.uaeFields?.taxPercent || 5,
      invoiceNote: editingInvoice?.uaeFields?.invoiceNote || '',
      orderReference: editingInvoice?.uaeFields?.orderReference || '',
      contractReference: editingInvoice?.uaeFields?.contractReference || '',
      qrCode: editingInvoice?.uaeFields?.qrCode || '',
      uuid: editingInvoice?.uaeFields?.uuid || crypto.randomUUID(),
      submissionDateTime: editingInvoice?.uaeFields?.submissionDateTime || new Date(),
      clearanceStatus: editingInvoice?.uaeFields?.clearanceStatus || 'NOT_CLEARED',
      invoiceHash: editingInvoice?.uaeFields?.invoiceHash || '',
      ...editingInvoice?.uaeFields
    }
  });

  const [items, setItems] = useState<InvoiceItem[]>(
    editingInvoice?.items || [
      { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
    ]
  );

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const getVATAmount = () => {
    return (getSubtotal() * formData.uaeFields.taxPercent) / 100;
  };

  const getTotalAmount = () => {
    return getSubtotal() + getVATAmount();
  };

  const generateQRCode = () => {
    const qrData = {
      seller: "ASTER AUTO GARAGE",
      taxNumber: formData.uaeFields.supplierTaxNumber,
      invoiceDate: formData.date,
      totalAmount: getTotalAmount(),
      vatAmount: getVATAmount()
    };
    
    // In a real implementation, you would use a QR code library
    const qrString = btoa(JSON.stringify(qrData));
    setFormData({
      ...formData,
      uaeFields: {
        ...formData.uaeFields,
        qrCode: qrString
      }
    });
  };

  const generateInvoiceHash = () => {
    const hashData = {
      invoiceNumber: formData.invoiceNumber,
      date: formData.date,
      total: getTotalAmount(),
      uuid: formData.uaeFields.uuid
    };
    
    // In a real implementation, you would use proper cryptographic hashing
    const hash = btoa(JSON.stringify(hashData));
    setFormData({
      ...formData,
      uaeFields: {
        ...formData.uaeFields,
        invoiceHash: hash
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate QR code and hash before submission
    generateQRCode();
    generateInvoiceHash();
    
    const uaeInvoice: UAEEInvoice = {
      id: editingInvoice?.id || Date.now().toString(),
      invoiceNumber: formData.invoiceNumber,
      customerId: formData.customerId,
      date: new Date(formData.date),
      dueDate: new Date(formData.dueDate),
      total: getTotalAmount(),
      status: formData.status as any,
      items: items.filter(item => item.description.trim() !== ''),
      created: editingInvoice?.created || new Date(),
      uaeFields: {
        ...formData.uaeFields,
        submissionDateTime: new Date()
      }
    };

    addInvoice(uaeInvoice);
    onClose();
  };

  const invoiceTypes = [
    { code: '388', name: 'Tax Invoice' },
    { code: '381', name: 'Credit Note' },
    { code: '383', name: 'Debit Note' }
  ];

  const invoiceSubTypes = [
    { code: '01', name: 'Standard Invoice' },
    { code: '02', name: 'Simplified Invoice' }
  ];

  const paymentMethods = [
    { code: '10', name: 'Cash' },
    { code: '30', name: 'Credit Transfer' },
    { code: '48', name: 'Card Payment' },
    { code: '42', name: 'Cheque' }
  ];

  const taxCategories = [
    { code: 'S', name: 'Standard Rate (5%)' },
    { code: 'Z', name: 'Zero Rate (0%)' },
    { code: 'E', name: 'Exempt' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            UAE E-Invoice {editingInvoice ? '(Edit)' : '(Create)'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* UAE E-Invoice Header */}
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-4">🇦🇪 UAE FTA E-Invoice Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Invoice Type</label>
                  <select
                    value={formData.uaeFields.invoiceTypeCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      uaeFields: { ...formData.uaeFields, invoiceTypeCode: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {invoiceTypes.map(type => (
                      <option key={type.code} value={type.code}>{type.code} - {type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Invoice Sub-Type</label>
                  <select
                    value={formData.uaeFields.invoiceTypeSubCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      uaeFields: { ...formData.uaeFields, invoiceTypeSubCode: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {invoiceSubTypes.map(type => (
                      <option key={type.code} value={type.code}>{type.code} - {type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">UUID</label>
                  <input
                    type="text"
                    value={formData.uaeFields.uuid}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Basic Invoice Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                Basic Invoice Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Invoice Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Customer</label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Customer TRN (Optional)</label>
                  <input
                    type="text"
                    value={formData.uaeFields.customerTaxNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      uaeFields: { ...formData.uaeFields, customerTaxNumber: e.target.value }
                    })}
                    placeholder="Customer Tax Registration Number"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Tax & Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                Tax & Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                  <select
                    value={formData.uaeFields.paymentMeansCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      uaeFields: { ...formData.uaeFields, paymentMeansCode: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.code} value={method.code}>{method.code} - {method.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tax Category</label>
                  <select
                    value={formData.uaeFields.taxCategoryCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      uaeFields: { ...formData.uaeFields, taxCategoryCode: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {taxCategories.map(category => (
                      <option key={category.code} value={category.code}>{category.code} - {category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">VAT Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.uaeFields.taxPercent}
                    onChange={(e) => setFormData({
                      ...formData,
                      uaeFields: { ...formData.uaeFields, taxPercent: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Invoice Items</h3>
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
                      <div className="md:col-span-5">
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
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
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
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Amount (AED)</label>
                        <input
                          type="text"
                          value={item.amount.toFixed(2)}
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
            </div>

            {/* Totals */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Invoice Totals (AED)</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal:</span>
                  <span className="text-white font-medium">{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">VAT ({formData.uaeFields.taxPercent}%):</span>
                  <span className="text-white font-medium">{getVATAmount().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-white">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-400">{getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional References */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                Additional References (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order Reference</label>
                  <input
                    type="text"
                    value={formData.uaeFields.orderReference}
                    onChange={(e) => setFormData({
                      ...formData,
                      uaeFields: { ...formData.uaeFields, orderReference: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contract Reference</label>
                  <input
                    type="text"
                    value={formData.uaeFields.contractReference}
                    onChange={(e) => setFormData({
                      ...formData,
                      uaeFields: { ...formData.uaeFields, contractReference: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Invoice Note</label>
                  <textarea
                    value={formData.uaeFields.invoiceNote}
                    onChange={(e) => setFormData({
                      ...formData,
                      uaeFields: { ...formData.uaeFields, invoiceNote: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-700">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={generateQRCode}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR
                </button>
                <button
                  type="button"
                  onClick={generateInvoiceHash}
                  className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Generate Hash
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {editingInvoice ? 'Update' : 'Create'} E-Invoice
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UAEEInvoiceForm;