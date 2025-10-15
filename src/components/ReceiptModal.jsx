import { Modal } from './ui';

const ReceiptModal = ({ isOpen, onClose, payment }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${payment?.receipt_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            * { box-sizing: border-box; }
            .max-w-sm { max-width: 24rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .border { border: 1px solid #d1d5db; }
            .border-gray-300 { border-color: #d1d5db; }
            .relative { position: relative; }
            .bg-gray-50 { background-color: #f9fafb; }
            .p-3 { padding: 0.75rem; }
            .border-b { border-bottom: 1px solid #d1d5db; }
            .flex { display: flex; }
            .items-start { align-items: flex-start; }
            .justify-between { justify-content: space-between; }
            .flex-1 { flex: 1; }
            .text-lg { font-size: 1.125rem; }
            .font-bold { font-weight: bold; }
            .text-gray-800 { color: #1f2937; }
            .mb-1 { margin-bottom: 0.25rem; }
            .text-xs { font-size: 0.75rem; }
            .text-gray-600 { color: #4b5563; }
            .leading-tight { line-height: 1.25; }
            .ml-3 { margin-left: 0.75rem; }
            .w-12 { width: 3rem; }
            .h-12 { height: 3rem; }
            .object-contain { object-fit: contain; }
            .bg-blue-500 { background-color: #3b82f6; }
            .text-white { color: white; }
            .p-2 { padding: 0.5rem; }
            .text-center { text-align: center; }
            .text-sm { font-size: 0.875rem; }
            .absolute { position: absolute; }
            .top-20 { top: 5rem; }
            .right-3 { right: 0.75rem; }
            .text-right { text-align: right; }
            .text-red-600 { color: #dc2626; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .font-semibold { font-weight: 600; }
            .border-dotted { border-style: dotted; }
            .border-gray-400 { border-color: #9ca3af; }
            .pb-1 { padding-bottom: 0.25rem; }
            .mt-1 { margin-top: 0.25rem; }
            .border-2 { border-width: 2px; }
            .border-gray-800 { border-color: #1f2937; }
            .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
            .w-24 { width: 6rem; }
            .bottom-20 { bottom: 5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .pb-6 { padding-bottom: 1.5rem; }
            .mt-8 { margin-top: 2rem; }
            .left-3 { left: 0.75rem; }
            .bottom-16 { bottom: 4rem; }
            .w-16 { width: 4rem; }
            .h-16 { height: 4rem; }
            .rounded-full { border-radius: 50%; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .text-gray-500 { color: #6b7280; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  if (!payment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" size="md">
      <div className="space-y-4">
        <div id="receipt-content" className="bg-white">
          <div className="max-w-sm mx-auto border border-gray-300 relative">
            {/* Header with Logo and Company Info */}
            <div className="bg-gray-50 p-3 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-800 mb-1">Codeme</div>
                  <div className="text-xs text-gray-600 leading-tight">
                    50 Ft Rd, Gali Gearing<br/>
                    Hithe Business Park, Hithe Bay<br/>
                    Calicut, Kerala 673 Hithe Bay<br/>
                    Mobile: 6253 635 900, 995 623 719
                  </div>
                </div>
                <div className="ml-3">
                  <img 
                    src="/images/logo.png" 
                    alt="Logo" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Blue stripe with Fee Receipt */}
            <div className="bg-blue-500 text-white p-2 text-center font-bold text-sm">
              Fee Receipt
            </div>

            {/* Receipt Number - Top Right */}
            <div className="absolute top-20 right-3 text-right text-sm">
              <div className="text-red-600 font-bold text-lg">{payment.receipt_number.split('-')[1] || '768'}</div>
            </div>

            {/* Main Content */}
            <div className="p-3 text-sm">
              {/* Left side content */}
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Name:</span>
                  <div className="border-b border-dotted border-gray-400 pb-1 mt-1">
                    {payment.student_name}
                  </div>
                </div>
                
                <div>
                  <span className="font-semibold">Address:</span>
                  <div className="border-b border-dotted border-gray-400 pb-1 mt-1">
                    -
                  </div>
                </div>
                
                <div>
                  <span className="font-semibold">Course:</span>
                  <div className="border-b border-dotted border-gray-400 pb-1 mt-1">
                    -
                  </div>
                </div>
                
                <div>
                  <span className="font-semibold">Fee Received Rs.:</span>
                  <div className="border-b border-dotted border-gray-400 pb-1 mt-1">
                    -
                  </div>
                </div>

                {/* Amount Box */}
                <div className="border-2 border-gray-800 p-2 text-center my-4 w-24">
                  <div className="font-bold">₹{payment.amount_paid}/-</div>
                </div>

                <div>
                  <span className="font-semibold">Towards:</span>
                  <div className="border-b border-dotted border-gray-400 pb-1 mt-1">
                    Course Fee
                  </div>
                </div>
                
                <div>
                  <span className="font-semibold">Amount:</span>
                  <div className="border-b border-dotted border-gray-400 pb-1 mt-1">
                    ₹{payment.amount_paid}/-
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Info */}
            <div className="absolute bottom-20 right-3 text-right text-xs">
              <div className="mb-3">
                <div className="font-semibold">Date:</div>
                <div>{new Date(payment.payment_date).toLocaleDateString('en-GB')}</div>
              </div>
              <div>
                <div className="font-semibold">Ref. No.:</div>
                <div>-</div>
              </div>
            </div>

            {/* Signature */}
            <div className="p-3 pb-6">
              <div className="mt-8">
                <div className="border-b border-gray-800 w-24 mb-1"></div>
                <div className="text-xs">Signature</div>
              </div>
            </div>

            {/* Seal placeholder */}
            <div className="absolute left-3 bottom-16">
              <div className="w-16 h-16 border-2 border-gray-400 rounded-full flex items-center justify-center text-xs text-gray-500">
                SEAL
              </div>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-center space-x-3 pt-4 border-t">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;