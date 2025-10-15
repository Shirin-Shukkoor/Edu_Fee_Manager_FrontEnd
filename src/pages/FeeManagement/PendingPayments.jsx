import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner } from '../../components/ui';
import { feeService } from '../../services';

const PendingPayments = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1 });
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchPendingPayments();
  }, [filters]);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      );
      const response = await feeService.getPendingPayments(cleanFilters);
      setPendingPayments(response.data.results);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'warning',
      'OVERDUE': 'error',
      'PARTIAL': 'info',
    };
    return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>;
  };



  if (loading) return <LoadingSpinner size="lg" className="py-8" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by student name, email, course..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                handleFilter({ status: e.target.value || undefined });
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PARTIAL">Partial</option>
            </select>
            <select
              onChange={(e) => handleSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sort by...</option>
              <option value="due_date">Due Date (Oldest)</option>
              <option value="-due_date">Due Date (Newest)</option>
              <option value="remaining_amount">Amount (Low to High)</option>
              <option value="-remaining_amount">Amount (High to Low)</option>
              <option value="student_name">Student Name (A-Z)</option>
              <option value="-days_overdue">Most Overdue</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Details</TableHead>
                <TableHead>Course/Batch</TableHead>
                <TableHead>Installment #</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.student_name}</div>
                      <div className="text-sm text-gray-500">{payment.student_id}</div>
                      <div className="text-sm text-blue-600">{payment.student_email}</div>
                      <div className="text-sm text-gray-500">{payment.student_phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{payment.course_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{payment.batch_name || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{payment.installment_number}</TableCell>
                  <TableCell>{new Date(payment.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>₹{payment.amount_due}</TableCell>
                  <TableCell>₹{payment.amount_paid}</TableCell>
                  <TableCell>₹{payment.remaining_amount}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    {payment.days_overdue > 0 ? (
                      <span className="text-red-600 font-medium">{payment.days_overdue} days</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
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
    </div>
  );
};

export default PendingPayments;