import React, { useState, useRef, useEffect } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { Plus, Trash2, X, Search, ChevronDown, User, Upload, Image, FileText, Download, Eye, Edit3 } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import TermsDesigner from './TermsDesigner';

interface InvoiceFormProps {
  onClose: () => void;
  onSubmit?: (invoiceData: any) => void;
  invoice?: Invoice | null;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose, onSubmit, invoice: editingInvoice }) => {
  const { customers, addCustomer } = useAccounting();
  
  // Customer search and creation states
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  
  // Refs for click outside detection
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Attachments state
  const [attachments, setAttachments] = useState<File[]>(
    editingInvoice?.attachments || []
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Terms Designer state
  const [showTermsDesigner, setShowTermsDesigner] = useState(false);
  
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    status: 'Active' as const,
    totalRevenue: 0,
    lastContact: new Date(),
    notes: ''
  });
  
  const [formData, setFormData] = useState({
    customerId: editingInvoice?.customerId || '',
    date: editingInvoice?.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    dueDate: editingInvoice?.dueDate?.toISOString().split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoiceNumber: editingInvoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    status: editingInvoice?.status || 'draft',
    // Additional custom fields
    mjNo: editingInvoice?.mjNo || `MJ-${String(Date.now()).slice(-4)}`,
    salesOrder: editingInvoice?.salesOrder || `SO-${String(Date.now()).slice(-4)}`,
    salesQuote: editingInvoice?.salesQuote || `SQ-${String(Date.now()).slice(-4)}`,
    description: editingInvoice?.description || 'Service Invoice',
    project: editingInvoice?.project || `Project-${String(Date.now()).slice(-3)}`,
    division: editingInvoice?.division || 'Auto Service',
    closedInvoice: editingInvoice?.closedInvoice || false,
    withholdingTax: editingInvoice?.withholdingTax || 0,
    discount: editingInvoice?.discount || 12.38,
    chasisNo: editingInvoice?.chasisNo || `CH-${String(Date.now()).slice(-6)}`,
    vehicleNo: editingInvoice?.vehicleNo || 'M 16969/DXB',
    carModel: editingInvoice?.carModel || 'BMW/840I/0',
    serviceKms: editingInvoice?.serviceKms || '12920',
    termsConditions: editingInvoice?.termsConditions || 'Standard Terms',
    costOfSales: editingInvoice?.costOfSales || 0,
    approvedBy: editingInvoice?.approvedBy || 'Manager',
    createdBy: editingInvoice?.createdBy || 'Althaf',
    creditBy: editingInvoice?.creditBy || 'Finance Team'
  });

  // Click outside handler for customer dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };

    if (showCustomerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCustomerDropdown]);

  // Real-time customer data sync
  useEffect(() => {
    if (formData.customerId) {
      const currentCustomer = customers.find(c => c.id === formData.customerId);
      if (currentCustomer && selectedCustomer?.id === formData.customerId) {
        // Customer data might have been updated in CRM, refresh the display
        setCustomerSearch('');
      }
    }
  }, [customers, formData.customerId]);

  const [items, setItems] = useState<InvoiceItem[]>(
    editingInvoice?.items || [
      { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
    ]
  );

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.company.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Get selected customer for display
  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  const handleCustomerSelect = (customerId: string) => {
    setFormData({ ...formData, customerId });
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const handleCreateNewCustomer = () => {
    setShowCreateCustomer(true);
    setShowCustomerDropdown(false);
    // Pre-fill name if user was searching
    if (customerSearch.trim()) {
      setNewCustomerData({ ...newCustomerData, name: customerSearch.trim() });
    }
  };

  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer = addCustomer(newCustomerData);
    
    // Auto-select the newly created customer
    setFormData({ ...formData, customerId: newCustomer.id });
    
    // Reset form and close modal
    setNewCustomerData({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      status: 'Active',
      totalRevenue: 0,
      lastContact: new Date(),
      notes: ''
    });
    setShowCreateCustomer(false);
    setCustomerSearch('');
  };

  // Attachment handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Only image files are allowed as attachments.');
    }
    
    setAttachments(prev => [...prev, ...imageFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const previewAttachment = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const downloadAttachment = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
      total: getTotalAmount(),
      attachments: attachments
    };

    if (onSubmit) {
      onSubmit(invoiceData);
    }
  };

  const handleTermsSave = (terms: string, design: any) => {
    setFormData({ ...formData, termsConditions: terms });
    setShowTermsDesigner(false);
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
            <div className="space-y-8">
              {/* Section 1: Basic Invoice Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                  Basic Invoice Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      MJ Number
                    </label>
                    <input
                      type="text"
                      value={formData.mjNo}
                      onChange={(e) => setFormData({ ...formData, mjNo: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
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
              </div>

              {/* Section 2: Customer & Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                  Customer & Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Enhanced Customer Search Dropdown */}
                  <div className="relative" ref={customerDropdownRef}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer *
                    </label>
                    <div className="relative group">
                      <div className="flex">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={selectedCustomer ? `${selectedCustomer.name} - ${selectedCustomer.company}` : customerSearch}
                            onChange={(e) => {
                              setCustomerSearch(e.target.value);
                              setShowCustomerDropdown(true);
                              if (selectedCustomer) {
                                setFormData({ ...formData, customerId: '' });
                              }
                            }}
                            onFocus={() => setShowCustomerDropdown(true)}
                            placeholder="Type to search customers..."
                            className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 group-hover:border-gray-500"
                            required
                          />
                          <ChevronDown className={`absolute right-3 top-3 w-4 h-4 text-gray-400 transition-transform duration-200 ${showCustomerDropdown ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Customer Dropdown */}
                      {showCustomerDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                          {/* Create New Customer Option */}
                          <button
                            type="button"
                            onClick={handleCreateNewCustomer}
                            className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors border-b border-gray-600 flex items-center group/create"
                          >
                            <Plus className="w-4 h-4 mr-3 text-green-400 group-hover/create:scale-110 transition-transform" />
                            <div>
                              <div className="text-green-400 font-medium">Create New Customer</div>
                              {customerSearch.trim() && (
                                <div className="text-xs text-gray-400">
                                  Create "{customerSearch.trim()}"
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Existing Customers */}
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => handleCustomerSelect(customer.id)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-all duration-150 flex items-center group/customer hover:pl-6"
                              >
                                <User className="w-4 h-4 mr-3 text-blue-400 group-hover/customer:scale-110 transition-transform" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">{customer.name}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      customer.status === 'Active' ? 'bg-green-900 text-green-300' :
                                      customer.status === 'Inactive' ? 'bg-red-900 text-red-300' :
                                      'bg-blue-900 text-blue-300'
                                    }`}>
                                      {customer.status}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-400">{customer.company}</div>
                                  <div className="text-xs text-gray-500">{customer.email}</div>
                                </div>
                              </button>
                            ))
                          ) : customerSearch.trim() ? (
                            <div className="px-4 py-3 text-gray-400 text-center italic">
                              No customers found matching "{customerSearch}"
                              <div className="text-xs mt-1">Try creating a new customer above</div>
                            </div>
                          ) : (
                            <div className="px-4 py-3 text-gray-400 text-center italic">
                              Start typing to search customers
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sales Order
                    </label>
                    <input
                      type="text"
                      value={formData.salesOrder}
                      onChange={(e) => setFormData({ ...formData, salesOrder: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sales Quote
                    </label>
                    <input
                      type="text"
                      value={formData.salesQuote}
                      onChange={(e) => setFormData({ ...formData, salesQuote: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project
                    </label>
                    <input
                      type="text"
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Division
                    </label>
                    <input
                      type="text"
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="closedInvoice"
                      checked={formData.closedInvoice}
                      onChange={(e) => setFormData({ ...formData, closedInvoice: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="closedInvoice" className="ml-2 text-sm text-gray-300">
                      Closed Invoice
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Vehicle Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Chassis Number
                    </label>
                    <input
                      type="text"
                      value={formData.chasisNo}
                      onChange={(e) => setFormData({ ...formData, chasisNo: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleNo}
                      onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Car Model
                    </label>
                    <input
                      type="text"
                      value={formData.carModel}
                      onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Service KMS
                    </label>
                    <input
                      type="text"
                      value={formData.serviceKms}
                      onChange={(e) => setFormData({ ...formData, serviceKms: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Withholding Tax ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.withholdingTax}
                      onChange={(e) => setFormData({ ...formData, withholdingTax: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cost of Sales ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costOfSales}
                      onChange={(e) => setFormData({ ...formData, costOfSales: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Approved By
                    </label>
                    <input
                      type="text"
                      value={formData.approvedBy}
                      onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Created By
                    </label>
                    <input
                      type="text"
                      value={formData.createdBy}
                      onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Credit By
                    </label>
                    <input
                      type="text"
                      value={formData.creditBy}
                      onChange={(e) => setFormData({ ...formData, creditBy: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter invoice description..."
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Terms & Conditions
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <textarea
                          value={formData.termsConditions}
                          onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                          rows={4}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter terms and conditions..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowTermsDesigner(true)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
                          title="Open Terms Designer"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Design
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Use the Design button to create professional terms & conditions with custom layouts, colors, and styling
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: Attachments */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                  Supporting Documents & Attachments
                </h3>
                
                {/* Upload Area */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Images (Supporting Documents)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </button>
                    <span className="text-sm text-gray-400">
                      {attachments.length} file(s) attached
                    </span>
                  </div>
                </div>

                {/* Attachments List */}
                {attachments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-white">Attached Files:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {attachments.map((file, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <Image className="w-5 h-5 text-blue-400 mr-2" />
                              <div>
                                <p className="text-white text-sm font-medium truncate max-w-32">
                                  {file.name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove attachment"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => previewAttachment(file)}
                              className="flex-1 flex items-center justify-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadAttachment(file)}
                              className="flex-1 flex items-center justify-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Items Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
                  Invoice Items
                </h3>
              </div>

              <div className="flex items-center justify-between mb-4">
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Description
                        </label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Quantity
                        </label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Rate ($)
                        </label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Amount ($)
                        </label>
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

              {/* Total */}
              <div className="flex justify-end mt-6">
                <div className="bg-gray-700 rounded-lg p-4 min-w-64">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-400">
                      ${getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[70] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Create New Customer Modal */}
      {showCreateCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Create New Customer</h3>
              <button
                onClick={() => setShowCreateCustomer(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSaveNewCustomer} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.name}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newCustomerData.email}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={newCustomerData.phone}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.company}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, company: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={newCustomerData.status}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Prospect">Prospect</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Total Revenue
                    </label>
                    <input
                      type="number"
                      value={newCustomerData.totalRevenue}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, totalRevenue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={newCustomerData.address}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={newCustomerData.notes}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowCreateCustomer(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Terms Designer Modal */}
      {showTermsDesigner && (
        <TermsDesigner
          initialTerms={formData.termsConditions}
          onSave={handleTermsSave}
          onClose={() => setShowTermsDesigner(false)}
        />
      )}
    </div>
  );
};

export default InvoiceForm;