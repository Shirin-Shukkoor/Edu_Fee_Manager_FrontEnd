import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, LoadingSpinner, Pagination } from '../../components/ui';
import { feeService, studentService } from '../../services';

const StudentInstallments = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [feeRecord, setFeeRecord] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStudentData();
  }, [studentId, page]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student details
      const studentResponse = await studentService.getStudent(studentId);
      setStudent(studentResponse.data.data);
      
      // Fetch fee management record
      const feeResponse = await feeService.getFeeManagementByStudent(studentId);
      if (feeResponse.data.data) {
        setFeeRecord(feeResponse.data.data);
        
        // Fetch installments
        const installmentsResponse = await feeService.getFeeManagementInstallments(feeResponse.data.data.id, { page });
        setInstallments(installmentsResponse.data.results);
        setPagination(installmentsResponse.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'warning',
      'PAID': 'success',
      'OVERDUE': 'error',
      'PARTIAL': 'info',
    };
    return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>;
  };

  if (loading) return <LoadingSpinner size="lg" className="py-8" />;

  if (!student) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900">Student not found</h2>
        <Link to="/students" className="text-blue-600 hover:text-blue-800">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Details</CardTitle>
            <Link
              to="/students"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Students
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{student.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Student ID</p>
              <p className="font-medium">{student.student_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{student.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Course</p>
              <p className="font-medium">{student.course_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Summary */}
      {feeRecord && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">₹{feeRecord.amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Discount</p>
                <p className="text-xl font-bold text-green-600">₹{feeRecord.discount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Net Amount</p>
                <p className="text-xl font-bold text-blue-600">₹{feeRecord.net_amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Type</p>
                <p className="text-xl font-bold text-purple-600">{feeRecord.payment_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Installments */}
      <Card>
        <CardHeader>
          <CardTitle>Installments</CardTitle>
        </CardHeader>
        <CardContent>
          {installments.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Days Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((installment) => (
                    <TableRow key={installment.id}>
                      <TableCell className="font-medium">{installment.installment_number}</TableCell>
                      <TableCell>{new Date(installment.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>₹{installment.amount_due}</TableCell>
                      <TableCell>₹{installment.amount_paid}</TableCell>
                      <TableCell>₹{installment.remaining_amount}</TableCell>
                      <TableCell>{getStatusBadge(installment.status)}</TableCell>
                      <TableCell>
                        {installment.days_overdue > 0 ? (
                          <span className="text-red-600 font-medium">{installment.days_overdue} days</span>
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
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {feeRecord ? 'No installments found' : 'No fee record found for this student'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentInstallments;