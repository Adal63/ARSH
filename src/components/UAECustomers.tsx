import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Building, Phone, Mail, MapPin, FileText, CheckCircle, XCircle } from 'lucide-react';
import { UAECustomer } from '../types';

const UAECustomers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<UAECustomer | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'VAT_REGISTERED' | 'NON_VAT'>('ALL');
  const [filterGroup, setFilterGroup] = useState<'ALL' | 'DOMESTIC' | 'GCC' | 'EXPORT'>('ALL');

  // Mock data - in real app, this would come from a hook
  const [customers, setCustomers] = useState<UAECustomer[]>([
    {
      id: '1',
      customerName: 'Al Futtaim Group',
      trn: '100123456700003',
      contactDetails: {
        phone: '+971-4-295-8888',
        email: 'info@alfuttaim.com',
        website: 'www.alfuttaim.com'
      },
      billingAddress: {
        street: 'Al Futtaim Tower, Dubai Festival City',
        city: 'Dubai',
        emirate: 'Dubai',
        country: 'UAE',
        poBox: 'P.O. Box 152'
      },
      customerType: 'VAT_REGISTERED',
      defaultVATTreatment: 'STANDARD_RATED',
      accountGroup: 'DOMESTIC',
      paymentTerms: 'Net 30',
      creditLimit: 500000,
      isActive: true,
      created: new Date('2024-01-01'),
      lastUpdated: new Date()
    },
    {
      id: '2',
      customerName: 'Saudi Aramco',
      trn: '300987654321001',
      contactDetails: {
        phone: '+966-13-872-7777',
        email: 'procurement@aramco.com'
      },
      billingAddress: {
        street: 'Dhahran Complex',
        city: 'Dhahran',
        emirate: 'Eastern Province',
        country: 'Saudi Arabia',
        poBox: 'P.O. Box 5000'
      },
      customerType: 'VAT_REGISTERED',
      defaultVATTreatment: 'ZERO_RATED',
      accountGroup: 'GCC',
      paymentTerms: 'Net 45',
      creditLimit: 1000000,
      isActive: true,
      created: new Date('2024-01-15'),
      lastUpdated: new Date()
    }
  ]);

  const [formData, setFormData] = useState({
    customerName: '',
    trn: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    city: '',
    emirate: '',
    country: 'UAE',
    poBox: '',
    customerType: 'VAT_REGISTERED' as const,
    defaultVATTreatment: 'STANDARD_RATED' as const,
    accountGroup: 'DOMESTIC' as const,
    paymentTerms: 'Net 30',
    creditLimit: 0
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.trn.includes(searchTerm) ||
                         customer.contactDetails.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || customer.customerType === filterType;
    const matchesGroup = filterGroup === 'ALL' || customer.accountGroup === filterGroup;
    
    return matchesSearch && matchesType && matchesGroup;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData: UAECustomer = {
      id: editingCustomer?.id || Date.now().toString(),
      customerName: formData.customerName,
      trn: formData.trn,
      contactDetails: {
        phone: formData.phone,
        email: formData.email,
        website: formData.website
      },
      billingAddress: {
        street: formData.street,
        city: formData.city,
        emirate: formData.emirate,
        country: formData.country,
        poBox: formData.poBox
      },
      customerType: formData.customerType,
      defaultVATTreatment: formData.defaultVATTreatment,
      accountGroup: formData.accountGroup,
      paymentTerms: formData.paymentTerms,
      creditLimit: formData.creditLimit,
      isActive: true,
      created: editingCustomer?.created || new Date(),
      lastUpdated: new Date()
    };

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? customerData : c));
    } else {
      setCustomers([...customers, customerData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      trn: '',
      phone: '',
      email: '',
      website: '',
      street: '',
      city: '',
      emirate: '',
      country: 'UAE',
      poBox: '',
      customerType: 'VAT_REGISTERED',
      defaultVATTreatment: 'STANDARD_RATED',
      accountGroup: 'DOMESTIC',
      paymentTerms: 'Net 30',
      creditLimit: 0
    });
    setShowAddForm(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer: UAECustomer) => {
    setEditingCustomer(customer);
    setFormData({
      customerName: customer.customerName,
      trn: customer.trn,
      phone: customer.contactDetails.phone,
      email: customer.contactDetails.email,
      website: customer.contactDetails.website || '',
      street: customer.billingAddress.street,
      city: customer.billingAddress.city,
      emirate: customer.billingAddress.emirate,
      country: customer.billingAddress.country,
      poBox: customer.billingAddress.poBox || '',
      customerType: customer.customerType,
      defaultVATTreatment: customer.defaultVATTreatment,
      accountGroup: customer.accountGroup,
      paymentTerms: customer.paymentTerms,
      creditLimit: customer.creditLimit
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const getVATTreatmentColor = (treatment: string) => {
    switch (treatment) {
      case 'STANDARD_RATED': return 'bg-blue-100 text-blue-800';
      case 'ZERO_RATED': return 'bg-green-100 text-green-800';
      case 'EXEMPT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountGroupColor = (group: string) => {
    switch (group) {
      case 'DOMESTIC': return 'bg-purple-100 text-purple-800';
      case 'GCC': return 'bg-orange-100 text-orange-800';
      case 'EXPORT': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const validateTRN = (trn: string) => {
    // UAE TRN validation: 15 digits
    return /^\d{15}$/.test(trn);
  };

  const stats = {
    total: customers.length,
    vatRegistered: customers.filter(c => c.customerType === 'VAT_REGISTERED').length,
    domestic: customers.filter(c => c.accountGroup === 'DOMESTIC').length,
    gcc: customers.filter(c => c.accountGroup === 'GCC').length,
    export: customers.filter(c => c.accountGroup === 'EXPORT').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🇦🇪 UAE FTA Customer Management</h1>
          <p className="text-gray-400 mt-1">VAT-compliant customer records with TRN validation</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Building className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">VAT Registered</p>
              <p className="text-2xl font-bold text-green-400">{stats.vatRegistered}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Domestic</p>
              <p className="text-2xl font-bold text-purple-400">{stats.domestic}</p>
            </div>
            <Building className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">GCC</p>
              <p className="text-2xl font-bold text-orange-400">{stats.gcc}</p>
            </div>
            <Building className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Export</p>
              <p className="text-2xl font-bold text-indigo-400">{stats.export}</p>
            </div>
            <Building className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers, TRN, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Types</option>
          <option value="VAT_REGISTERED">VAT Registered</option>
          <option value="NON_VAT">Non-VAT</option>
        </select>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value as any)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Groups</option>
          <option value="DOMESTIC">Domestic</option>
          <option value="GCC">GCC</option>
          <option value="EXPORT">Export</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">TRN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">VAT Treatment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Account Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credit Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-white">{customer.customerName}</div>
                        <div className="text-sm text-gray-400">{customer.billingAddress.city}, {customer.billingAddress.emirate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-sm font-mono text-white">{customer.trn}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-300">
                        <Phone className="w-3 h-3 mr-2" />
                        {customer.contactDetails.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Mail className="w-3 h-3 mr-2" />
                        {customer.contactDetails.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getVATTreatmentColor(customer.defaultVATTreatment)}`}>
                      {customer.defaultVATTreatment.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getAccountGroupColor(customer.accountGroup)}`}>
                      {customer.accountGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-400">
                    AED {customer.creditLimit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">TRN (Tax Registration Number) *</label>
                    <input
                      type="text"
                      value={formData.trn}
                      onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                      className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                        formData.trn && !validateTRN(formData.trn) 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="15-digit TRN number"
                      required
                    />
                    {formData.trn && !validateTRN(formData.trn) && (
                      <p className="text-red-400 text-xs mt-1">TRN must be exactly 15 digits</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Contact Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Billing Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Emirate *</label>
                    <select
                      value={formData.emirate}
                      onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Emirate</option>
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Sharjah">Sharjah</option>
                      <option value="Ajman">Ajman</option>
                      <option value="Umm Al Quwain">Umm Al Quwain</option>
                      <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                      <option value="Fujairah">Fujairah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Country *</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">P.O. Box</label>
                    <input
                      type="text"
                      value={formData.poBox}
                      onChange={(e) => setFormData({ ...formData, poBox: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* VAT & Business Settings */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">VAT & Business Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Customer Type *</label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="VAT_REGISTERED">VAT Registered</option>
                      <option value="NON_VAT">Non-VAT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Default VAT Treatment *</label>
                    <select
                      value={formData.defaultVATTreatment}
                      onChange={(e) => setFormData({ ...formData, defaultVATTreatment: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="STANDARD_RATED">Standard Rated (5%)</option>
                      <option value="ZERO_RATED">Zero Rated (0%)</option>
                      <option value="EXEMPT">Exempt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Account Group *</label>
                    <select
                      value={formData.accountGroup}
                      onChange={(e) => setFormData({ ...formData, accountGroup: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DOMESTIC">Domestic</option>
                      <option value="GCC">GCC</option>
                      <option value="EXPORT">Export</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Payment Terms *</label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Credit Limit (AED) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
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
                  disabled={formData.trn && !validateTRN(formData.trn)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCustomer ? 'Update' : 'Add'} Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UAECustomers;