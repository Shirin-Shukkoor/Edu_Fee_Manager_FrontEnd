import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner } from '../../components/ui';
import { feeService } from '../../services';

const PendingPayments = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1 });

  useEffect(() => {
    fetchPendingPayments();
  }, [filters]);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await feeService.getPendingPayments(filters);
      setPendingPayments(response.data.results);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
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
                      <div className="font-medium">{payment.fee?.student_name}</div>
                      <div className="text-sm text-gray-500">{payment.fee?.student_id}</div>
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
                onPageChange={(page) => setFilters({ ...filters, page })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingPayments;