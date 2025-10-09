import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner, Modal } from '../../components/ui';
import { feeService } from '../../services';
import { useNavigate } from 'react-router-dom';
import FeeManagementForm from '../../components/forms/FeeManagementForm';

const FeeManagementList = () => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    payment_status: '',
  });

  useEffect(() => {
    fetchFeeRecords();
  }, [filters]);

  const fetchFeeRecords = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      );
      const response = await feeService.getFeeManagement(cleanFilters);
      setFeeRecords(response.data.results);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching fee records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeeRecord = async (feeData) => {
    try {
      await feeService.createFeeManagement(feeData);
      setShowModal(false);
      fetchFeeRecords();
    } catch (error) {
      throw error;
    }
  };

  const handleStudentDetail = (studentId) => {
    navigate(`/students/${studentId}/installments`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'warning',
      'Partially Paid': 'info',
      'Fully Paid': 'success',
      'Overdue': 'error',
    };
    return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>;
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusFilter = (e) => {
    setFilters({ ...filters, payment_status: e.target.value, page: 1 });
  };

  if (loading) return <LoadingSpinner size="lg" className="py-8" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fee Management</CardTitle>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Fee Record
          </button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search students..."
              value={filters.search}
              onChange={handleSearch}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.payment_status}
              onChange={handleStatusFilter}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partially Paid</option>
              <option value="paid">Fully Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.student_name}</div>
                      <div className="text-sm text-gray-500">{record.student_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.course_name}</div>
                      <div className="text-sm text-gray-500">{record.batch_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>₹{record.amount}</TableCell>
                  <TableCell>₹{record.discount}</TableCell>
                  <TableCell className="font-medium">₹{record.net_amount}</TableCell>
                  <TableCell>{record.payment_type}</TableCell>
                  <TableCell>{getStatusBadge(record.payment_status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      <button 
                        onClick={() => handleStudentDetail(record.student)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Installments
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
                onPageChange={(page) => setFilters({ ...filters, page })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Fee Record"
        size="lg"
      >
        <FeeManagementForm
          onSubmit={handleCreateFeeRecord}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default FeeManagementList;