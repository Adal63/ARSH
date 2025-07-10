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
  const discount = 12.38; // As per your example
  const subTotalAfterDiscount = subtotal - discount;
  const vatRate = 0.05; // 5% VAT
  const vatAmount = subTotalAfterDiscount * vatRate;
  const netTotal = subTotalAfterDiscount + vatAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
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
          <div className="p-6 bg-white text-gray-800 text-sm" id="invoice-content">
            {/* Header */}
            <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                TAX INVOICE <span className="text-lg">ف ا ت و ر ة ض ر ي ب ي ة</span>
              </h1>
            </div>

            {/* Company Info and Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              {/* Left Side - Company Info */}
              <div>
                {/* Company Logo Placeholder */}
                <div className="mb-4 flex items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center mr-4">
                    <div className="text-white font-bold text-lg">
                      <div className="text-center">
                        <div className="text-xs">ASTER</div>
                        <div className="text-xs">AUTO</div>
                        <div className="text-xs">GARAGE</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-600 mb-2">ASTER AUTO GARAGE</h2>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm space-y-1">
                    <p><strong>TRN:</strong> 100502938200003</p>
                    <p><strong>Tel. No:</strong> +971 04-3233093</p>
                    <p><strong>Mob. No:</strong> +971 568990063</p>
                    <p><strong>Address:</strong> UMMSUQUIEM ROAD, AL QUOZ INDUSTRIAL AREA 3, DUBAI, UAE</p>
                    <p><strong>Email:</strong> sales@asterautogarage.com</p>
                    <p><strong>Website:</strong> www.astergarage.ae</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Invoice Details */}
              <div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Inv. No:</strong> {invoice.number}</p>
                    <p><strong>Inv. Date:</strong> {invoice.date.toLocaleDateString()}</p>
                    <p><strong>LPO. Date:</strong> --</p>
                    <p><strong>Job No.:</strong> 25190</p>
                  </div>
                  <div>
                    <p><strong>Cust. TRN:</strong> --</p>
                    <p><strong>Next KM:</strong> 0</p>
                    <p><strong>Chasis No:</strong> --</p>
                    <p><strong>Claim No:</strong> --</p>
                    <p><strong>Ref. No:</strong> --</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer and Vehicle Info */}
            <div className="grid grid-cols-2 gap-8 mb-6 border border-gray-300 p-4">
              {/* Invoice To */}
              <div>
                <h3 className="font-bold mb-2">Invoice To:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {customer.name}</p>
                  <p><strong>Company:</strong> {customer.company}</p>
                  <p><strong>Address:</strong> {customer.address}</p>
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Phone:</strong> {customer.phone}</p>
                </div>
              </div>

              {/* Vehicle Details */}
              <div>
                <h3 className="font-bold mb-2">Vehicle Details:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Vehicle Make:</strong> BMW/840I/0</p>
                  <p><strong>Vehicle No:</strong> M 16969/DXB</p>
                  <p><strong>Kilometers:</strong> 12920</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-400 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-2 py-2 text-left">Total Qty</th>
                    <th className="border border-gray-400 px-2 py-2 text-left">Parts Description</th>
                    <th className="border border-gray-400 px-2 py-2 text-left">Labour</th>
                    <th className="border border-gray-400 px-2 py-2 text-right">Unit Price</th>
                    <th className="border border-gray-400 px-2 py-2 text-right">Tax Amount</th>
                    <th className="border border-gray-400 px-2 py-2 text-center">VAT %</th>
                    <th className="border border-gray-400 px-2 py-2 text-right">After VAT Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-2 py-2">2</td>
                    <td className="border border-gray-400 px-2 py-2">PIRELLI 245/35R20 95Y PZERO PZ4 RFT* 0925*2</td>
                    <td className="border border-gray-400 px-2 py-2">0.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">1180.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">2360.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">5%</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">2477.76</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-2">2</td>
                    <td className="border border-gray-400 px-2 py-2">PIRELLI 275/30R20 97Y PZERO PZ4 RFT* 1325*2</td>
                    <td className="border border-gray-400 px-2 py-2">0.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">1350.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">2700.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">5%</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">2834.72</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-2">1</td>
                    <td className="border border-gray-400 px-2 py-2">FRONT & REAR WHEEL ALIGNMENT</td>
                    <td className="border border-gray-400 px-2 py-2">200.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">200.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">200.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">5%</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">209.98</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-2">2</td>
                    <td className="border border-gray-400 px-2 py-2">RIM REPAIR</td>
                    <td className="border border-gray-400 px-2 py-2">0.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">400.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">800.00</td>
                    <td className="border border-gray-400 px-2 py-2 text-center">5%</td>
                    <td className="border border-gray-400 px-2 py-2 text-right">839.92</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals and Payment */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              {/* Left Side - Totals */}
              <div>
                <div className="border border-gray-400 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>TOTAL:</span>
                      <span className="font-bold">6060.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labour Charge:</span>
                      <span>0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spare Parts:</span>
                      <span>6060.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DISCOUNT:</span>
                      <span>12.38</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>SUB TOTAL:</span>
                      <span className="font-bold">6047.62</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (5%):</span>
                      <span>302.38</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold">NET TOTAL:</span>
                      <span className="font-bold">6350.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CREDIT BALANCE:</span>
                      <span>0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Payment Details */}
              <div>
                <div className="border border-gray-400 p-4 mb-4">
                  <h4 className="font-bold mb-2">Payment Details:</h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-1">Receipt No</th>
                        <th className="border border-gray-300 px-2 py-1">Pay Method</th>
                        <th className="border border-gray-300 px-2 py-1">Amount</th>
                        <th className="border border-gray-300 px-2 py-1">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1">12163</td>
                        <td className="border border-gray-300 px-2 py-1">Credit Card</td>
                        <td className="border border-gray-300 px-2 py-1">6350.00</td>
                        <td className="border border-gray-300 px-2 py-1">06-07-2025 18:04:33</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border border-gray-400 p-4">
                  <h4 className="font-bold mb-2">Bank Details:</h4>
                  <div className="text-xs space-y-1">
                    <p><strong>Bank:</strong> EMIRATES ISLAMIC BANK</p>
                    <p><strong>Account Name:</strong> ASTER AUTO GARAGE</p>
                    <p><strong>A/C No:</strong> 3708440789901</p>
                    <p><strong>IBAN:</strong> AE510340003708440789901</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="mb-6">
              <div className="border border-gray-400 p-4">
                <h4 className="font-bold mb-2">Remarks:</h4>
                <p className="text-xs">Service completed as per customer requirements.</p>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-6">
              <h4 className="font-bold mb-2">Terms & Conditions:</h4>
              <div className="text-xs space-y-1">
                <p>1. All tyres & Batteries warranty against manufacturing defects by Agency only. (Please Bring Original Invoice for warranty claim)</p>
                <p>2. There is no warranty for any spare parts Items.</p>
                <p>3. While leaving the vehicle in our garage for service, kindly remove all your important & valuable items from your vehicle. Therefore if any claim the company is not responsible.</p>
                <p>4. After Completion of work, we request Customer to collect the Vehicle within 2 days. Otherwise company is not responsible for any damages or claim and also when you receive back the vehicle. Please check properly and confirm everything is ok. If any problem kindly notify Immediately otherwise company is not responsible for any claim further.</p>
              </div>
            </div>

            {/* Service Recommendations */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold mb-2">Wheel Alignment should be done:</h4>
                  <ul className="space-y-1">
                    <li>1. After every 20,000 km</li>
                    <li>2. After any suspension parts changing</li>
                    <li>3. After changing tyres or using different size of tyres</li>
                    <li>4. After hitting footpath korb, Block or any similar things</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Tyre Balancing and Rotation should be done:</h4>
                  <p>All cars every 10,000 km</p>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-8">
                  <p className="text-sm font-bold">Customer Sign</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-8">
                  <p className="text-sm font-bold">For: ASTER AUTO GARAGE</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-xs text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Created By:</strong> Althaf</p>
                  <p><strong>Modified By:</strong> Althaf</p>
                </div>
                <div className="text-right">
                  <p>Generated on: {new Date().toLocaleString()}</p>
                </div>
              </div>
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