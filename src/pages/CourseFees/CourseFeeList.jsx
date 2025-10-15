import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner, Modal } from '../../components/ui';
import { feeService, courseService } from '../../services';
import CourseFeeForm from '../../components/forms/CourseFeeForm';

const CourseFeeList = () => {
  const [courseFees, setCourseFees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ page: 1 });
  const [searchValue, setSearchValue] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchCourseFees();
    fetchCourses();
  }, [filters]);

  const fetchCourseFees = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      );
      const response = await feeService.getCourseFees(cleanFilters);
      setCourseFees(response.data.results);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching course fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourseFee = async (feeData) => {
    try {
      await feeService.createCourseFee(feeData);
      setShowModal(false);
      fetchCourseFees();
    } catch (error) {
      throw error;
    }
  };

  const handleSearch = useCallback((value) => {
    setSearchValue(value);
    setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value || undefined, page: 1 }));
    }, 500);
  }, []);

  const handleCourseFilter = useCallback((value) => {
    setSelectedCourse(value);
    setFilters(prev => ({ ...prev, course: value || undefined, page: 1 }));
  }, []);

  const handleCategoryFilter = useCallback((value) => {
    setSelectedCategory(value);
    setFilters(prev => ({ ...prev, fee_category: value || undefined, page: 1 }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    setSelectedCourse('');
    setSelectedCategory('');
    setFilters({ page: 1 });
  }, []);

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setEditFormData({
      course: fee.course,
      batch: fee.batch,
      actual_fee: fee.actual_fee
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await feeService.updateCourseFee(editingFee.id, editFormData);
      setShowEditModal(false);
      fetchCourseFees();
    } catch (error) {
      console.error('Error updating course fee:', error);
    }
  };

  const handleDelete = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this course fee?')) {
      try {
        await feeService.deleteCourseFee(feeId);
        fetchCourseFees();
      } catch (error) {
        console.error('Error deleting course fee:', error);
      }
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

  const getFeeBadge = (fee) => {
    const amount = parseFloat(fee);
    if (amount >= 10000) return <Badge variant="error">Expensive</Badge>;
    return <Badge variant="success">Affordable</Badge>;
  };

  if (loading) return <LoadingSpinner size="lg" className="py-8" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Course Fee Structure</CardTitle>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Course Fee
          </button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_name}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="expensive">Expensive (≥₹10,000)</option>
              <option value="affordable">Affordable (&lt;₹10,000)</option>
            </select>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Fee Amount</TableHead>
                <TableHead>Fee/Month</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.course_name}</TableCell>
                  <TableCell>{fee.batch_name}</TableCell>
                  <TableCell>{fee.course_duration} months</TableCell>
                  <TableCell className="font-bold">₹{fee.actual_fee}</TableCell>
                  <TableCell>₹{fee.fee_per_month}</TableCell>
                  <TableCell>{getFeeBadge(fee.actual_fee)}</TableCell>
                  <TableCell>{new Date(fee.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(fee)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(fee.id)}
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
        title="Add Course Fee"
        size="lg"
      >
        <CourseFeeForm
          onSubmit={handleCreateCourseFee}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Course Fee"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select
              value={editFormData.course || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, course: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.course_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fee Amount</label>
            <input
              type="number"
              value={editFormData.actual_fee || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, actual_fee: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              step="0.01"
              required
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
              Update Fee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CourseFeeList;