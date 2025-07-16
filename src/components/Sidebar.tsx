import React from 'react';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  Brain,
  DollarSign,
  Settings,
  Home,
  Package,
  Receipt,
  Banknote
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'accounts', label: 'Chart of Accounts', icon: BarChart3 },
    { id: 'customers', label: 'CRM', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: Banknote },
    { id: 'reports', label: 'IFRS Reports', icon: TrendingUp },
    { id: 'kpis', label: 'KPIs', icon: DollarSign },
    { id: 'ai', label: 'AI Insights', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400">AccounTech Pro</h1>
        <p className="text-sm text-gray-400 mt-1">Advanced Accounting Suite</p>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;