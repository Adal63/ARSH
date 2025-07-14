import React, { useState, useRef, useEffect } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { Plus, Edit2, Eye, Send, Search, Filter, Settings, X, ChevronUp, ChevronDown, GripVertical, Info, FileText, Save, RotateCcw, Edit3, Check, XCircle } from 'lucide-react';
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
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [showTermsTooltip, setShowTermsTooltip] = useState<string | null>(null);

  // All available columns with their properties
  const allColumns = [
    { key: 'issueDate', label: 'Issue Date', defaultVisible: true },
    { key: 'reference', label: 'Reference', defaultVisible: true },
    { key: 'dueDate', label: 'Due Date', defaultVisible: true },
    { key: 'mjNo', label: 'MJ No', defaultVisible: false },
    { key: 'customer', label: 'Customer', defaultVisible: true },
    { key: 'salesOrder', label: 'Sales Order', defaultVisible: false },
    { key: 'salesQuote', label: 'Sales Quote', defaultVisible: false },
    { key: 'description', label: 'Description', defaultVisible: false },
    { key: 'project', label: 'Project', defaultVisible: false },
    { key: 'division', label: 'Division', defaultVisible: false },
    { key: 'closedInvoice', label: 'Closed Invoice', defaultVisible: false },
    { key: 'withholdingTax', label: 'Withholding Tax', defaultVisible: false },
    { key: 'discount', label: 'Discount', defaultVisible: false },
    { key: 'invoiceAmount', label: 'Invoice Amount', defaultVisible: true },
    { key: 'balanceDue', label: 'Balance Due', defaultVisible: false },
    { key: 'daysToDueDate', label: 'Days to Due Date', defaultVisible: false },
    { key: 'daysOverdue', label: 'Days Overdue', defaultVisible: false },
    { key: 'status', label: 'Status', defaultVisible: true },
    { key: 'timestamp', label: 'Timestamp', defaultVisible: false },
    { key: 'chasisNo', label: 'Chassis No', defaultVisible: false },
    { key: 'vehicleNo', label: 'Vehicle No', defaultVisible: false },
    { key: 'carModel', label: 'Car Model', defaultVisible: false },
    { key: 'serviceKms', label: 'Service KMS', defaultVisible: false },
    { key: 'termsConditions', label: 'Terms & Conditions', defaultVisible: false },
    { key: 'costOfSales', label: 'Cost of Sales', defaultVisible: false },
    { key: 'approvedBy', label: 'Approved By', defaultVisible: false },
    { key: 'createdBy', label: 'Created By', defaultVisible: false },
    { key: 'creditBy', label: 'Credit By', defaultVisible: false }
  ];

  // Initialize visible columns from localStorage or defaults
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('invoiceVisibleColumns');
    if (saved) {
      return JSON.parse(saved);
    }
    return allColumns.filter(col => col.defaultVisible).map(col => col.key);
  });

  // Initialize column order from localStorage or defaults
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('invoiceColumnOrder');
    if (saved) {
      return JSON.parse(saved);
    }
    return allColumns.filter(col => col.defaultVisible).map(col => col.key);
  });

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
    return customer ? customer.name : 'Customer Not Found';
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

  // Save column preferences to localStorage
  const saveColumnPreferences = () => {
    localStorage.setItem('invoiceVisibleColumns', JSON.stringify(visibleColumns));
    localStorage.setItem('invoiceColumnOrder', JSON.stringify(columnOrder));
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    const newVisibleColumns = visibleColumns.includes(columnKey)
      ? visibleColumns.filter(key => key !== columnKey)
      : [...visibleColumns, columnKey];
    
    setVisibleColumns(newVisibleColumns);
    
    // Update column order to include/exclude the toggled column
    if (newVisibleColumns.includes(columnKey) && !columnOrder.includes(columnKey)) {
      setColumnOrder([...columnOrder, columnKey]);
    }
  };

  // Move column up in order
  const moveColumnUp = (columnKey: string) => {
    const currentIndex = columnOrder.indexOf(columnKey);
    if (currentIndex > 0) {
      const newOrder = [...columnOrder];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      setColumnOrder(newOrder);
    }
  };

  // Move column down in order
  const moveColumnDown = (columnKey: string) => {
    const currentIndex = columnOrder.indexOf(columnKey);
    if (currentIndex < columnOrder.length - 1) {
      const newOrder = [...columnOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      setColumnOrder(newOrder);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, columnKey: string) => {
    setDraggedItem(columnKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(columnKey);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnKey: string) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== targetColumnKey) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedItem);
      const targetIndex = newOrder.indexOf(targetColumnKey);
      
      // Remove dragged item and insert at target position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      
      setColumnOrder(newOrder);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Get column label
  const getColumnLabel = (key: string) => {
    return allColumns.find(col => col.key === key)?.label || key;
  };

  // Get cell value for a column
  const getCellValue = (invoice: Invoice, columnKey: string) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    const daysToDue = Math.ceil((invoice.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const daysOverdue = daysToDue < 0 ? Math.abs(daysToDue) : 0;
    
    switch (columnKey) {
      case 'issueDate':
        return invoice.date.toLocaleDateString();
      case 'reference':
        return invoice.number;
      case 'dueDate':
        return invoice.dueDate.toLocaleDateString();
      case 'mjNo':
        return 'MJ-' + invoice.id.slice(-4);
      case 'customer':
        return customer?.name || 'Unknown';
      case 'salesOrder':
        return 'SO-' + invoice.id.slice(-4);
      case 'salesQuote':
        return 'SQ-' + invoice.id.slice(-4);
      case 'description':
        return invoice.items[0]?.description || 'Service Invoice';
      case 'project':
        return 'Project-' + invoice.id.slice(-3);
      case 'division':
        return 'Auto Service';
      case 'closedInvoice':
        return invoice.status === 'Paid' ? 'Yes' : 'No';
      case 'withholdingTax':
        return '$0.00';
      case 'discount':
        return '$12.38';
      case 'invoiceAmount':
        return '$' + invoice.amount.toLocaleString();
      case 'balanceDue':
        return invoice.status === 'Paid' ? '$0.00' : '$' + invoice.amount.toLocaleString();
      case 'daysToDueDate':
        return daysToDue > 0 ? daysToDue.toString() : '0';
      case 'daysOverdue':
        return daysOverdue.toString();
      case 'status':
        return invoice.status;
      case 'timestamp':
        return invoice.created.toLocaleString();
      case 'chasisNo':
        return 'CH-' + invoice.id.slice(-6);
      case 'vehicleNo':
        return 'M 16969/DXB';
      case 'carModel':
        return 'BMW/840I/0';
      case 'serviceKms':
        return '12920';
      case 'termsConditions':
        return 'Standard Terms';
      case 'costOfSales':
        return '$' + (invoice.amount * 0.7).toLocaleString();
      case 'approvedBy':
        return 'Manager';
      case 'createdBy':
        return 'Althaf';
      case 'creditBy':
        return 'Finance Team';
      default:
        return '';
    }
  };

  // Get ordered visible columns
  const orderedVisibleColumns = columnOrder.filter(key => visibleColumns.includes(key));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Invoices</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowColumnSettings(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Settings className="w-5 h-5 mr-2" />
            Columns
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Invoice
          </button>
        </div>
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
                {orderedVisibleColumns.map(columnKey => (
                  <th key={columnKey} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {getColumnLabel(columnKey)}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-700/50">
                  {orderedVisibleColumns.map(columnKey => (
                    <td key={columnKey} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 relative">
                      {columnKey === 'status' ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                          {getCellValue(invoice, columnKey)}
                        </span>
                      ) : columnKey === 'termsConditions' ? (
                        <div className="relative">
                          <button
                            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            onClick={() => setShowTermsTooltip(invoice.id)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View Terms
                          </button>
                        </div>
                      ) : (
                        <span className={columnKey === 'invoiceAmount' || columnKey === 'balanceDue' ? 'text-white font-medium' : ''}>
                          {getCellValue(invoice, columnKey)}
                        </span>
                      )}
                    </td>
                  ))}
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

      {/* Enhanced Column Settings Modal with Drag & Drop */}
      {showColumnSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Customize Invoice Columns</h2>
              <button
                onClick={() => {
                  setShowColumnSettings(false);
                  saveColumnPreferences();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column Selection */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Available Columns</h3>
                    <p className="text-gray-400 text-sm">Select which columns to display in the invoice table</p>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allColumns.map(column => (
                      <div key={column.key} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={column.key}
                            checked={visibleColumns.includes(column.key)}
                            onChange={() => toggleColumnVisibility(column.key)}
                            className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={column.key} className="ml-3 text-sm text-white cursor-pointer">
                            {column.label}
                          </label>
                        </div>
                        
                        {visibleColumns.includes(column.key) && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                              #{columnOrder.indexOf(column.key) + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column Ordering with Drag & Drop */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Column Order</h3>
                    <p className="text-gray-400 text-sm">Drag & drop to reorder columns or use arrow buttons</p>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {orderedVisibleColumns.map((columnKey, index) => (
                      <div
                        key={columnKey}
                        draggable
                        onDragStart={(e) => handleDragStart(e, columnKey)}
                        onDragOver={(e) => handleDragOver(e, columnKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, columnKey)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-move transition-all ${
                          draggedItem === columnKey 
                            ? 'bg-blue-600 shadow-lg transform scale-105' 
                            : dragOverItem === columnKey 
                              ? 'bg-blue-500/50 border-2 border-blue-400' 
                              : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center">
                          <GripVertical className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded mr-3">
                            #{index + 1}
                          </span>
                          <span className="text-sm text-white">
                            {getColumnLabel(columnKey)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveColumnUp(columnKey)}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveColumnDown(columnKey)}
                            disabled={index === orderedVisibleColumns.length - 1}
                            className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Preview Section */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h4 className="text-md font-semibold text-white mb-3">Column Preview</h4>
                <div className="flex flex-wrap gap-2">
                  {orderedVisibleColumns.map((columnKey, index) => (
                    <span key={columnKey} className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full">
                      {index + 1}. {getColumnLabel(columnKey)}
                    </span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Showing {orderedVisibleColumns.length} of {allColumns.length} available columns
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                <Info className="w-4 h-4 inline mr-1" />
                Drag columns to reorder or use arrow buttons
              </div>
              <button
                onClick={() => {
                  setShowColumnSettings(false);
                  saveColumnPreferences();
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsTooltip && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTermsTooltip(null);
            }
          }}
        >
          <div 
            className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
              <h4 className="text-xl font-bold text-white flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-400" />
                Terms & Conditions
              </h4>
              <button
                onClick={() => setShowTermsTooltip(null)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                title="Close Terms & Conditions"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-sm text-gray-300 leading-relaxed space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                    Warranty Terms
                  </h5>
                  <div className="space-y-2 text-sm">
                    <p>1. All tyres & Batteries warranty against manufacturing defects by Agency only. (Please Bring Original Invoice for warranty claim)</p>
                    <p>2. There is no warranty for any spare parts Items.</p>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-3 flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    Vehicle Storage & Responsibility
                  </h5>
                  <div className="space-y-2 text-sm">
                    <p>3. While leaving the vehicle in our garage for service, kindly remove all your important & valuable items from your vehicle. Therefore if any claim the company is not responsible.</p>
                    <p>4. After Completion of work, we request Customer to collect the Vehicle within 2 days. Otherwise company is not responsible for any damages or claim and also when you receive back the vehicle. Please check properly and confirm everything is ok. If any problem kindly notify Immediately otherwise company is not responsible for any claim further.</p>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Service Recommendations
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-blue-300 mb-2">Wheel Alignment should be done:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>After every 20,000 km</li>
                        <li>After any suspension parts changing</li>
                        <li>After changing tyres or using different size of tyres</li>
                        <li>After hitting footpath korb, Block or any similar things</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium text-blue-300 mb-2">Tyre Balancing and Rotation should be done:</p>
                      <p className="ml-4">All cars every 10,000 km</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Additional Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <p>• All services are performed by certified technicians</p>
                    <p>• Original parts and quality materials are used</p>
                    <p>• Service records are maintained for future reference</p>
                    <p>• Customer satisfaction is our top priority</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
              <div className="text-sm text-gray-400">
                <span className="flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  These terms apply to all services provided by Aster Auto Garage
                </span>
              </div>
              <button
                onClick={() => setShowTermsTooltip(null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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