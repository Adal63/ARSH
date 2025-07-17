import React, { useState } from 'react';
import { useEffect, useContext, createContext } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
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
import Auth from './components/Auth';
import { useSupabase } from './hooks/useSupabase';
import CashBook from './components/CashBook';
import BankModule from './components/BankModule';
import InterAccountTransferModule from './components/InterAccountTransfer';
import { 
  Home, 
  CreditCard, 
  FileText, 
  Package, 
  Receipt, 
  Banknote, 
  Building, 
  Truck, 
  FileCheck, 
  ShoppingCart, 
  Wallet, 
  ArrowRightLeft, 
  TrendingUp, 
  DollarSign, 
  Brain, 
  Settings as SettingsIcon 
} from 'lucide-react';

// Create a context for Supabase
export const SupabaseContext = createContext<ReturnType<typeof useSupabase> | null>(null);

function App() {
  const supabase = useSupabase();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Available sections configuration
  const availableSections = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: Banknote },
    { id: 'uae-customers', label: 'UAE Customers', icon: Building },
    { id: 'uae-suppliers', label: 'UAE Suppliers', icon: Truck },
    { id: 'sales-quotations', label: 'Sales Quotations', icon: FileCheck },
    { id: 'purchase-invoices', label: 'Purchase Invoices', icon: ShoppingCart },
    { id: 'cash-book', label: 'Cash Book', icon: Wallet },
    { id: 'bank-module', label: 'Bank Management', icon: CreditCard },
    { id: 'inter-transfer', label: 'Inter-Account Transfer', icon: ArrowRightLeft },
    { id: 'reports', label: 'IFRS Reports', icon: TrendingUp },
    { id: 'kpis', label: 'KPIs', icon: DollarSign },
    { id: 'ai', label: 'AI Insights', icon: Brain },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  // Load settings from localStorage or use defaults
  const [visibleSections, setVisibleSections] = useState<string[]>(() => {
    const saved = localStorage.getItem('visibleSections');
    return saved ? JSON.parse(saved) : availableSections.map(s => s.id);
  });

  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('sectionOrder');
    return saved ? JSON.parse(saved) : availableSections.map(s => s.id);
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('visibleSections', JSON.stringify(visibleSections));
    localStorage.setItem('sectionOrder', JSON.stringify(sectionOrder));
  }, [visibleSections, sectionOrder]);

  // Check if user is authenticated
  if (supabase.loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!supabase.user) {
    return <Auth />;
  }

  const handleUpdateSettings = (settings: { visibleSections: string[], sectionOrder: string[] }) => {
    setVisibleSections(settings.visibleSections);
    setSectionOrder(settings.sectionOrder);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
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
          <Settings
            availableSections={availableSections}
            visibleSections={visibleSections}
            sectionOrder={sectionOrder}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <SupabaseContext.Provider value={supabase}>
      <div className="min-h-screen bg-gray-900 flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          availableSections={availableSections}
          visibleSections={visibleSections}
          sectionOrder={sectionOrder}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </SupabaseContext.Provider>
  );
}

// Custom hook to use the Supabase context
export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseContext must be used within a SupabaseContext.Provider');
  }
  return context;
};

export default App;