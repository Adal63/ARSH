import React, { useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { Plus, Edit2, Trash2, Search, Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Move } from 'lucide-react';
import { InventoryItem, StockMovement, StockAllocation } from '../types';

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'allocations'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  
  // Mock data - in real app, this would come from useAccounting hook
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      code: 'TIRE001',
      name: 'PIRELLI 245/35R20 95Y PZERO PZ4 RFT',
      description: 'High performance tire for BMW',
      category: 'Tires',
      unit: 'PCS',
      costPrice: 1000,
      sellingPrice: 1180,
      currentStock: 25,
      minimumStock: 5,
      maximumStock: 100,
      reorderLevel: 10,
      location: 'Warehouse A',
      supplier: 'Pirelli UAE',
      barcode: '8019227308853',
      isActive: true,
      created: new Date('2024-01-01'),
      lastUpdated: new Date()
    },
    {
      id: '2',
      code: 'OIL001',
      name: 'Mobil 1 5W-30 Engine Oil',
      description: 'Synthetic engine oil 4L',
      category: 'Lubricants',
      unit: 'LTR',
      costPrice: 45,
      sellingPrice: 65,
      currentStock: 150,
      minimumStock: 20,
      maximumStock: 500,
      reorderLevel: 30,
      location: 'Warehouse B',
      supplier: 'ExxonMobil',
      barcode: '7501234567890',
      isActive: true,
      created: new Date('2024-01-01'),
      lastUpdated: new Date()
    }
  ]);

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([
    {
      id: '1',
      itemId: '1',
      type: 'IN',
      quantity: 50,
      unitCost: 1000,
      totalCost: 50000,
      reference: 'PO-2024-001',
      description: 'Purchase from Pirelli UAE',
      date: new Date('2024-01-15'),
      createdBy: 'Admin'
    },
    {
      id: '2',
      itemId: '1',
      type: 'OUT',
      quantity: 2,
      unitCost: 1000,
      totalCost: 2000,
      reference: 'INV-2024-001',
      description: 'Sale to customer',
      date: new Date('2024-01-16'),
      createdBy: 'Sales'
    }
  ]);

  const [stockAllocations, setStockAllocations] = useState<StockAllocation[]>([
    {
      id: '1',
      itemId: '1',
      orderId: 'ORD-001',
      customerId: '1',
      allocatedQuantity: 4,
      reservedQuantity: 4,
      availableQuantity: 21,
      allocationDate: new Date(),
      status: 'ACTIVE',
      notes: 'Reserved for BMW service'
    }
  ]);

  const [itemFormData, setItemFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    unit: 'PCS',
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    reorderLevel: 0,
    location: '',
    supplier: '',
    barcode: '',
    isActive: true
  });

  const [movementFormData, setMovementFormData] = useState({
    itemId: '',
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER',
    quantity: 0,
    unitCost: 0,
    reference: '',
    description: '',
    fromLocation: '',
    toLocation: ''
  });

  const [allocationFormData, setAllocationFormData] = useState({
    itemId: '',
    orderId: '',
    customerId: '',
    allocatedQuantity: 0,
    notes: ''
  });

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.reorderLevel);
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      ...itemFormData,
      id: Date.now().toString(),
      created: new Date(),
      lastUpdated: new Date()
    };
    setInventoryItems([...inventoryItems, newItem]);
    setItemFormData({
      code: '',
      name: '',
      description: '',
      category: '',
      unit: 'PCS',
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      minimumStock: 0,
      maximumStock: 0,
      reorderLevel: 0,
      location: '',
      supplier: '',
      barcode: '',
      isActive: true
    });
    setShowAddForm(false);
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const newMovement: StockMovement = {
      ...movementFormData,
      id: Date.now().toString(),
      totalCost: movementFormData.quantity * movementFormData.unitCost,
      date: new Date(),
      createdBy: 'Current User'
    };
    setStockMovements([...stockMovements, newMovement]);
    
    // Update item stock
    setInventoryItems(items => items.map(item => {
      if (item.id === movementFormData.itemId) {
        let newStock = item.currentStock;
        if (movementFormData.type === 'IN') {
          newStock += movementFormData.quantity;
        } else if (movementFormData.type === 'OUT') {
          newStock -= movementFormData.quantity;
        }
        return { ...item, currentStock: Math.max(0, newStock), lastUpdated: new Date() };
      }
      return item;
    }));

    setMovementFormData({
      itemId: '',
      type: 'IN',
      quantity: 0,
      unitCost: 0,
      reference: '',
      description: '',
      fromLocation: '',
      toLocation: ''
    });
    setShowMovementForm(false);
  };

  const handleAddAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventoryItems.find(i => i.id === allocationFormData.itemId);
    if (!item) return;

    const newAllocation: StockAllocation = {
      ...allocationFormData,
      id: Date.now().toString(),
      reservedQuantity: allocationFormData.allocatedQuantity,
      availableQuantity: item.currentStock - allocationFormData.allocatedQuantity,
      allocationDate: new Date(),
      status: 'ACTIVE'
    };
    setStockAllocations([...stockAllocations, newAllocation]);
    setAllocationFormData({
      itemId: '',
      orderId: '',
      customerId: '',
      allocatedQuantity: 0,
      notes: ''
    });
    setShowAllocationForm(false);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.reorderLevel) {
      return { status: 'Low Stock', color: 'text-red-400', icon: AlertTriangle };
    } else if (item.currentStock >= item.maximumStock * 0.8) {
      return { status: 'High Stock', color: 'text-yellow-400', icon: TrendingUp };
    }
    return { status: 'Normal', color: 'text-green-400', icon: Package };
  };

  const renderItemsTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-white">{inventoryItems.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-400">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-green-400">AED {totalValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-purple-400">
                {new Set(inventoryItems.map(item => item.category)).size}
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Items Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cost Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                const StatusIcon = stockStatus.icon;
                return (
                  <tr key={item.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{item.name}</div>
                        <div className="text-sm text-gray-400">{item.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{item.category}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{item.currentStock} {item.unit}</div>
                      <div className="text-xs text-gray-400">Min: {item.minimumStock}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">AED {item.costPrice}</td>
                    <td className="px-6 py-4 text-sm text-white">AED {item.sellingPrice}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center ${stockStatus.color}`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        <span className="text-sm">{stockStatus.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300 transition-colors">
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
    </div>
  );

  const renderMovementsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Stock Movements</h3>
        <button
          onClick={() => setShowMovementForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Movement
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unit Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {stockMovements.map((movement) => {
                const item = inventoryItems.find(i => i.id === movement.itemId);
                return (
                  <tr key={movement.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {movement.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {item?.name || 'Unknown Item'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        movement.type === 'IN' ? 'bg-green-900 text-green-300' :
                        movement.type === 'OUT' ? 'bg-red-900 text-red-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{movement.quantity}</td>
                    <td className="px-6 py-4 text-sm text-white">AED {movement.unitCost}</td>
                    <td className="px-6 py-4 text-sm text-white">AED {movement.totalCost}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{movement.reference}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAllocationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Stock Allocations</h3>
        <button
          onClick={() => setShowAllocationForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Allocation
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Allocated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reserved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {stockAllocations.map((allocation) => {
                const item = inventoryItems.find(i => i.id === allocation.itemId);
                return (
                  <tr key={allocation.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-white">
                      {item?.name || 'Unknown Item'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{allocation.orderId}</td>
                    <td className="px-6 py-4 text-sm text-white">{allocation.allocatedQuantity}</td>
                    <td className="px-6 py-4 text-sm text-yellow-400">{allocation.reservedQuantity}</td>
                    <td className="px-6 py-4 text-sm text-green-400">{allocation.availableQuantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        allocation.status === 'ACTIVE' ? 'bg-green-900 text-green-300' :
                        allocation.status === 'EXPIRED' ? 'bg-red-900 text-red-300' :
                        'bg-gray-900 text-gray-300'
                      }`}>
                        {allocation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {allocation.allocationDate.toLocaleDateString()}
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
        <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'items', label: 'Items', icon: Package },
          { id: 'movements', label: 'Stock Movements', icon: TrendingUp },
          { id: 'allocations', label: 'Allocations', icon: Move }
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
      {activeTab === 'items' && renderItemsTab()}
      {activeTab === 'movements' && renderMovementsTab()}
      {activeTab === 'allocations' && renderAllocationsTab()}

      {/* Add Item Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Add New Item</h3>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Item Code</label>
                  <input
                    type="text"
                    value={itemFormData.code}
                    onChange={(e) => setItemFormData({ ...itemFormData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Unit</label>
                  <select
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PCS">Pieces</option>
                    <option value="LTR">Liters</option>
                    <option value="KG">Kilograms</option>
                    <option value="SET">Set</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cost Price (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemFormData.costPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Selling Price (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemFormData.sellingPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={itemFormData.currentStock}
                    onChange={(e) => setItemFormData({ ...itemFormData, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Minimum Stock</label>
                  <input
                    type="number"
                    value={itemFormData.minimumStock}
                    onChange={(e) => setItemFormData({ ...itemFormData, minimumStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={itemFormData.reorderLevel}
                    onChange={(e) => setItemFormData({ ...itemFormData, reorderLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={itemFormData.location}
                    onChange={(e) => setItemFormData({ ...itemFormData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={itemFormData.supplier}
                    onChange={(e) => setItemFormData({ ...itemFormData, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Movement Form Modal */}
      {showMovementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Add Stock Movement</h3>
            </div>
            <form onSubmit={handleAddMovement} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Item</label>
                <select
                  value={movementFormData.itemId}
                  onChange={(e) => setMovementFormData({ ...movementFormData, itemId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Item</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Movement Type</label>
                <select
                  value={movementFormData.type}
                  onChange={(e) => setMovementFormData({ ...movementFormData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="IN">Stock In</option>
                  <option value="OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={movementFormData.quantity}
                    onChange={(e) => setMovementFormData({ ...movementFormData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Unit Cost (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={movementFormData.unitCost}
                    onChange={(e) => setMovementFormData({ ...movementFormData, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reference</label>
                <input
                  type="text"
                  value={movementFormData.reference}
                  onChange={(e) => setMovementFormData({ ...movementFormData, reference: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={movementFormData.description}
                  onChange={(e) => setMovementFormData({ ...movementFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowMovementForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Allocation Form Modal */}
      {showAllocationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Add Stock Allocation</h3>
            </div>
            <form onSubmit={handleAddAllocation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Item</label>
                <select
                  value={allocationFormData.itemId}
                  onChange={(e) => setAllocationFormData({ ...allocationFormData, itemId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Item</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (Stock: {item.currentStock})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Order ID</label>
                  <input
                    type="text"
                    value={allocationFormData.orderId}
                    onChange={(e) => setAllocationFormData({ ...allocationFormData, orderId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={allocationFormData.allocatedQuantity}
                    onChange={(e) => setAllocationFormData({ ...allocationFormData, allocatedQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={allocationFormData.notes}
                  onChange={(e) => setAllocationFormData({ ...allocationFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAllocationForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Add Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;