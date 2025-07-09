import React from 'react';
import { Invoice, Customer } from '../types';
import { X, Download, Send, Edit, Printer } from 'lucide-react';

interface InvoiceViewProps {
  invoice: Invoice;
  customer: Customer;
  onClose: () => void;
  onEdit?: () => void;
  onSend?: () => void;
  onDownload?: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({
  invoice,
  customer,
  onClose,
  onEdit,
  onSend,
  onDownload
}) => {
  const handlePrint = () => {
    window.print();
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.1; // 10% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header Actions */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-semibold text-gray-800">Invoice Preview</h2>
          <div className="flex items-center space-x-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
            {onSend && invoice.status === 'Draft' && (
              <button
                onClick={onSend}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-8 bg-white text-gray-800" id="invoice-content">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h1>
                <div className="text-gray-600">
                  <p className="text-lg font-semibold">{invoice.number}</p>
                  <p className="text-sm">Date: {invoice.date.toLocaleDateString()}</p>
                  <p className="text-sm">Due: {invoice.dueDate.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">AccounTech Pro</h2>
                  <p className="text-gray-600">Professional Accounting Solutions</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>123 Business Avenue</p>
                  <p>Suite 100</p>
                  <p>New York, NY 10001</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: billing@accountech.com</p>
                  <p>Tax ID: 12-3456789</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-8">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>

            {/* Bill To Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-blue-600 pb-1">
                  Bill To:
                </h3>
                <div className="text-gray-700">
                  <p className="font-semibold text-lg">{customer.name}</p>
                  <p className="font-medium text-blue-600">{customer.company}</p>
                  <p className="mt-2 whitespace-pre-line">{customer.address}</p>
                  <p className="mt-2">
                    <span className="font-medium">Email:</span> {customer.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {customer.phone}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-blue-600 pb-1">
                  Invoice Details:
                </h3>
                <div className="text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Invoice Number:</span>
                    <span>{invoice.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Issue Date:</span>
                    <span>{invoice.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Due Date:</span>
                    <span className="text-red-600 font-semibold">{invoice.dueDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Payment Terms:</span>
                    <span>Net 30</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                        Description
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800 w-20">
                        Qty
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-800 w-24">
                        Rate
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-800 w-28">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          <div className="font-medium">{item.description}</div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">
                          ${item.rate.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-800">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-sm">
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (10%):</span>
                      <span className="font-medium">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-800">
                        <span>Total:</span>
                        <span className="text-blue-600">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-blue-600 pb-1">
                  Payment Information:
                </h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><span className="font-medium">Bank:</span> First National Bank</p>
                  <p><span className="font-medium">Account Name:</span> AccounTech Pro LLC</p>
                  <p><span className="font-medium">Account Number:</span> 1234567890</p>
                  <p><span className="font-medium">Routing Number:</span> 021000021</p>
                  <p><span className="font-medium">Swift Code:</span> FNBKUS33</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b-2 border-blue-600 pb-1">
                  Terms & Conditions:
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• Payment is due within 30 days of invoice date</p>
                  <p>• Late payments may incur a 1.5% monthly service charge</p>
                  <p>• All disputes must be reported within 10 days</p>
                  <p>• Services may be suspended for overdue accounts</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 pt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">
                Thank you for your business! We appreciate your prompt payment.
              </p>
              <p className="text-gray-500 text-xs">
                This invoice was generated electronically and is valid without signature.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceView;