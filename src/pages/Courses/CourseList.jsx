import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner, Modal } from '../../components/ui';
import SearchAndFilter from '../../components/ui/SearchAndFilter';
import { courseService } from '../../services';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1 });
  const [searchValue, setSearchValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      );
      const response = await courseService.getCourses(cleanFilters);
      setCourses(response.data.results);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  const handleEdit = (course) => {
    setEditingCourse(course);
    setEditFormData({
      course_name: course.course_name,
      duration: course.duration,
      is_active: course.is_active
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await courseService.updateCourse(editingCourse.id, editFormData);
      setShowEditModal(false);
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(courseId);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const filterOptions = [
    {
      key: 'is_active',
      placeholder: 'All Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    },
    {
      key: 'duration',
      placeholder: 'All Durations',
      options: [
        { value: '1', label: '1 month' },
        { value: '2', label: '2 months' },
        { value: '3', label: '3 months' },
        { value: '6', label: '6 months' },
        { value: '12', label: '12 months' }
      ]
    }
  ];

  const sortOptions = [
    { value: 'course_name', label: 'Name (A-Z)' },
    { value: '-course_name', label: 'Name (Z-A)' },
    { value: 'duration', label: 'Duration (Short to Long)' },
    { value: '-duration', label: 'Duration (Long to Short)' },
    { value: 'created_at', label: 'Created (Oldest)' },
    { value: '-created_at', label: 'Created (Newest)' }
  ];

  if (loading) return <LoadingSpinner size="lg" className="py-8" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Courses</CardTitle>
          <Link
            to="/courses/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Course
          </Link>
        </CardHeader>
        <CardContent>
          <SearchAndFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
            filters={filterOptions}
            sortOptions={sortOptions}
            searchPlaceholder="Search courses by name..."
            searchValue={searchValue}
            currentFilters={{ is_active: filters.is_active, duration: filters.duration }}
            currentSort={filters.ordering || ''}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.course_name}</TableCell>
                  <TableCell>{course.duration} months</TableCell>
                  <TableCell>
                    <Badge variant={course.is_active ? 'success' : 'error'}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(course)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
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
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Course"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Name</label>
            <input
              type="text"
              value={editFormData.course_name || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, course_name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (months)</label>
            <input
              type="number"
              value={editFormData.duration || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              min="1"
              max="60"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={editFormData.is_active || false}
              onChange={(e) => setEditFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Active</label>
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
              Update Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CourseList;