import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Eye, 
  Save, 
  Undo, 
  Redo, 
  Type, 
  Palette, 
  Layout, 
  Plus, 
  Minus, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Divide,
  RotateCcw,
  Check,
  Edit3,
  Copy,
  Trash2,
  Move,
  Settings
} from 'lucide-react';

interface TermsDesignerProps {
  initialTerms: string;
  onSave: (terms: string, design: TermsDesign) => void;
  onClose: () => void;
}

interface TermsDesign {
  layout: 'single' | 'two-column' | 'three-column' | 'accordion' | 'tabbed';
  backgroundColor: string;
  textColor: string;
  headerColor: string;
  borderColor: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  padding: number;
  borderRadius: number;
  sections: TermsSection[];
}

interface TermsSection {
  id: string;
  title: string;
  content: string;
  style: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: string;
    textAlign: string;
    padding: number;
    margin: number;
    borderLeft: string;
    icon?: string;
  };
}

const TermsDesigner: React.FC<TermsDesignerProps> = ({ initialTerms, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'preview'>('content');
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<TermsDesign[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Default design configuration
  const defaultDesign: TermsDesign = {
    layout: 'single',
    backgroundColor: '#1f2937',
    textColor: '#d1d5db',
    headerColor: '#3b82f6',
    borderColor: '#374151',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    lineHeight: 1.6,
    padding: 16,
    borderRadius: 8,
    sections: [
      {
        id: '1',
        title: 'Warranty Terms',
        content: 'All tyres & Batteries warranty against manufacturing defects by Agency only. (Please Bring Original Invoice for warranty claim)\nThere is no warranty for any spare parts Items.',
        style: {
          backgroundColor: '#374151',
          textColor: '#d1d5db',
          fontSize: 14,
          fontWeight: 'normal',
          textAlign: 'left',
          padding: 16,
          margin: 8,
          borderLeft: '4px solid #ef4444',
          icon: '⚠️'
        }
      },
      {
        id: '2',
        title: 'Vehicle Storage & Responsibility',
        content: 'While leaving the vehicle in our garage for service, kindly remove all your important & valuable items from your vehicle. Therefore if any claim the company is not responsible.\n\nAfter Completion of work, we request Customer to collect the Vehicle within 2 days. Otherwise company is not responsible for any damages or claim.',
        style: {
          backgroundColor: '#374151',
          textColor: '#d1d5db',
          fontSize: 14,
          fontWeight: 'normal',
          textAlign: 'left',
          padding: 16,
          margin: 8,
          borderLeft: '4px solid #f59e0b',
          icon: '🚗'
        }
      },
      {
        id: '3',
        title: 'Service Recommendations',
        content: 'Wheel Alignment should be done:\n• After every 20,000 km\n• After any suspension parts changing\n• After changing tyres or using different size of tyres\n• After hitting footpath korb, Block or any similar things\n\nTyre Balancing and Rotation should be done:\n• All cars every 10,000 km',
        style: {
          backgroundColor: '#374151',
          textColor: '#d1d5db',
          fontSize: 14,
          fontWeight: 'normal',
          textAlign: 'left',
          padding: 16,
          margin: 8,
          borderLeft: '4px solid #10b981',
          icon: '🔧'
        }
      }
    ]
  };

  const [design, setDesign] = useState<TermsDesign>(defaultDesign);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Symbols and special characters
  const symbols = [
    { symbol: '©', name: 'Copyright' },
    { symbol: '®', name: 'Registered' },
    { symbol: '™', name: 'Trademark' },
    { symbol: '§', name: 'Section' },
    { symbol: '¶', name: 'Paragraph' },
    { symbol: '•', name: 'Bullet' },
    { symbol: '→', name: 'Arrow Right' },
    { symbol: '←', name: 'Arrow Left' },
    { symbol: '↑', name: 'Arrow Up' },
    { symbol: '↓', name: 'Arrow Down' },
    { symbol: '✓', name: 'Check' },
    { symbol: '✗', name: 'Cross' },
    { symbol: '★', name: 'Star' },
    { symbol: '⚠️', name: 'Warning' },
    { symbol: '🔧', name: 'Tools' },
    { symbol: '🚗', name: 'Car' },
    { symbol: '📋', name: 'Clipboard' },
    { symbol: '💰', name: 'Money' },
    { symbol: '📞', name: 'Phone' },
    { symbol: '📧', name: 'Email' }
  ];

  // Predefined templates
  const templates = [
    {
      name: 'Professional',
      design: {
        ...defaultDesign,
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        headerColor: '#1e40af',
        borderColor: '#e5e7eb'
      }
    },
    {
      name: 'Modern Dark',
      design: {
        ...defaultDesign,
        backgroundColor: '#0f172a',
        textColor: '#cbd5e1',
        headerColor: '#06b6d4',
        borderColor: '#334155'
      }
    },
    {
      name: 'Colorful',
      design: {
        ...defaultDesign,
        backgroundColor: '#fef3c7',
        textColor: '#92400e',
        headerColor: '#dc2626',
        borderColor: '#f59e0b'
      }
    }
  ];

  // History management
  const saveToHistory = (newDesign: TermsDesign) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newDesign)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDesign(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDesign(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(design))]);
      setHistoryIndex(0);
    }
  }, []);

  // Update design and save to history
  const updateDesign = (updates: Partial<TermsDesign>) => {
    const newDesign = { ...design, ...updates };
    setDesign(newDesign);
    saveToHistory(newDesign);
  };

  // Section management
  const addSection = () => {
    const newSection: TermsSection = {
      id: Date.now().toString(),
      title: 'New Section',
      content: 'Enter your terms and conditions here...',
      style: {
        backgroundColor: '#374151',
        textColor: '#d1d5db',
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'left',
        padding: 16,
        margin: 8,
        borderLeft: '4px solid #6b7280',
        icon: '📋'
      }
    };
    updateDesign({ sections: [...design.sections, newSection] });
  };

  const removeSection = (id: string) => {
    updateDesign({ sections: design.sections.filter(s => s.id !== id) });
    if (selectedSection === id) {
      setSelectedSection(null);
    }
  };

  const updateSection = (id: string, updates: Partial<TermsSection>) => {
    const updatedSections = design.sections.map(section =>
      section.id === id ? { ...section, ...updates } : section
    );
    updateDesign({ sections: updatedSections });
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = design.sections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < design.sections.length - 1)
    ) {
      const newSections = [...design.sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      updateDesign({ sections: newSections });
    }
  };

  // Insert symbol into content
  const insertSymbol = (symbol: string) => {
    if (selectedSection) {
      const section = design.sections.find(s => s.id === selectedSection);
      if (section) {
        updateSection(selectedSection, {
          content: section.content + symbol
        });
      }
    }
  };

  // Apply template
  const applyTemplate = (template: any) => {
    updateDesign(template.design);
  };

  // Render preview
  const renderPreview = () => {
    const layoutClass = {
      'single': 'grid-cols-1',
      'two-column': 'grid-cols-2',
      'three-column': 'grid-cols-3',
      'accordion': 'grid-cols-1',
      'tabbed': 'grid-cols-1'
    }[design.layout];

    return (
      <div 
        className={`p-${design.padding} rounded-lg border-2 grid gap-4 ${layoutClass}`}
        style={{
          backgroundColor: design.backgroundColor,
          color: design.textColor,
          borderColor: design.borderColor,
          borderRadius: `${design.borderRadius}px`,
          fontSize: `${design.fontSize}px`,
          fontFamily: design.fontFamily,
          lineHeight: design.lineHeight
        }}
      >
        {design.sections.map((section) => (
          <div
            key={section.id}
            className="transition-all duration-200"
            style={{
              backgroundColor: section.style.backgroundColor,
              color: section.style.textColor,
              fontSize: `${section.style.fontSize}px`,
              fontWeight: section.style.fontWeight,
              textAlign: section.style.textAlign as any,
              padding: `${section.style.padding}px`,
              margin: `${section.style.margin}px`,
              borderLeft: section.style.borderLeft,
              borderRadius: `${design.borderRadius}px`
            }}
          >
            <div className="flex items-center mb-2">
              {section.style.icon && (
                <span className="mr-2 text-lg">{section.style.icon}</span>
              )}
              <h4 
                className="font-semibold"
                style={{ color: design.headerColor }}
              >
                {section.title}
              </h4>
            </div>
            <div className="whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Terms & Conditions Designer</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'content', label: 'Content', icon: Type },
            { id: 'design', label: 'Design', icon: Palette },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-200px)]">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Templates */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Templates</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {templates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => applyTemplate(template)}
                        className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                      >
                        <h4 className="font-medium text-white">{template.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Pre-designed layout with {template.design.sections.length} sections
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sections Management */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Content Sections</h3>
                    <button
                      onClick={addSection}
                      className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Section
                    </button>
                  </div>

                  <div className="space-y-4">
                    {design.sections.map((section, index) => (
                      <div
                        key={section.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedSection === section.id
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-gray-600 bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                              value={section.style.icon || ''}
                              onChange={(e) => updateSection(section.id, {
                                style: { ...section.style, icon: e.target.value }
                              })}
                              className="bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">No Icon</option>
                              {symbols.map(sym => (
                                <option key={sym.symbol} value={sym.symbol}>
                                  {sym.symbol} {sym.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveSection(section.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                              title="Move Up"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveSection(section.id, 'down')}
                              disabled={index === design.sections.length - 1}
                              className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                              title="Move Down"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit Style"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeSection(section.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Remove Section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <textarea
                          value={section.content}
                          onChange={(e) => updateSection(section.id, { content: e.target.value })}
                          rows={4}
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter section content..."
                        />

                        {/* Section Style Controls */}
                        {selectedSection === section.id && (
                          <div className="mt-4 p-4 bg-gray-600 rounded-lg">
                            <h4 className="font-medium text-white mb-3">Section Styling</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Background Color</label>
                                <input
                                  type="color"
                                  value={section.style.backgroundColor}
                                  onChange={(e) => updateSection(section.id, {
                                    style: { ...section.style, backgroundColor: e.target.value }
                                  })}
                                  className="w-full h-8 rounded border border-gray-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Text Color</label>
                                <input
                                  type="color"
                                  value={section.style.textColor}
                                  onChange={(e) => updateSection(section.id, {
                                    style: { ...section.style, textColor: e.target.value }
                                  })}
                                  className="w-full h-8 rounded border border-gray-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Font Size</label>
                                <input
                                  type="range"
                                  min="10"
                                  max="24"
                                  value={section.style.fontSize}
                                  onChange={(e) => updateSection(section.id, {
                                    style: { ...section.style, fontSize: Number(e.target.value) }
                                  })}
                                  className="w-full"
                                />
                                <span className="text-xs text-gray-400">{section.style.fontSize}px</span>
                              </div>
                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Text Align</label>
                                <select
                                  value={section.style.textAlign}
                                  onChange={(e) => updateSection(section.id, {
                                    style: { ...section.style, textAlign: e.target.value }
                                  })}
                                  className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-500"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                  <option value="justify">Justify</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Symbols Panel */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Special Symbols</h3>
                  <div className="grid grid-cols-10 gap-2">
                    {symbols.map((sym, index) => (
                      <button
                        key={index}
                        onClick={() => insertSymbol(sym.symbol)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-center transition-colors"
                        title={sym.name}
                      >
                        <span className="text-lg">{sym.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6">
                {/* Layout Options */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Layout</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { id: 'single', name: 'Single Column', icon: '▌' },
                      { id: 'two-column', name: 'Two Columns', icon: '▌▌' },
                      { id: 'three-column', name: 'Three Columns', icon: '▌▌▌' },
                      { id: 'accordion', name: 'Accordion', icon: '≡' },
                      { id: 'tabbed', name: 'Tabbed', icon: '⊞' }
                    ].map(layout => (
                      <button
                        key={layout.id}
                        onClick={() => updateDesign({ layout: layout.id as any })}
                        className={`p-4 rounded-lg border-2 transition-colors text-center ${
                          design.layout === layout.id
                            ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">{layout.icon}</div>
                        <div className="text-sm">{layout.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Color Scheme</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Background Color</label>
                        <input
                          type="color"
                          value={design.backgroundColor}
                          onChange={(e) => updateDesign({ backgroundColor: e.target.value })}
                          className="w-full h-10 rounded border border-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Text Color</label>
                        <input
                          type="color"
                          value={design.textColor}
                          onChange={(e) => updateDesign({ textColor: e.target.value })}
                          className="w-full h-10 rounded border border-gray-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Header Color</label>
                        <input
                          type="color"
                          value={design.headerColor}
                          onChange={(e) => updateDesign({ headerColor: e.target.value })}
                          className="w-full h-10 rounded border border-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Border Color</label>
                        <input
                          type="color"
                          value={design.borderColor}
                          onChange={(e) => updateDesign({ borderColor: e.target.value })}
                          className="w-full h-10 rounded border border-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Typography</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Font Family</label>
                        <select
                          value={design.fontFamily}
                          onChange={(e) => updateDesign({ fontFamily: e.target.value })}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-500"
                        >
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="Times New Roman, serif">Times New Roman</option>
                          <option value="Courier New, monospace">Courier New</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Font Size: {design.fontSize}px</label>
                        <input
                          type="range"
                          min="10"
                          max="24"
                          value={design.fontSize}
                          onChange={(e) => updateDesign({ fontSize: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Line Height: {design.lineHeight}</label>
                        <input
                          type="range"
                          min="1"
                          max="2.5"
                          step="0.1"
                          value={design.lineHeight}
                          onChange={(e) => updateDesign({ lineHeight: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Padding: {design.padding}px</label>
                        <input
                          type="range"
                          min="8"
                          max="32"
                          value={design.padding}
                          onChange={(e) => updateDesign({ padding: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Border Radius</h3>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Radius: {design.borderRadius}px</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={design.borderRadius}
                      onChange={(e) => updateDesign({ borderRadius: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('content')}
                      className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modify
                    </button>
                    <button
                      onClick={() => onSave('', design)}
                      className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm
                    </button>
                  </div>
                </div>
                {renderPreview()}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {design.sections.length} sections • {activeTab} mode
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => updateDesign(defaultDesign)}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave('', design)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Design
            </button>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Full Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {renderPreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsDesigner;