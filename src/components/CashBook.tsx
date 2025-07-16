import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { CashBookEntry } from '../types';

const CashBook: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashBookEntry | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('ALL');

  // Mock cash accounts
  const cashAccounts = [
    { id: 'cash-main', name: 'Main Cash Account' },
    { id: 'cash-petty', name: 'Petty Cash' },
    { id: 'cash-sales', name: 'Sales Cash' }
  ];

  // Mock cash book entries
  const [entries, setEntries] = useState<CashBookEntry[]>([
    {
      id: '1',
      date: new Date('2024-01-15'),
      voucherNumber: 'CV-001',
      particulars: 'Cash sales for the day',
      debitAmount: 5000,
      creditAmount: 0,
      balance: 5000,
      narration: 'Daily cash sales collection',
      cashAccount: 'cash-main',
      vatApplicable: true,
      vatAmount: 238.10,
      vatTreatment: 'STANDARD_RATED',
      created: new Date('2024-01-15'),
      createdBy: 'Cashier'
    },
    {
      id: '2',
      date: new Date('2024-01-16'),
      voucherNumber: 'CV-002',
      particulars: 'Office supplies purchase',
      debitAmount: 0,
      creditAmount: 250,
      balance: 4750,
      narration: 'Purchased office stationery',
      cashAccount: 'cash-main',
      vatApplicable: true,
      vatAmount: 11.90,
      vatTreatment: 'STANDARD_RATED',
      created: new Date('2024-01-16'),
      createdBy: 'Admin'
    }
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    voucherNumber: '',
    particulars: '',
    debitAmount: 0,
    creditAmount: 0,
    narration: '',
    cashAccount: 'cash-main',
    vatApplicable: false,
    vatAmount: 0,
    vatTreatment: 'STANDARD_RATED' as const
  });

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.narration.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || entry.date.toISOString().split('T')[0] === dateFilter;
    const matchesAccount = accountFilter === 'ALL' || entry.cashAccount === accountFilter;
    
    return matchesSearch && matchesDate && matchesAccount;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate running balance
    const lastEntry = entries[entries.length - 1];
    const lastBalance = lastEntry ? lastEntry.balance : 0;
    const newBalance = lastBalance + formData.debitAmount - formData.creditAmount;

    const entryData: CashBookEntry = {
      id: editingEntry?.id || Date.now().toString(),
      date: new Date(formData.date),
      voucherNumber: formData.voucherNumber,
      particulars: formData.particulars,
      debitAmount: formData.debitAmount,
      creditAmount: formData.creditAmount,
      balance: newBalance,
      narration: formData.narration,
      cashAccount: formData.cashAccount,
      vatApplicable: formData.vatApplicable,
      vatAmount: formData.vatApplicable ? formData.vatAmount : undefined,
      vatTreatment: formData.vatApplicable ? formData.vatTreatment : undefined,
      created: editingEntry?.created || new Date(),
      createdBy: 'Current User'
    };

    if (editingEntry) {
      setEntries(entries.map(e => e.id === editingEntry.id ? entryData : e));
    } else {
      setEntries([...entries, entryData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      voucherNumber: '',
      particulars: '',
      debitAmount: 0,
      creditAmount: 0,
      narration: '',
      cashAccount: 'cash-main',
      vatApplicable: false,
      vatAmount: 0,
      vatTreatment: 'STANDARD_RATED'
    });
    setShowAddForm(false);
    setEditingEntry(null);
  };

  const handleEdit = (entry: CashBookEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date.toISOString().split('T')[0],
      voucherNumber: entry.voucherNumber,
      particulars: entry.particulars,
      debitAmount: entry.debitAmount,
      creditAmount: entry.creditAmount,
      narration: entry.narration,
      cashAccount: entry.cashAccount,
      vatApplicable: entry.vatApplicable,
      vatAmount: entry.vatAmount || 0,
      vatTreatment: entry.vatTreatment || 'STANDARD_RATED'
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const getTotalDebits = () => filteredEntries.reduce((sum, entry) => sum + entry.debitAmount, 0);
  const getTotalCredits = () => filteredEntries.reduce((sum, entry) => sum + entry.creditAmount, 0);
  const getCurrentBalance = () => getTotalDebits() - getTotalCredits();
  const getTotalVAT = () => filteredEntries.reduce((sum, entry) => sum + (entry.vatAmount || 0), 0);

  const generateVoucherNumber = () => {
    const lastVoucher = entries[entries.length - 1];
    if (lastVoucher) {
      const lastNumber = parseInt(lastVoucher.voucherNumber.split('-')[1]);
      return `CV-${String(lastNumber + 1).padStart(3, '0')}`;
    }
    return 'CV-001';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🇦🇪 Cash Book</h1>
          <p className="text-gray-400 mt-1">VAT-compliant cash transaction recording</p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, voucherNumber: generateVoucherNumber() });
            setShowAddForm(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Receipts</p>
              <p className="text-2xl font-bold text-green-400">AED {getTotalDebits().toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Payments</p>
              <p className="text-2xl font-bold text-red-400">AED {getTotalCredits().toFixed(2)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Balance</p>
              <p className={`text-2xl font-bold ${getCurrentBalance() >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                AED {getCurrentBalance().toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total VAT</p>
              <p className="text-2xl font-bold text-purple-400">AED {getTotalVAT().toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Accounts</option>
          {cashAccounts.map(account => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>
      </div>

      {/* Cash Book Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Voucher #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Particulars</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Debit (AED)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credit (AED)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance (AED)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">VAT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredEntries.map((entry) => {
                const account = cashAccounts.find(acc => acc.id === entry.cashAccount);
                
                return (
                  <tr key={entry.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {entry.date.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {entry.voucherNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{entry.particulars}</div>
                        <div className="text-sm text-gray-400">{account?.name}</div>
                        {entry.narration && (
                          <div className="text-xs text-gray-500 mt-1">{entry.narration}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-400">
                      {entry.debitAmount > 0 ? entry.debitAmount.toFixed(2) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-400">
                      {entry.creditAmount > 0 ? entry.creditAmount.toFixed(2) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-400">
                      {entry.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {entry.vatApplicable ? (
                        <div className="text-sm">
                          <div className="text-purple-400 font-medium">
                            AED {entry.vatAmount?.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {entry.vatTreatment?.replace('_', ' ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Entry"
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
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {editingEntry ? 'Edit Cash Book Entry' : 'Add Cash Book Entry'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Voucher Number *</label>
                  <input
                    type="text"
                    value={formData.voucherNumber}
                    onChange={(e) => setFormData({ ...formData, voucherNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CV-001"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Particulars *</label>
                  <input
                    type="text"
                    value={formData.particulars}
                    onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description of transaction"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Debit Amount (AED)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.debitAmount}
                    onChange={(e) => setFormData({ ...formData, debitAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Credit Amount (AED)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.creditAmount}
                    onChange={(e) => setFormData({ ...formData, creditAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cash Account *</label>
                  <select
                    value={formData.cashAccount}
                    onChange={(e) => setFormData({ ...formData, cashAccount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {cashAccounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="vatApplicable"
                    checked={formData.vatApplicable}
                    onChange={(e) => setFormData({ ...formData, vatApplicable: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="vatApplicable" className="ml-2 text-sm text-gray-300">
                    VAT Applicable
                  </label>
                </div>
                {formData.vatApplicable && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">VAT Amount (AED)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.vatAmount}
                        onChange={(e) => setFormData({ ...formData, vatAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">VAT Treatment</label>
                      <select
                        value={formData.vatTreatment}
                        onChange={(e) => setFormData({ ...formData, vatTreatment: e.target.value as any })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="STANDARD_RATED">Standard Rated (5%)</option>
                        <option value="ZERO_RATED">Zero Rated (0%)</option>
                        <option value="EXEMPT">Exempt</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Narration</label>
                  <textarea
                    value={formData.narration}
                    onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional details about the transaction"
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {editingEntry ? 'Update' : 'Add'} Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashBook;