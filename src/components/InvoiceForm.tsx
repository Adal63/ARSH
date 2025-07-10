import React, { useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { Plus, Trash2, X } from 'lucide-react';
import { InvoiceItem } from '../types';

interface InvoiceFormProps {
  onClose: () => void;
  onSubmit: (invoiceData: any) => void;
  editingInvoice?: any;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose, onSubmit, editingInvoice }) => {
  const { customers } = useAccounting();

  // Initialize form state with jobNo [[3]]
  const [formData, setFormData] = useState({
    customerId: editingInvoice?.customerId || '',
    date: editingInvoice?.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    dueDate: editingInvoice?.dueDate?.toISOString().split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    number: editingInvoice?.number || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    status: editingInvoice?.status || 'Draft',
    jobNo: editingInvoice?.jobNo || '' // Add jobNo to state [[3]]
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

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceData = {
      ...formData,
      date: new Date(formData.date),
      dueDate: new Date(formData.dueDate),
      items: items.filter(item => item.description.trim() !== ''),
      amount: getTotalAmount()
    };
    onSubmit(invoiceData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer
                </label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* New Job No Field [[7]] */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job No
                </label>
                <input
                  type="text"
                  value={formData.jobNo}
                  onChange={(e) => setFormData({ ...formData, jobNo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter job reference number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Invoice Items and other sections remain unchanged */}
            {/* ... (rest of the component code) ... */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
