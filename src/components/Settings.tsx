import React, { useState } from 'react';
import { Settings as SettingsIcon, Eye, EyeOff, GripVertical, Save, RotateCcw, Palette, Layout, User, BarChart3 } from 'lucide-react';
import CRM from './CRM';
import ChartOfAccounts from './ChartOfAccounts';

interface SettingsProps {
  availableSections: any[];
  visibleSections: string[];
  sectionOrder: string[];
  onUpdateSettings: (settings: { visibleSections: string[], sectionOrder: string[] }) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  availableSections, 
  visibleSections, 
  sectionOrder, 
  onUpdateSettings 
}) => {
  const [activeTab, setActiveTab] = useState<'interface' | 'crm' | 'accounts' | 'general'>('interface');
  const [tempVisibleSections, setTempVisibleSections] = useState<string[]>(visibleSections);
  const [tempSectionOrder, setTempSectionOrder] = useState<string[]>(sectionOrder);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleToggleSection = (sectionId: string) => {
    if (tempVisibleSections.includes(sectionId)) {
      setTempVisibleSections(tempVisibleSections.filter(id => id !== sectionId));
    } else {
      setTempVisibleSections([...tempVisibleSections, sectionId]);
    }
  };

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedItem(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const newOrder = [...tempSectionOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setTempSectionOrder(newOrder);
    setDraggedItem(null);
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      visibleSections: tempVisibleSections,
      sectionOrder: tempSectionOrder
    });
  };

  const handleResetToDefault = () => {
    const defaultVisible = availableSections.map(section => section.id);
    const defaultOrder = availableSections.map(section => section.id);
    setTempVisibleSections(defaultVisible);
    setTempSectionOrder(defaultOrder);
  };

  const renderInterfaceCustomization = () => (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-300 mb-2">🎨 Interface Customization</h3>
        <p className="text-blue-200 text-sm">
          Customize your dashboard by selecting which sections to display and arranging them in your preferred order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Visibility */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Section Visibility
          </h4>
          <div className="space-y-3">
            {availableSections.map((section) => (
              <div key={section.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <section.icon className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white font-medium">{section.label}</span>
                </div>
                <button
                  onClick={() => handleToggleSection(section.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    tempVisibleSections.includes(section.id)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {tempVisibleSections.includes(section.id) ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section Order */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Layout className="w-5 h-5 mr-2" />
            Section Order
          </h4>
          <p className="text-gray-400 text-sm mb-4">Drag and drop to reorder sections</p>
          <div className="space-y-2">
            {tempSectionOrder.map((sectionId, index) => {
              const section = availableSections.find(s => s.id === sectionId);
              if (!section || !tempVisibleSections.includes(sectionId)) return null;

              return (
                <div
                  key={sectionId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sectionId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, sectionId)}
                  className={`flex items-center p-3 bg-gray-700 rounded-lg cursor-move transition-all ${
                    draggedItem === sectionId ? 'opacity-50 scale-95' : 'hover:bg-gray-600'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded mr-3">
                    {index + 1}
                  </span>
                  <section.icon className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white font-medium">{section.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
        <button
          onClick={handleResetToDefault}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Default
        </button>
        <div className="flex space-x-3">
          <div className="text-sm text-gray-400">
            {tempVisibleSections.length} of {availableSections.length} sections visible
          </div>
          <button
            onClick={handleSaveSettings}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3" />
            Settings & Configuration
          </h1>
          <p className="text-gray-400 mt-1">Customize your accounting system interface and manage core modules</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'interface', label: 'Interface Customization', icon: Palette },
          { id: 'crm', label: 'Customer Management', icon: User },
          { id: 'accounts', label: 'Chart of Accounts', icon: BarChart3 },
          { id: 'general', label: 'General Settings', icon: SettingsIcon }
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
      <div className="min-h-[600px]">
        {activeTab === 'interface' && renderInterfaceCustomization()}
        {activeTab === 'crm' && <CRM />}
        {activeTab === 'accounts' && <ChartOfAccounts />}
        {activeTab === 'general' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <input
                  type="text"
                  defaultValue="ASTER AUTO GARAGE"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tax Registration Number (TRN)</label>
                <input
                  type="text"
                  defaultValue="100502938200003"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Currency</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Financial Year Start</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="january">January</option>
                  <option value="april">April</option>
                  <option value="july">July</option>
                  <option value="october">October</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;