import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChartOfAccounts from './components/ChartOfAccounts';
import CRM from './components/CRM';
import Transactions from './components/Transactions';
import { Invoices } from './components/Invoices';
import Inventory from './components/Inventory';
import Receipts from './components/Receipts';
import Payments from './components/Payments';
import Reports from './components/Reports';
import KPIs from './components/KPIs';
import AIInsights from './components/AIInsights';
import UAECustomers from './components/UAECustomers';
import UAESuppliers from './components/UAESuppliers';
import SalesQuotations from './components/SalesQuotations';
import PurchaseInvoices from './components/PurchaseInvoices';
import CashBook from './components/CashBook';
import BankModule from './components/BankModule';
import InterAccountTransferModule from './components/InterAccountTransfer';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'accounts':
        return <ChartOfAccounts />;
      case 'customers':
        return <CRM />;
      case 'transactions':
        return <Transactions />;
      case 'invoices':
        return <Invoices />;
      case 'inventory':
        return <Inventory />;
      case 'receipts':
        return <Receipts />;
      case 'payments':
        return <Payments />;
      case 'reports':
        return <Reports />;
      case 'kpis':
        return <KPIs />;
      case 'ai':
        return <AIInsights />;
      case 'uae-customers':
        return <UAECustomers />;
      case 'uae-suppliers':
        return <UAESuppliers />;
      case 'sales-quotations':
        return <SalesQuotations />;
      case 'purchase-invoices':
        return <PurchaseInvoices />;
      case 'cash-book':
        return <CashBook />;
      case 'bank-module':
        return <BankModule />;
      case 'inter-transfer':
        return <InterAccountTransferModule />;
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;