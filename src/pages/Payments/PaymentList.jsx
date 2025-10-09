import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner, Modal } from '../../components/ui';
import { feeService } from '../../services';
import PaymentForm from '../../components/forms/PaymentForm';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    payment_mode: '',
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await feeService.getPayments(filters);
      setPayments(response.data.results);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentModeBadge = (mode) => {
    const modeMap = {
      'CASH': 'success',
      'ONLINE': 'info',
      'CHEQUE': 'warning',
      'CARD': 'info',
      'UPI': 'success',
      'BANK_TRANSFER': 'warning',
    };
    return <Badge variant={modeMap[mode] || 'default'}>{mode}</Badge>;
  };

  const handleCreatePayment = async (paymentData) => {
    try {
      await feeService.createPayment(paymentData);
      setShowPaymentModal(false);
      fetchPayments();
    } catch (error) {
      throw error;
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="py-8" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment Records</CardTitle>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Payment
          </button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search payments..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.payment_mode}
              onChange={(e) => setFilters({ ...filters, payment_mode: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Methods</option>
              <option value="CASH">Cash</option>
              <option value="ONLINE">Online</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No.</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Installment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">{payment.receipt_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.student_name}</div>
                      <div className="text-sm text-gray-500">{payment.student_id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₹{payment.amount_paid}</TableCell>
                  <TableCell>{getPaymentModeBadge(payment.payment_mode)}</TableCell>
                  <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell>#{payment.installment_number}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      <button className="text-green-600 hover:text-green-800 text-sm">Receipt</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination.total_pages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={(page) => setFilters({ ...filters, page })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Add New Payment"
        size="lg"
      >
        <PaymentForm
          onSubmit={handleCreatePayment}
          onCancel={() => setShowPaymentModal(false)}
        />
      </Modal>
    </div>
  );
};

export default PaymentList;