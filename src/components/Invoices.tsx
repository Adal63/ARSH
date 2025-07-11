import React, { useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { Plus, Edit2, Eye, Send, Search, Filter } from 'lucide-react';
import { Invoice } from '../types';
import InvoiceView from './InvoiceView';
import InvoiceForm from './InvoiceForm';

const Invoices: React.FC = () => {
  const { invoices, customers, addInvoice, updateInvoice } = useAccounting();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const customer = customers.find(c => c.id === invoice.customerId);
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-900 text-green-300';
      case 'Sent': return 'bg-blue-900 text-blue-300';
      case 'Overdue': return 'bg-red-900 text-red-300';
      case 'Draft': return 'bg-gray-900 text-gray-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const handleSendInvoice = (id: string) => {
    updateInvoice(id, { status: 'Sent' });
  };

  const handleMarkPaid = (id: string) => {
    updateInvoice(id, { status: 'Paid' });
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setViewingInvoice(null);
  };

  const handleSendInvoiceFromView = (invoice: Invoice) => {
    updateInvoice(invoice.id, { status: 'Sent' });
    setViewingInvoice(null);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Implement PDF download functionality
    console.log('Downloading invoice:', invoice.number);
  };

  const handleCreateInvoice = (invoiceData: any) => {
    addInvoice(invoiceData);
    setShowAddForm(false);
  };

  const handleUpdateInvoice = (invoiceData: any) => {
    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoiceData);
      setEditingInvoice(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Invoices</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Invoices</p>
              <p className="text-2xl font-bold text-white">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Paid</p>
              <p className="text-2xl font-bold text-green-400">
                {invoices.filter(i => i.status === 'Paid').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-blue-400">
                {invoices.filter(i => i.status === 'Sent').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-white">
                ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {getCustomerName(invoice.customerId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {invoice.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {invoice.dueDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    ${invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingInvoice(invoice)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Edit Invoice"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {invoice.status === 'Draft' && (
                        <button
                          onClick={() => handleSendInvoice(invoice.id)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          title="Send Invoice"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {invoice.status === 'Sent' && (
                        <button
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Mark as Paid"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Invoice View Modal */}
      {viewingInvoice && (
        <InvoiceView
          invoice={viewingInvoice}
          customer={customers.find(c => c.id === viewingInvoice.customerId)!}
          onClose={() => setViewingInvoice(null)}
          onEdit={() => handleEditInvoice(viewingInvoice)}
          onSend={() => handleSendInvoiceFromView(viewingInvoice)}
          onDownload={() => handleDownloadInvoice(viewingInvoice)}
        />
      )}

      {/* Invoice Form Modal */}
      {showAddForm && (
        <InvoiceForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleCreateInvoice}
        />
      )}

      {/* Edit Invoice Form Modal */}
      {editingInvoice && (
        <InvoiceForm
          onClose={() => setEditingInvoice(null)}
          onSubmit={handleUpdateInvoice}
          editingInvoice={editingInvoice}
        />
      )}
    </div>
  );
};

export default Invoices;
