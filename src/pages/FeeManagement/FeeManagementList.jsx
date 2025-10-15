import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner, Modal } from '../../components/ui';
import SearchAndFilter from '../../components/ui/SearchAndFilter';
import { feeService, courseService, batchService } from '../../services';
import { useNavigate } from 'react-router-dom';
import FeeManagementForm from '../../components/forms/FeeManagementForm';

const FeeManagementList = () => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1 });
  const [searchValue, setSearchValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchFeeRecords();
    fetchCourses();
    fetchBatches();
  }, []);

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

  const fetchCourses = async () => {
    try {
      const response = await courseService.getActiveCourses({ no_pagination: true });
      setCourses(response.data.results);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await batchService.getActiveBatches({ no_pagination: true });
      setBatches(response.data.results);
    } catch (error) {
      console.error('Error fetching batches:', error);
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

  const handleEdit = (record) => {
    setEditingRecord(record);
    setEditFormData({
      amount: record.amount,
      discount: record.discount,
      is_quickpay: record.payment_type === 'Quick Payment'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeService.updateFeeManagement(editingRecord.id, editFormData);
      setShowEditModal(false);
      fetchFeeRecords();
    } catch (error) {
      console.error('Error updating fee record:', error);
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        await feeService.deleteFeeManagement(recordId);
        fetchFeeRecords();
      } catch (error) {
        console.error('Error deleting fee record:', error);
      }
    }
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
      key: 'payment_status',
      placeholder: 'All Payment Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'partial', label: 'Partially Paid' },
        { value: 'paid', label: 'Fully Paid' },
        { value: 'overdue', label: 'Overdue' }
      ]
    },
    {
      key: 'is_quickpay',
      placeholder: 'All Payment Types',
      options: [
        { value: 'true', label: 'Quick Payment' },
        { value: 'false', label: 'Installment Payment' }
      ]
    },
    {
      key: 'has_discount',
      placeholder: 'All Discounts',
      options: [
        { value: 'true', label: 'With Discount' },
        { value: 'false', label: 'No Discount' }
      ]
    }
  ];

  const sortOptions = [
    { value: 'student__full_name', label: 'Student Name (A-Z)' },
    { value: '-student__full_name', label: 'Student Name (Z-A)' },
    { value: 'amount', label: 'Amount (Low to High)' },
    { value: '-amount', label: 'Amount (High to Low)' },
    { value: 'created_at', label: 'Created (Oldest)' },
    { value: '-created_at', label: 'Created (Newest)' }
  ];

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
          <SearchAndFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
            filters={filterOptions}
            sortOptions={sortOptions}
            searchPlaceholder="Search by student name, course, batch..."
            searchValue={searchValue}
            currentFilters={{ payment_status: filters.payment_status, is_quickpay: filters.is_quickpay, has_discount: filters.has_discount }}
            currentSort={filters.ordering || ''}
          />

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
                      <button 
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleStudentDetail(record.student)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Installments
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)}
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

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Fee Record"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              value={editFormData.amount || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount</label>
            <input
              type="number"
              value={editFormData.discount || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, discount: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={editFormData.is_quickpay || false}
              onChange={(e) => setEditFormData(prev => ({ ...prev, is_quickpay: e.target.checked }))}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Quick Payment</label>
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
              Update Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeManagementList;