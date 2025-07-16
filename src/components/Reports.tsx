import React, { useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, Activity, Target, AlertTriangle, DollarSign } from 'lucide-react';

const Reports: React.FC = () => {
  const { 
    accounts, 
    getTotalAssets, 
    getTotalLiabilities, 
    getTotalEquity, 
    getTotalRevenue, 
    getTotalExpenses, 
    getNetIncome,
    customers,
    invoices,
    transactions
  } = useAccounting();
  
  const [selectedReport, setSelectedReport] = useState('balance-sheet');
  const [reportPeriod, setReportPeriod] = useState('current');
  const [reportCategory, setReportCategory] = useState('financial');

  const financialReports = [
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      description: 'Statement of Financial Position (IFRS compliant)',
      icon: FileText,
      category: 'Core Financial'
    },
    {
      id: 'income-statement',
      name: 'Income Statement',
      description: 'Profit and Loss Statement (IFRS compliant)',
      icon: TrendingUp,
      category: 'Core Financial'
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Statement of Cash Flows (IFRS compliant)',
      icon: Activity,
      category: 'Core Financial'
    },
    {
      id: 'equity-changes',
      name: 'Statement of Changes in Equity',
      description: 'Changes in shareholders equity',
      icon: BarChart3,
      category: 'Core Financial'
    },
    {
      id: 'notes-financial',
      name: 'Notes to Financial Statements',
      description: 'Detailed notes and disclosures',
      icon: FileText,
      category: 'Disclosure'
    },
    {
      id: 'auditor-report',
      name: 'Auditor\'s Report',
      description: 'Independent auditor\'s opinion',
      icon: FileText,
      category: 'Audit'
    },
    {
      id: 'mda',
      name: 'Management Discussion & Analysis',
      description: 'MD&A report for stakeholders',
      icon: FileText,
      category: 'Management'
    },
    {
      id: 'segment-reporting',
      name: 'Segment Reporting',
      description: 'Business and geographical segments',
      icon: PieChart,
      category: 'Disclosure'
    },
    {
      id: 'related-party',
      name: 'Related Party Transactions',
      description: 'Related party disclosures',
      icon: FileText,
      category: 'Disclosure'
    },
    {
      id: 'compliance-standards',
      name: 'Compliance with Accounting Standards',
      description: 'IFRS compliance report',
      icon: FileText,
      category: 'Compliance'
    }
  ];

  const managementReports = [
    {
      id: 'budget-reports',
      name: 'Budget Reports',
      description: 'Annual and departmental budgets',
      icon: Target,
      category: 'Planning'
    },
    {
      id: 'forecast-reports',
      name: 'Forecast Reports',
      description: 'Financial forecasting and projections',
      icon: TrendingUp,
      category: 'Planning'
    },
    {
      id: 'variance-analysis',
      name: 'Variance Analysis Reports',
      description: 'Budget vs actual variance analysis',
      icon: BarChart3,
      category: 'Analysis'
    },
    {
      id: 'management-accounts',
      name: 'Management Accounts',
      description: 'Internal management accounting reports',
      icon: FileText,
      category: 'Internal'
    },
    {
      id: 'kpi-dashboards',
      name: 'KPI Dashboards',
      description: 'Key performance indicators dashboard',
      icon: Activity,
      category: 'Performance'
    },
    {
      id: 'operational-performance',
      name: 'Operational Performance Reports',
      description: 'Operational efficiency metrics',
      icon: BarChart3,
      category: 'Performance'
    },
    {
      id: 'strategic-planning',
      name: 'Strategic Planning Reports',
      description: 'Long-term strategic analysis',
      icon: Target,
      category: 'Strategic'
    },
    {
      id: 'capex-reports',
      name: 'Capital Expenditure Reports',
      description: 'CAPEX analysis and tracking',
      icon: DollarSign,
      category: 'Investment'
    },
    {
      id: 'risk-management',
      name: 'Risk Management Reports',
      description: 'Risk assessment and mitigation',
      icon: AlertTriangle,
      category: 'Risk'
    },
    {
      id: 'cost-analysis',
      name: 'Cost Analysis Reports',
      description: 'Detailed cost breakdown analysis',
      icon: PieChart,
      category: 'Analysis'
    },
    {
      id: 'sales-reports',
      name: 'Sales Reports',
      description: 'Sales performance and trends',
      icon: TrendingUp,
      category: 'Sales'
    },
    {
      id: 'departmental-performance',
      name: 'Departmental Performance Reports',
      description: 'Department-wise performance metrics',
      icon: BarChart3,
      category: 'Performance'
    },
    {
      id: 'project-financial',
      name: 'Project Financial Reports',
      description: 'Project-wise financial analysis',
      icon: FileText,
      category: 'Project'
    },
    {
      id: 'breakeven-analysis',
      name: 'Breakeven Analysis',
      description: 'Breakeven point calculations',
      icon: Target,
      category: 'Analysis'
    },
    {
      id: 'scenario-analysis',
      name: 'Scenario/Sensitivity Analysis',
      description: 'What-if scenario modeling',
      icon: Activity,
      category: 'Analysis'
    },
    {
      id: 'monthly-quarterly',
      name: 'Monthly/Quarterly Management Reports',
      description: 'Regular management reporting',
      icon: Calendar,
      category: 'Regular'
    },
    {
      id: 'trend-analysis',
      name: 'Trend Analysis Reports',
      description: 'Historical trend analysis',
      icon: TrendingUp,
      category: 'Analysis'
    },
    {
      id: 'ratio-analysis',
      name: 'Ratio Analysis Reports',
      description: 'Financial ratio calculations',
      icon: BarChart3,
      category: 'Analysis'
    },
    {
      id: 'esg-csr',
      name: 'ESG/CSR Reports',
      description: 'Environmental, Social & Governance reports',
      icon: FileText,
      category: 'Sustainability'
    },
    {
      id: 'internal-audit',
      name: 'Internal Audit Reports',
      description: 'Internal audit findings and recommendations',
      icon: FileText,
      category: 'Audit'
    },
    {
      id: 'cash-management',
      name: 'Cash Management Reports',
      description: 'Cash flow and liquidity management',
      icon: DollarSign,
      category: 'Treasury'
    },
    {
      id: 'business-review',
      name: 'Business Review Reports',
      description: 'Comprehensive business performance review',
      icon: FileText,
      category: 'Review'
    }
  ];

  const allReports = reportCategory === 'financial' ? financialReports : managementReports;

  const renderBalanceSheet = () => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Balance Sheet</h2>
        <p className="text-gray-400">As of {new Date().toLocaleDateString()}</p>
        <p className="text-sm text-gray-500 mt-1">IFRS Compliant</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
            ASSETS
          </h3>
          <div className="space-y-3">
            <div className="text-blue-400 font-medium">Current Assets</div>
            {accounts.filter(acc => acc.type === 'Asset' && acc.category === 'Current Assets').map(account => (
              <div key={account.id} className="flex justify-between pl-4">
                <span className="text-gray-300">{account.name}</span>
                <span className="text-white">AED {account.balance.toLocaleString()}</span>
              </div>
            ))}
            
            <div className="text-blue-400 font-medium mt-6">Non-Current Assets</div>
            {accounts.filter(acc => acc.type === 'Asset' && acc.category === 'Fixed Assets').map(account => (
              <div key={account.id} className="flex justify-between pl-4">
                <span className="text-gray-300">{account.name}</span>
                <span className="text-white">AED {account.balance.toLocaleString()}</span>
              </div>
            ))}
            
            <div className="border-t border-gray-600 pt-2 mt-4">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total Assets</span>
                <span className="text-green-400">AED {getTotalAssets().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liabilities and Equity */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">
            LIABILITIES AND EQUITY
          </h3>
          <div className="space-y-3">
            <div className="text-red-400 font-medium">Current Liabilities</div>
            {accounts.filter(acc => acc.type === 'Liability' && acc.category === 'Current Liabilities').map(account => (
              <div key={account.id} className="flex justify-between pl-4">
                <span className="text-gray-300">{account.name}</span>
                <span className="text-white">AED {account.balance.toLocaleString()}</span>
              </div>
            ))}
            
            <div className="text-blue-400 font-medium mt-6">Equity</div>
            {accounts.filter(acc => acc.type === 'Equity').map(account => (
              <div key={account.id} className="flex justify-between pl-4">
                <span className="text-gray-300">{account.name}</span>
                <span className="text-white">AED {account.balance.toLocaleString()}</span>
              </div>
            ))}
            
            <div className="border-t border-gray-600 pt-2 mt-4">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total Liabilities and Equity</span>
                <span className="text-green-400">AED {(getTotalLiabilities() + getTotalEquity()).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIncomeStatement = () => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Income Statement</h2>
        <p className="text-gray-400">For the period ending {new Date().toLocaleDateString()}</p>
        <p className="text-sm text-gray-500 mt-1">IFRS Compliant</p>
      </div>
      
      <div className="space-y-4">
        <div className="text-green-400 font-medium">Revenue</div>
        {accounts.filter(acc => acc.type === 'Revenue').map(account => (
          <div key={account.id} className="flex justify-between pl-4">
            <span className="text-gray-300">{account.name}</span>
            <span className="text-white">AED {account.balance.toLocaleString()}</span>
          </div>
        ))}
        
        <div className="border-t border-gray-600 pt-2">
          <div className="flex justify-between font-semibold">
            <span className="text-white">Total Revenue</span>
            <span className="text-green-400">AED {getTotalRevenue().toLocaleString()}</span>
          </div>
        </div>
        
        <div className="text-orange-400 font-medium mt-6">Expenses</div>
        {accounts.filter(acc => acc.type === 'Expense').map(account => (
          <div key={account.id} className="flex justify-between pl-4">
            <span className="text-gray-300">{account.name}</span>
            <span className="text-white">AED {account.balance.toLocaleString()}</span>
          </div>
        ))}
        
        <div className="border-t border-gray-600 pt-2">
          <div className="flex justify-between font-semibold">
            <span className="text-white">Total Expenses</span>
            <span className="text-red-400">AED {getTotalExpenses().toLocaleString()}</span>
          </div>
        </div>
        
        <div className="border-t-2 border-gray-600 pt-4 mt-6">
          <div className="flex justify-between font-bold text-lg">
            <span className="text-white">Net Income</span>
            <span className={getNetIncome() >= 0 ? 'text-green-400' : 'text-red-400'}>
              AED {getNetIncome().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderManagementReport = () => {
    const selectedReportData = managementReports.find(r => r.id === selectedReport);
    
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">{selectedReportData?.name}</h2>
          <p className="text-gray-400">{selectedReportData?.description}</p>
          <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample KPI Cards for Management Reports */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Revenue Growth</h4>
            <div className="text-2xl font-bold text-green-400">+15.2%</div>
            <p className="text-sm text-gray-400">vs previous period</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Cost Efficiency</h4>
            <div className="text-2xl font-bold text-blue-400">92.3%</div>
            <p className="text-sm text-gray-400">operational efficiency</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Customer Satisfaction</h4>
            <div className="text-2xl font-bold text-purple-400">4.7/5</div>
            <p className="text-sm text-gray-400">average rating</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-white font-semibold mb-3">Key Insights</h4>
          <ul className="space-y-2 text-gray-300">
            <li>• Revenue has shown consistent growth over the past quarter</li>
            <li>• Operating expenses are within budget parameters</li>
            <li>• Customer acquisition costs have decreased by 8%</li>
            <li>• Market share has increased in key segments</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderReport = () => {
    if (reportCategory === 'financial') {
      switch (selectedReport) {
        case 'balance-sheet':
          return renderBalanceSheet();
        case 'income-statement':
          return renderIncomeStatement();
        default:
          return renderBalanceSheet();
      }
    } else {
      return renderManagementReport();
    }
  };

  const getReportsByCategory = (reports: any[], category: string) => {
    return reports.filter(report => report.category === category);
  };

  const categories = reportCategory === 'financial' 
    ? ['Core Financial', 'Disclosure', 'Audit', 'Management', 'Compliance']
    : ['Planning', 'Analysis', 'Performance', 'Strategic', 'Investment', 'Risk', 'Sales', 'Project', 'Regular', 'Sustainability', 'Audit', 'Treasury', 'Review', 'Internal'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">IFRS Financial & Management Reports</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <Download className="w-5 h-5 mr-2" />
          Export PDF
        </button>
      </div>

      {/* Report Category Selection */}
      <div className="flex space-x-4">
        <button
          onClick={() => setReportCategory('financial')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            reportCategory === 'financial'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Financial Reports ({financialReports.length})
        </button>
        <button
          onClick={() => setReportCategory('management')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            reportCategory === 'management'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Management Reports ({managementReports.length})
        </button>
      </div>

      {/* Report Selection by Category */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryReports = getReportsByCategory(allReports, category);
          if (categoryReports.length === 0) return null;
          
          return (
            <div key={category}>
              <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-600 pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryReports.map((report) => {
                  const Icon = report.icon;
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`p-4 rounded-lg border transition-colors text-left ${
                        selectedReport === report.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <h4 className="font-semibold text-sm">{report.name}</h4>
                      <p className="text-xs opacity-75 mt-1">{report.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Period Selection */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-gray-300">Period:</span>
        </div>
        <select
          value={reportPeriod}
          onChange={(e) => setReportPeriod(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="current">Current Period</option>
          <option value="previous">Previous Period</option>
          <option value="ytd">Year to Date</option>
          <option value="quarterly">Quarterly</option>
          <option value="annual">Annual</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Report Content */}
      {renderReport()}

      {/* Report Summary */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {reportCategory === 'financial' ? financialReports.length : managementReports.length}
            </div>
            <div className="text-gray-400">Available Reports</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {categories.length}
            </div>
            <div className="text-gray-400">Report Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              IFRS
            </div>
            <div className="text-gray-400">Compliance Standard</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;