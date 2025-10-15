import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner, Modal } from '../../components/ui';
import SearchAndFilter from '../../components/ui/SearchAndFilter';
import { feeService, studentService } from '../../services';
import PaymentForm from '../../components/forms/PaymentForm';
import ReceiptModal from '../../components/ReceiptModal';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filters, setFilters] = useState({ page: 1 });
  const [searchValue, setSearchValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      );
      const response = await feeService.getPayments(cleanFilters);
      setPayments(response.data.results);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getActiveStudents({ no_pagination: true });
      setStudents(response.data.results);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSearch = useCallback((value) => {
    setSearchValue(value);
    setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value || undefined, page: 1 }));
    }, 500);
  }, []);

  const handleFilter = useCallback((filterObj) => {
    setFilters(prev => ({ ...prev, ...filterObj, page: 1 }));
  }, []);

  const handleSort = useCallback((sortValue) => {
    setFilters(prev => ({ ...prev, ordering: sortValue || undefined, page: 1 }));
  }, []);

  const filterOptions = [
    {
      key: 'payment_mode',
      placeholder: 'All Payment Methods',
      options: [
        { value: 'CASH', label: 'Cash' },
        { value: 'ONLINE', label: 'Online' },
        { value: 'CHEQUE', label: 'Cheque' },
        { value: 'CARD', label: 'Card' },
        { value: 'UPI', label: 'UPI' },
        { value: 'BANK_TRANSFER', label: 'Bank Transfer' }
      ]
    },
    {
      key: 'student',
      placeholder: 'All Students',
      options: students.map(student => ({ 
        value: student.id, 
        label: `${student.full_name} (${student.student_id})` 
      }))
    }
  ];

  const sortOptions = [
    { value: 'payment_date', label: 'Payment Date (Oldest)' },
    { value: '-payment_date', label: 'Payment Date (Newest)' },
    { value: 'amount_paid', label: 'Amount (Low to High)' },
    { value: '-amount_paid', label: 'Amount (High to Low)' },
    { value: 'student__full_name', label: 'Student Name (A-Z)' },
    { value: 'receipt_number', label: 'Receipt Number' }
  ];

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

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setEditFormData({
      amount_paid: payment.amount_paid,
      payment_mode: payment.payment_mode,
      payment_date: payment.payment_date,
      notes: payment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeService.updatePayment(editingPayment.id, editFormData);
      setShowEditModal(false);
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await feeService.deletePayment(paymentId);
        fetchPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
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
          <SearchAndFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
            filters={filterOptions}
            sortOptions={sortOptions}
            searchPlaceholder="Search by student name, receipt number, notes..."
            searchValue={searchValue}
            currentFilters={{ payment_mode: filters.payment_mode, student: filters.student }}
            currentSort={filters.ordering || ''}
          />

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
                      <button 
                        onClick={() => handleEdit(payment)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleViewReceipt(payment)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Receipt
                      </button>
                      <button 
                        onClick={() => handleDelete(payment.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
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
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
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

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        payment={selectedPayment}
      />

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Payment"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
            <input
              type="number"
              value={editFormData.amount_paid || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, amount_paid: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
            <select
              value={editFormData.payment_mode || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, payment_mode: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="CASH">Cash</option>
              <option value="ONLINE">Online</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Date</label>
            <input
              type="date"
              value={editFormData.payment_date || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, payment_date: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={editFormData.notes || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentList;