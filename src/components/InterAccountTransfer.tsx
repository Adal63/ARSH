import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, ArrowRightLeft, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { InterAccountTransfer } from '../types';

const InterAccountTransferModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Mock accounts (cash and bank)
  const accounts = [
    { id: 'cash-main', name: 'Main Cash Account', type: 'CASH' as const, balance: 25000 },
    { id: 'cash-petty', name: 'Petty Cash', type: 'CASH' as const, balance: 5000 },
    { id: 'bank-enbd', name: 'Emirates NBD - Current', type: 'BANK' as const, balance: 125000 },
    { id: 'bank-adcb', name: 'ADCB - Savings', type: 'BANK' as const, balance: 75000 }
  ];

  // Mock transfer data
  const [transfers, setTransfers] = useState<InterAccountTransfer[]>([
    {
      id: '1',
      transferNumber: 'TXF-2024-001',
      transferDate: new Date('2024-01-15'),
      fromAccount: {
        id: 'bank-enbd',
        name: 'Emirates NBD - Current',
        type: 'BANK'
      },
      toAccount: {
        id: 'cash-main',
        name: 'Main Cash Account',
        type: 'CASH'
      },
      amount: 10000,
      narration: 'Cash withdrawal for daily operations',
      status: 'COMPLETED',
      approvedBy: 'Finance Manager',
      approvalDate: new Date('2024-01-15'),
      created: new Date('2024-01-15'),
      createdBy: 'Cashier'
    },
    {
      id: '2',
      transferNumber: 'TXF-2024-002',
      transferDate: new Date('2024-01-16'),
      fromAccount: {
        id: 'cash-main',
        name: 'Main Cash Account',
        type: 'CASH'
      },
      toAccount: {
        id: 'cash-petty',
        name: 'Petty Cash',
        type: 'CASH'
      },
      amount: 2000,
      narration: 'Petty cash replenishment',
      status: 'PENDING',
      created: new Date('2024-01-16'),
      createdBy: 'Admin'
    }
  ]);

  const [formData, setFormData] = useState({
    transferDate: new Date().toISOString().split('T')[0],
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    narration: ''
  });

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromAccount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toAccount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.narration.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || transfer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
    const toAccount = accounts.find(acc => acc.id === formData.toAccountId);
    
    if (!fromAccount || !toAccount) return;

    const transferData: InterAccountTransfer = {
      id: Date.now().toString(),
      transferNumber: `TXF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(3, '0')}`,
      transferDate: new Date(formData.transferDate),
      fromAccount: {
        id: fromAccount.id,
        name: fromAccount.name,
        type: fromAccount.type
      },
      toAccount: {
        id: toAccount.id,
        name: toAccount.name,
        type: toAccount.type
      },
      amount: formData.amount,
      narration: formData.narration,
      status: 'PENDING',
      created: new Date(),
      createdBy: 'Current User'
    };

    setTransfers([...transfers, transferData]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      transferDate: new Date().toISOString().split('T')[0],
      fromAccountId: '',
      toAccountId: '',
      amount: 0,
      narration: ''
    });
    setShowAddForm(false);
  };

  const handleApprove = (id: string) => {
    setTransfers(transfers.map(transfer => 
      transfer.id === id 
        ? { 
            ...transfer, 
            status: 'COMPLETED',
            approvedBy: 'Current User',
            approvalDate: new Date()
          }
        : transfer
    ));
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this transfer?')) {
      setTransfers(transfers.map(transfer => 
        transfer.id === id 
          ? { ...transfer, status: 'CANCELLED' }
          : transfer
      ));
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      setTransfers(transfers.filter(t => t.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle;
      case 'PENDING': return Clock;
      case 'CANCELLED': return XCircle;
      default: return Clock;
    }
  };

  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === 'PENDING').length,
    completed: transfers.filter(t => t.status === 'COMPLETED').length,
    cancelled: transfers.filter(t => t.status === 'CANCELLED').length,
    totalAmount: transfers.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0)
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🇦🇪 Inter-Account Transfers</h1>
          <p className="text-gray-400 mt-1">Transfer funds between cash and bank accounts</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Transfer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Transfers</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <ArrowRightLeft className="w-8 h-8 text-purple-400" />
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
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-blue-400">AED {stats.totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Account Balances */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Account Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{account.name}</p>
                  <p className="text-xl font-bold text-white">AED {account.balance.toLocaleString()}</p>
                </div>
                <div className={`p-2 rounded-lg ${
                  account.type === 'CASH' ? 'bg-green-600/20' : 'bg-blue-600/20'
                }`}>
                  <DollarSign className={`w-5 h-5 ${
                    account.type === 'CASH' ? 'text-green-400' : 'text-blue-400'
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transfers..."
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
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Transfers Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Transfer #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">From Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">To Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Approved By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransfers.map((transfer) => {
                const StatusIcon = getStatusIcon(transfer.status);
                
                return (
                  <tr key={transfer.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <ArrowRightLeft className="w-5 h-5 text-purple-400 mr-3" />
                        <span className="text-sm font-medium text-white">{transfer.transferNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {transfer.transferDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-white">{transfer.fromAccount.name}</div>
                        <div className="text-gray-400">{transfer.fromAccount.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-white">{transfer.toAccount.name}</div>
                        <div className="text-gray-400">{transfer.toAccount.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-400">
                      AED {transfer.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <StatusIcon className="w-4 h-4 mr-2" />
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {transfer.approvedBy || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {transfer.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(transfer.id)}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Approve Transfer"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(transfer.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Cancel Transfer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(transfer.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Transfer"
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

      {/* Add Transfer Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Create Inter-Account Transfer</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Transfer Date *</label>
                  <input
                    type="date"
                    value={formData.transferDate}
                    onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Amount (AED) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">From Account *</label>
                  <select
                    value={formData.fromAccountId}
                    onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Source Account</option>
                    {accounts.filter(acc => acc.id !== formData.toAccountId).map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} (AED {account.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">To Account *</label>
                  <select
                    value={formData.toAccountId}
                    onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Destination Account</option>
                    {accounts.filter(acc => acc.id !== formData.fromAccountId).map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} (AED {account.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Narration *</label>
                  <textarea
                    value={formData.narration}
                    onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Purpose of transfer"
                    required
                  />
                </div>
              </div>

              {/* Transfer Preview */}
              {formData.fromAccountId && formData.toAccountId && formData.amount > 0 && (
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3">Transfer Preview</h4>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">From</div>
                      <div className="font-medium text-white">
                        {accounts.find(acc => acc.id === formData.fromAccountId)?.name}
                      </div>
                      <div className="text-sm text-red-400">
                        -AED {formData.amount.toLocaleString()}
                      </div>
                    </div>
                    <ArrowRightLeft className="w-8 h-8 text-purple-400" />
                    <div className="text-center">
                      <div className="text-sm text-gray-400">To</div>
                      <div className="font-medium text-white">
                        {accounts.find(acc => acc.id === formData.toAccountId)?.name}
                      </div>
                      <div className="text-sm text-green-400">
                        +AED {formData.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> Inter-account transfers do not attract VAT as they are internal fund movements between your own accounts.
                </p>
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Create Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterAccountTransferModule;