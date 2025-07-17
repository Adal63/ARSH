import React, { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useSupabaseContext } from '../App';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableSections: any[];
  visibleSections: string[];
  sectionOrder: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  availableSections, 
  visibleSections, 
  sectionOrder 
}) => {
  const { signOut } = useSupabaseContext();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Filter and order menu items based on user preferences
  const getOrderedVisibleSections = () => {
    return sectionOrder
      .filter(sectionId => visibleSections.includes(sectionId))
      .map(sectionId => availableSections.find(section => section.id === sectionId))
      .filter(Boolean);
  };

  const menuItems = getOrderedVisibleSections();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400">AccounTech Pro</h1>
        <p className="text-sm text-gray-400 mt-1">Advanced Accounting Suite</p>
      </div>
      
      <nav className="mt-8 flex-1 overflow-y-auto">
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
      
      {/* Customize Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5 mr-3" />
          <div>
            <div className="font-medium">Customize Interface</div>
            <div className="text-xs opacity-75">
              {visibleSections.length}/{availableSections.length} sections
            </div>
          </div>
        </button>
      </div>
      
      {/* Sign Out Button */}
      <div className="p-4 border-t border-gray-800 mt-auto">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center px-4 py-3 text-left transition-colors text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;