import React, { useState } from 'react';
import { useEffect, useContext, createContext, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
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

// Custom event listener for Supabase reconnection
const useSupabaseReconnection = (callback: () => void) => {
  useEffect(() => {
    const handleReconnection = () => {
      console.log('Supabase reconnected, refreshing data...');
      callback();
    };
    
    window.addEventListener('supabase-reconnected', handleReconnection);
    window.addEventListener('supabase-network-restored', handleReconnection);
    
    return () => {
      window.removeEventListener('supabase-reconnected', handleReconnection);
      window.removeEventListener('supabase-network-restored', handleReconnection);
    };
  }, [callback]);
};

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

  // Setup reconnection handler
  const handleReconnection = useCallback(() => {
    if (supabase.user) {
      supabase.fetchAllData();
    }
  }, [supabase]);
  
  useSupabaseReconnection(handleReconnection);

  // Check if user is authenticated
  if (supabase.loading) {
    return (
      <LoadingScreen 
        error={supabase.error} 
        isOfflineMode={supabase.isOfflineMode}
        onRetry={supabase.retryConnection}
      />
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
      <div className="min-h-screen bg-gray-900 flex relative">
        {/* Offline mode indicator */}
        {supabase.isOfflineMode && (
          <div className="absolute top-0 left-0 right-0 bg-yellow-600 text-white text-center py-1 text-sm z-50">
            Offline Mode - Changes will not be saved to the database
          </div>
        )}
        
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
        
        {/* Error notification */}
        {supabase.error && !supabase.loading && (
          <div className="fixed bottom-4 right-4 bg-red-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50 animate-in slide-in-from-right-5 duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{supabase.error}</p>
                <button 
                  onClick={supabase.retryConnection}
                  className="mt-2 text-xs underline hover:text-red-200"
                >
                  Retry connection
                </button>
              </div>
            </div>
          </div>
        )}
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