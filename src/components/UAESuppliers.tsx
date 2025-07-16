import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Building, Phone, Mail, MapPin, FileText, CheckCircle, CreditCard } from 'lucide-react';
import { UAESupplier } from '../types';

const UAESuppliers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<UAESupplier | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'LOCAL' | 'GCC' | 'OVERSEAS'>('ALL');

  // Mock data - in real app, this would come from a hook
  const [suppliers, setSuppliers] = useState<UAESupplier[]>([
    {
      id: '1',
      supplierName: 'Emirates Steel Arkan',
      trn: '100234567800003',
      contactDetails: {
        phone: '+971-2-501-5555',
        email: 'procurement@emiratessteel.com',
        website: 'www.emiratessteel.com'
      },
      address: {
        street: 'Musaffah Industrial Area',
        city: 'Abu Dhabi',
        emirate: 'Abu Dhabi',
        country: 'UAE',
        poBox: 'P.O. Box 10855'
      },
      supplierType: 'LOCAL',
      defaultVATTreatment: 'STANDARD_RATED',
      paymentTerms: 'Net 45',
      bankDetails: {
        bankName: 'Emirates NBD',
        accountNumber: '1234567890123',
        iban: 'AE070260001234567890123',
        swiftCode: 'EBILAEAD'
      },
      isActive: true,
      created: new Date('2024-01-01'),
      lastUpdated: new Date()
    },
    {
      id: '2',
      supplierName: 'Caterpillar Middle East',
      trn: '100345678900003',
      contactDetails: {
        phone: '+971-4-299-5555',
        email: 'sales@cat.com'
      },
      address: {
        street: 'Jebel Ali Free Zone',
        city: 'Dubai',
        emirate: 'Dubai',
        country: 'UAE',
        poBox: 'P.O. Box 17777'
      },
      supplierType: 'LOCAL',
      defaultVATTreatment: 'STANDARD_RATED',
      paymentTerms: 'Net 30',
      isActive: true,
      created: new Date('2024-01-15'),
      lastUpdated: new Date()
    }
  ]);

  const [formData, setFormData] = useState({
    supplierName: '',
    trn: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    city: '',
    emirate: '',
    country: 'UAE',
    poBox: '',
    supplierType: 'LOCAL' as const,
    defaultVATTreatment: 'STANDARD_RATED' as const,
    paymentTerms: 'Net 30',
    bankName: '',
    accountNumber: '',
    iban: '',
    swiftCode: ''
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.trn.includes(searchTerm) ||
                         supplier.contactDetails.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || supplier.supplierType === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplierData: UAESupplier = {
      id: editingSupplier?.id || Date.now().toString(),
      supplierName: formData.supplierName,
      trn: formData.trn,
      contactDetails: {
        phone: formData.phone,
        email: formData.email,
        website: formData.website
      },
      address: {
        street: formData.street,
        city: formData.city,
        emirate: formData.emirate,
        country: formData.country,
        poBox: formData.poBox
      },
      supplierType: formData.supplierType,
      defaultVATTreatment: formData.defaultVATTreatment,
      paymentTerms: formData.paymentTerms,
      bankDetails: formData.bankName ? {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        iban: formData.iban,
        swiftCode: formData.swiftCode
      } : undefined,
      isActive: true,
      created: editingSupplier?.created || new Date(),
      lastUpdated: new Date()
    };

    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? supplierData : s));
    } else {
      setSuppliers([...suppliers, supplierData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      supplierName: '',
      trn: '',
      phone: '',
      email: '',
      website: '',
      street: '',
      city: '',
      emirate: '',
      country: 'UAE',
      poBox: '',
      supplierType: 'LOCAL',
      defaultVATTreatment: 'STANDARD_RATED',
      paymentTerms: 'Net 30',
      bankName: '',
      accountNumber: '',
      iban: '',
      swiftCode: ''
    });
    setShowAddForm(false);
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: UAESupplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplierName: supplier.supplierName,
      trn: supplier.trn,
      phone: supplier.contactDetails.phone,
      email: supplier.contactDetails.email,
      website: supplier.contactDetails.website || '',
      street: supplier.address.street,
      city: supplier.address.city,
      emirate: supplier.address.emirate,
      country: supplier.address.country,
      poBox: supplier.address.poBox || '',
      supplierType: supplier.supplierType,
      defaultVATTreatment: supplier.defaultVATTreatment,
      paymentTerms: supplier.paymentTerms,
      bankName: supplier.bankDetails?.bankName || '',
      accountNumber: supplier.bankDetails?.accountNumber || '',
      iban: supplier.bankDetails?.iban || '',
      swiftCode: supplier.bankDetails?.swiftCode || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const getVATTreatmentColor = (treatment: string) => {
    switch (treatment) {
      case 'STANDARD_RATED': return 'bg-blue-100 text-blue-800';
      case 'ZERO_RATED': return 'bg-green-100 text-green-800';
      case 'EXEMPT': return 'bg-yellow-100 text-yellow-800';
      case 'REVERSE_CHARGE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSupplierTypeColor = (type: string) => {
    switch (type) {
      case 'LOCAL': return 'bg-green-100 text-green-800';
      case 'GCC': return 'bg-orange-100 text-orange-800';
      case 'OVERSEAS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const validateTRN = (trn: string) => {
    return /^\d{15}$/.test(trn);
  };

  const stats = {
    total: suppliers.length,
    local: suppliers.filter(s => s.supplierType === 'LOCAL').length,
    gcc: suppliers.filter(s => s.supplierType === 'GCC').length,
    overseas: suppliers.filter(s => s.supplierType === 'OVERSEAS').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🇦🇪 UAE FTA Supplier Management</h1>
          <p className="text-gray-400 mt-1">VAT-compliant supplier records with input tax tracking</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Supplier
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Suppliers</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Building className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Local</p>
              <p className="text-2xl font-bold text-green-400">{stats.local}</p>
            </div>
            <Building className="w-8 h-8 text-green-400" />
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
              <p className="text-gray-400 text-sm">Overseas</p>
              <p className="text-2xl font-bold text-blue-400">{stats.overseas}</p>
            </div>
            <Building className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers, TRN, or email..."
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
          <option value="LOCAL">Local</option>
          <option value="GCC">GCC</option>
          <option value="OVERSEAS">Overseas</option>
        </select>
      </div>

      {/* Suppliers Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">TRN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">VAT Treatment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Terms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-green-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-white">{supplier.supplierName}</div>
                        <div className="text-sm text-gray-400">{supplier.address.city}, {supplier.address.emirate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-sm font-mono text-white">{supplier.trn}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-300">
                        <Phone className="w-3 h-3 mr-2" />
                        {supplier.contactDetails.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Mail className="w-3 h-3 mr-2" />
                        {supplier.contactDetails.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSupplierTypeColor(supplier.supplierType)}`}>
                      {supplier.supplierType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getVATTreatmentColor(supplier.defaultVATTreatment)}`}>
                      {supplier.defaultVATTreatment.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {supplier.paymentTerms}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Supplier"
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
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      value={formData.supplierName}
                      onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
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
                <h4 className="text-lg font-semibold text-white mb-4">Address</h4>
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

              {/* Business Settings */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Business Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Supplier Type *</label>
                    <select
                      value={formData.supplierType}
                      onChange={(e) => setFormData({ ...formData, supplierType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LOCAL">Local</option>
                      <option value="GCC">GCC</option>
                      <option value="OVERSEAS">Overseas</option>
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
                      <option value="REVERSE_CHARGE">Reverse Charge</option>
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
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Bank Details (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">IBAN</label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AE070260001234567890123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">SWIFT Code</label>
                    <input
                      type="text"
                      value={formData.swiftCode}
                      onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="EBILAEAD"
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UAESuppliers;