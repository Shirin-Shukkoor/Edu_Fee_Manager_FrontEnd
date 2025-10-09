import { useState, useEffect } from 'react';
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

  const handleSearch = (value) => {
    if (value.trim()) {
      setFilters({ ...filters, search: value, page: 1 });
    } else {
      const { search, ...rest } = filters;
      setFilters(rest);
    }
  };

  const handleCourseFilter = (value) => {
    if (value) {
      setFilters({ ...filters, course: value, page: 1 });
    } else {
      const { course, ...rest } = filters;
      setFilters(rest);
    }
  };

  const handleCategoryFilter = (value) => {
    if (value) {
      setFilters({ ...filters, fee_category: value, page: 1 });
    } else {
      const { fee_category, ...rest } = filters;
      setFilters(rest);
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
              onBlur={(e) => handleSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
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
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="expensive">Expensive (≥₹10,000)</option>
              <option value="affordable">Affordable (&lt;₹10,000)</option>
            </select>
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
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
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
        title="Add Course Fee"
        size="lg"
      >
        <CourseFeeForm
          onSubmit={handleCreateCourseFee}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default CourseFeeList;