import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Building, CreditCard, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { BankAccount, BankTransaction } from '../types';

const BankModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');

  // Mock bank accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: 'Emirates NBD',
      branchName: 'Dubai Main Branch',
      accountNumber: '1234567890123',
      accountType: 'CURRENT',
      ifscCode: 'EBILAEAD',
      swiftCode: 'EBILAEAD',
      iban: 'AE070260001234567890123',
      openingBalance: 100000,
      currentBalance: 125000,
      isActive: true,
      created: new Date('2024-01-01')
    },
    {
      id: '2',
      bankName: 'ADCB',
      branchName: 'Abu Dhabi Branch',
      accountNumber: '9876543210987',
      accountType: 'SAVINGS',
      swiftCode: 'ADCBAEAA',
      iban: 'AE460030009876543210987',
      openingBalance: 50000,
      currentBalance: 75000,
      isActive: true,
      created: new Date('2024-01-01')
    }
  ]);

  // Mock bank transactions
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([
    {
      id: '1',
      bankAccountId: '1',
      transactionDate: new Date('2024-01-15'),
      transactionType: 'CREDIT',
      amount: 25000,
      balance: 125000,
      description: 'Customer payment received',
      reference: 'TXN123456789',
      vatApplicable: false,
      reconciled: true,
      reconciledDate: new Date('2024-01-16'),
      created: new Date('2024-01-15'),
      createdBy: 'System'
    },
    {
      id: '2',
      bankAccountId: '2',
      transactionDate: new Date('2024-01-16'),
      transactionType: 'DEBIT',
      amount: 5000,
      balance: 70000,
      description: 'Supplier payment',
      reference: 'CHQ001234',
      chequeNumber: '001234',
      vatApplicable: true,
      vatAmount: 238.10,
      vatTreatment: 'STANDARD_RATED',
      reconciled: false,
      created: new Date('2024-01-16'),
      createdBy: 'Finance Team'
    }
  ]);

  const [accountFormData, setAccountFormData] = useState({
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountType: 'CURRENT' as const,
    ifscCode: '',
    swiftCode: '',
    iban: '',
    openingBalance: 0
  });

  const [transactionFormData, setTransactionFormData] = useState({
    bankAccountId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    transactionType: 'CREDIT' as const,
    amount: 0,
    description: '',
    reference: '',
    chequeNumber: '',
    vatApplicable: false,
    vatAmount: 0,
    vatTreatment: 'STANDARD_RATED' as const
  });

  const filteredAccounts = bankAccounts.filter(account =>
    account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber.includes(searchTerm) ||
    account.iban.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = bankTransactions.filter(transaction => {
    const account = bankAccounts.find(acc => acc.id === transaction.bankAccountId);
    const accountMatch = selectedAccount === 'ALL' || transaction.bankAccountId === selectedAccount;
    const searchMatch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (account?.bankName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return accountMatch && searchMatch;
  });

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const accountData: BankAccount = {
      id: editingAccount?.id || Date.now().toString(),
      ...accountFormData,
      currentBalance: accountFormData.openingBalance,
      isActive: true,
      created: editingAccount?.created || new Date()
    };

    if (editingAccount) {
      setBankAccounts(bankAccounts.map(acc => acc.id === editingAccount.id ? accountData : acc));
    } else {
      setBankAccounts([...bankAccounts, accountData]);
    }

    resetAccountForm();
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const account = bankAccounts.find(acc => acc.id === transactionFormData.bankAccountId);
    if (!account) return;

    const newBalance = transactionFormData.transactionType === 'CREDIT' 
      ? account.currentBalance + transactionFormData.amount
      : account.currentBalance - transactionFormData.amount;

    const transactionData: BankTransaction = {
      id: Date.now().toString(),
      ...transactionFormData,
      transactionDate: new Date(transactionFormData.transactionDate),
      balance: newBalance,
      vatAmount: transactionFormData.vatApplicable ? transactionFormData.vatAmount : undefined,
      vatTreatment: transactionFormData.vatApplicable ? transactionFormData.vatTreatment : undefined,
      reconciled: false,
      created: new Date(),
      createdBy: 'Current User'
    };

    setBankTransactions([...bankTransactions, transactionData]);
    
    // Update account balance
    setBankAccounts(bankAccounts.map(acc => 
      acc.id === transactionFormData.bankAccountId 
        ? { ...acc, currentBalance: newBalance }
        : acc
    ));

    resetTransactionForm();
  };

  const resetAccountForm = () => {
    setAccountFormData({
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountType: 'CURRENT',
      ifscCode: '',
      swiftCode: '',
      iban: '',
      openingBalance: 0
    });
    setShowAddAccountForm(false);
    setEditingAccount(null);
  };

  const resetTransactionForm = () => {
    setTransactionFormData({
      bankAccountId: '',
      transactionDate: new Date().toISOString().split('T')[0],
      transactionType: 'CREDIT',
      amount: 0,
      description: '',
      reference: '',
      chequeNumber: '',
      vatApplicable: false,
      vatAmount: 0,
      vatTreatment: 'STANDARD_RATED'
    });
    setShowAddTransactionForm(false);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setAccountFormData({
      bankName: account.bankName,
      branchName: account.branchName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      ifscCode: account.ifscCode || '',
      swiftCode: account.swiftCode || '',
      iban: account.iban,
      openingBalance: account.openingBalance
    });
    setShowAddAccountForm(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
      setBankTransactions(bankTransactions.filter(txn => txn.bankAccountId !== id));
    }
  };

  const toggleReconciliation = (transactionId: string) => {
    setBankTransactions(bankTransactions.map(txn => 
      txn.id === transactionId 
        ? { 
            ...txn, 
            reconciled: !txn.reconciled,
            reconciledDate: !txn.reconciled ? new Date() : undefined
          }
        : txn
    ));
  };

  const getTotalBalance = () => bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const getReconciledTransactions = () => bankTransactions.filter(txn => txn.reconciled).length;
  const getPendingTransactions = () => bankTransactions.filter(txn => !txn.reconciled).length;

  const renderAccountsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Bank Accounts</h3>
        <button
          onClick={() => setShowAddAccountForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Building className="w-6 h-6 text-blue-400 mr-3" />
                <div>
                  <h4 className="font-semibold text-white">{account.bankName}</h4>
                  <p className="text-sm text-gray-400">{account.branchName}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                account.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                {account.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Account Number:</span>
                <span className="text-white text-sm font-mono">{account.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">IBAN:</span>
                <span className="text-white text-sm font-mono">{account.iban}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Type:</span>
                <span className="text-white text-sm">{account.accountType}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-600 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Current Balance</span>
                <span className="text-2xl font-bold text-green-400">
                  AED {account.currentBalance.toLocaleString()}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditAccount(account)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransactionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Bank Transactions</h3>
        <button
          onClick={() => setShowAddTransactionForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Accounts</option>
          {bankAccounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.bankName} - {account.accountNumber}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">VAT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reconciled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.map((transaction) => {
                const account = bankAccounts.find(acc => acc.id === transaction.bankAccountId);
                
                return (
                  <tr key={transaction.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {transaction.transactionDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{account?.bankName}</div>
                        <div className="text-sm text-gray-400">{account?.accountNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-white">{transaction.description}</div>
                        <div className="text-sm text-gray-400">Ref: {transaction.reference}</div>
                        {transaction.chequeNumber && (
                          <div className="text-xs text-gray-500">Cheque: {transaction.chequeNumber}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {transaction.transactionType === 'CREDIT' ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 mr-2" />
                        )}
                        <span className={`text-sm ${
                          transaction.transactionType === 'CREDIT' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.transactionType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={transaction.transactionType === 'CREDIT' ? 'text-green-400' : 'text-red-400'}>
                        AED {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-400">
                      AED {transaction.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {transaction.vatApplicable ? (
                        <div className="text-sm">
                          <div className="text-purple-400 font-medium">
                            AED {transaction.vatAmount?.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {transaction.vatTreatment?.replace('_', ' ')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleReconciliation(transaction.id)}
                        className={`flex items-center px-2 py-1 text-xs rounded-full transition-colors ${
                          transaction.reconciled
                            ? 'bg-green-900 text-green-300 hover:bg-green-800'
                            : 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
                        }`}
                      >
                        {transaction.reconciled ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {transaction.reconciled ? 'Reconciled' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setBankTransactions(bankTransactions.filter(t => t.id !== transaction.id))}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🇦🇪 Bank Management</h1>
          <p className="text-gray-400 mt-1">Manage bank accounts and transactions with VAT compliance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Accounts</p>
              <p className="text-2xl font-bold text-white">{bankAccounts.length}</p>
            </div>
            <Building className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <p className="text-2xl font-bold text-green-400">AED {getTotalBalance().toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Reconciled</p>
              <p className="text-2xl font-bold text-green-400">{getReconciledTransactions()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{getPendingTransactions()}</p>
            </div>
            <XCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'accounts', label: 'Bank Accounts', icon: Building },
          { id: 'transactions', label: 'Transactions', icon: CreditCard }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-6 py-3 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'accounts' && renderAccountsTab()}
      {activeTab === 'transactions' && renderTransactionsTab()}

      {/* Add Account Form Modal */}
      {showAddAccountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
              </h3>
            </div>
            <form onSubmit={handleAccountSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={accountFormData.bankName}
                    onChange={(e) => setAccountFormData({ ...accountFormData, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    value={accountFormData.branchName}
                    onChange={(e) => setAccountFormData({ ...accountFormData, branchName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={accountFormData.accountNumber}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Type *</label>
                  <select
                    value={accountFormData.accountType}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CURRENT">Current</option>
                    <option value="SAVINGS">Savings</option>
                    <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">IBAN *</label>
                  <input
                    type="text"
                    value={accountFormData.iban}
                    onChange={(e) => setAccountFormData({ ...accountFormData, iban: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="AE070260001234567890123"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SWIFT Code</label>
                  <input
                    type="text"
                    value={accountFormData.swiftCode}
                    onChange={(e) => setAccountFormData({ ...accountFormData, swiftCode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="EBILAEAD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={accountFormData.ifscCode}
                    onChange={(e) => setAccountFormData({ ...accountFormData, ifscCode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Opening Balance (AED) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={accountFormData.openingBalance}
                    onChange={(e) => setAccountFormData({ ...accountFormData, openingBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetAccountForm}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingAccount ? 'Update' : 'Add'} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Form Modal */}
      {showAddTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Add Bank Transaction</h3>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bank Account *</label>
                  <select
                    value={transactionFormData.bankAccountId}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, bankAccountId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Account</option>
                    {bankAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.bankName} - {account.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Transaction Date *</label>
                  <input
                    type="date"
                    value={transactionFormData.transactionDate}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, transactionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Transaction Type *</label>
                  <select
                    value={transactionFormData.transactionType}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, transactionType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CREDIT">Credit (Money In)</option>
                    <option value="DEBIT">Debit (Money Out)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Amount (AED) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={transactionFormData.amount}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                  <input
                    type="text"
                    value={transactionFormData.description}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Transaction description"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Reference *</label>
                  <input
                    type="text"
                    value={transactionFormData.reference}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, reference: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Transaction reference"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cheque Number</label>
                  <input
                    type="text"
                    value={transactionFormData.chequeNumber}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, chequeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="If applicable"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="vatApplicable"
                    checked={transactionFormData.vatApplicable}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, vatApplicable: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="vatApplicable" className="ml-2 text-sm text-gray-300">
                    VAT Applicable
                  </label>
                </div>
                {transactionFormData.vatApplicable && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">VAT Amount (AED)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={transactionFormData.vatAmount}
                        onChange={(e) => setTransactionFormData({ ...transactionFormData, vatAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">VAT Treatment</label>
                      <select
                        value={transactionFormData.vatTreatment}
                        onChange={(e) => setTransactionFormData({ ...transactionFormData, vatTreatment: e.target.value as any })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="STANDARD_RATED">Standard Rated (5%)</option>
                        <option value="ZERO_RATED">Zero Rated (0%)</option>
                        <option value="EXEMPT">Exempt</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetTransactionForm}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankModule;