import React, { useState, useMemo } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { Invoice, InvoiceStatus } from '../types';
import InvoiceForm from './InvoiceForm';
import { InvoiceView } from './InvoiceView';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  X,
  ChevronDown,
  FileText,
  DollarSign,
  Calendar,
  User
} from 'lucide-react';

export function Invoices() {
  const { invoices, customers, deleteInvoice } = useAccounting();
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string>('all');
  const [visibleColumns, setVisibleColumns] = useState({
    invoiceNumber: true,
    customer: true,
    date: true,
    dueDate: true,
    amount: true,
    status: true,
    actions: true
  });

  const columnOptions = [
    { value: 'all', label: 'All Columns' },
    { value: 'invoiceNumber', label: 'Invoice Number' },
    { value: 'customer', label: 'Customer' },
    { value: 'date', label: 'Invoice Date' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'amount', label: 'Invoice Amount' },
    { value: 'status', label: 'Status' }
  ];

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const customer = customers.find(c => c.id === invoice.customerId);
      const customerName = customer?.name || 'Unknown Customer';
      
      // Global search filter
      const globalMatch = searchTerm === '' || 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.items.some(item => 
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Status filter
      const statusMatch = statusFilter === 'all' || invoice.status === statusFilter;

      // Column-specific search filter
      let columnMatch = true;
      if (columnSearchTerm && selectedColumn !== 'all') {
        switch (selectedColumn) {
          case 'invoiceNumber':
            columnMatch = invoice.invoiceNumber.toLowerCase().includes(columnSearchTerm.toLowerCase());
            break;
          case 'customer':
            columnMatch = customerName.toLowerCase().includes(columnSearchTerm.toLowerCase());
            break;
          case 'date':
            columnMatch = invoice.date.includes(columnSearchTerm);
            break;
          case 'dueDate':
            columnMatch = invoice.dueDate.includes(columnSearchTerm);
            break;
          case 'amount':
            columnMatch = invoice.total.toString().includes(columnSearchTerm);
            break;
          case 'status':
            columnMatch = invoice.status.toLowerCase().includes(columnSearchTerm.toLowerCase());
            break;
          default:
            columnMatch = true;
        }
      }

      return globalMatch && statusMatch && columnMatch;
    });
  }, [invoices, customers, searchTerm, statusFilter, columnSearchTerm, selectedColumn]);

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handleViewClose = () => {
    setViewingInvoice(null);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleColumnChange = (column: string) => {
    setSelectedColumn(column);
    setColumnSearchTerm('');
  };

  const clearColumnSearch = () => {
    setColumnSearchTerm('');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setColumnSearchTerm('');
    setSelectedColumn('all');
  };

  const getColumnPlaceholder = () => {
    const column = columnOptions.find(col => col.value === selectedColumn);
    return column ? `Search in ${column.label}...` : 'Search...';
  };

  const activeFilters = [
    searchTerm && { type: 'global', label: `Global: "${searchTerm}"`, clear: () => setSearchTerm('') },
    statusFilter !== 'all' && { type: 'status', label: `Status: ${statusFilter}`, clear: () => setStatusFilter('all') },
    columnSearchTerm && selectedColumn !== 'all' && { 
      type: 'column', 
      label: `${columnOptions.find(col => col.value === selectedColumn)?.label}: "${columnSearchTerm}"`, 
      clear: clearColumnSearch 
    }
  ].filter(Boolean);

  const stats = {
    total: filteredInvoices.length,
    paid: filteredInvoices.filter(inv => inv.status === 'paid').length,
    pending: filteredInvoices.filter(inv => inv.status === 'pending').length,
    overdue: filteredInvoices.filter(inv => inv.status === 'overdue').length,
    totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.total, 0)
  };

  if (showForm) {
    return (
      <InvoiceForm
        invoice={editingInvoice}
        onClose={handleFormClose}
      />
    );
  }

  if (viewingInvoice) {
    return (
      <InvoiceView
        invoice={viewingInvoice}
        onClose={handleViewClose}
        onEdit={() => {
          handleViewClose();
          handleEdit(viewingInvoice);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600">Manage your invoices and billing</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-600">Total Amount</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">${stats.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Global Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search all invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Column-Specific Search */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Column Selection */}
          <div className="relative">
            <select
              value={selectedColumn}
              onChange={(e) => handleColumnChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {columnOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Column Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={selectedColumn === 'all' ? 'Select a column to search...' : getColumnPlaceholder()}
              value={columnSearchTerm}
              onChange={(e) => setColumnSearchTerm(e.target.value)}
              disabled={selectedColumn === 'all'}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
            />
            {columnSearchTerm && (
              <button
                onClick={clearColumnSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  filter.type === 'global' ? 'bg-blue-100 text-blue-800' :
                  filter.type === 'status' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}
              >
                {filter.label}
                <button
                  onClick={filter.clear}
                  className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumns.invoiceNumber && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                )}
                {visibleColumns.customer && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                )}
                {visibleColumns.date && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                )}
                {visibleColumns.dueDate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                )}
                {visibleColumns.amount && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                )}
                {visibleColumns.status && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const customer = customers.find(c => c.id === invoice.customerId);
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    {visibleColumns.invoiceNumber && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                    )}
                    {visibleColumns.customer && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {customer?.name || 'Customer Not Found'}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.date && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.date}
                      </td>
                    )}
                    {visibleColumns.dueDate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.dueDate}
                      </td>
                    )}
                    {visibleColumns.amount && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${invoice.total.toFixed(2)}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(invoice)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="Edit Invoice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || columnSearchTerm
                ? 'Try adjusting your search filters.'
                : 'Get started by creating a new invoice.'}
            </p>
            {!searchTerm && statusFilter === 'all' && !columnSearchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}