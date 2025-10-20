import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner, Modal } from '../../components/ui';
import SearchAndFilter from '../../components/ui/SearchAndFilter';
import { feeService, studentService } from '../../services';
import PaymentModal from '../../components/modals/PaymentModal';
import ReceiptModal from '../../components/ReceiptModal';

const PaymentRecords = () => {
  const [activeTab, setActiveTab] = useState('installments');
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filters, setFilters] = useState({ page: 1 });
  const [searchValue, setSearchValue] = useState('');

  const tabs = [
    { id: 'installments', label: 'Installments', type: 'INSTALLMENT' },
    { id: 'quick-payments', label: 'Quick Payments', type: 'QUICK_PAYMENT' },
    { id: 'registration-fees', label: 'Registration Fees', type: 'REGISTRATION' }
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [activeTab, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const currentTab = tabs.find(tab => tab.id === activeTab);
      const cleanFilters = Object.fromEntries(
        Object.entries({ ...filters, payment_type: currentTab.type }).filter(([_, value]) => value !== '' && value !== null)
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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFilters({ page: 1 });
    setSearchValue('');
  };

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
    { value: '-payment_date', label: 'Payment Date (Newest)' },
    { value: 'payment_date', label: 'Payment Date (Oldest)' },
    { value: '-amount_paid', label: 'Amount (High to Low)' },
    { value: 'amount_paid', label: 'Amount (Low to High)' },
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

  const renderTableContent = () => {
    if (activeTab === 'installments') {
      return (
        <>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No.</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Installment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Payment Date</TableHead>
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
                <TableCell>#{payment.installment_number}</TableCell>
                <TableCell className="font-medium">₹{payment.amount_paid}</TableCell>
                <TableCell>{getPaymentModeBadge(payment.payment_mode)}</TableCell>
                <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
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
        </>
      );
    }

    return (
      <>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt No.</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Mode</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Notes</TableHead>
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
              <TableCell className="max-w-xs truncate">{payment.notes || '-'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
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
      </>
    );
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
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

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
            {renderTableContent()}
          </Table>

          {payments.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} found
            </div>
          )}

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

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleCreatePayment}
        defaultPaymentType={tabs.find(tab => tab.id === activeTab)?.type}
      />

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default PaymentRecords;