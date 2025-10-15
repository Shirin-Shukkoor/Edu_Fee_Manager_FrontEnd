import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner, Modal } from '../../components/ui';
import SearchAndFilter from '../../components/ui/SearchAndFilter';
import { studentService, courseService, batchService } from '../../services';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1 });
  const [searchValue, setSearchValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchBatches();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      );
      const response = await studentService.getStudents(cleanFilters);
      setStudents(response.data.results);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditFormData({
      full_name: student.full_name,
      email: student.email,
      phone_no: student.phone_no,
      course: student.course,
      batch: student.batch
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentService.updateStudent(editingStudent.id, editFormData);
      setShowEditModal(false);
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(studentId);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
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
      key: 'course',
      placeholder: 'All Courses',
      options: courses.map(course => ({ value: course.id, label: course.course_name }))
    },
    {
      key: 'batch',
      placeholder: 'All Batches',
      options: batches.map(batch => ({ value: batch.id, label: batch.batch_name }))
    },
    {
      key: 'age_group',
      placeholder: 'All Age Groups',
      options: [
        { value: 'new', label: 'New (Last 30 days)' },
        { value: 'recent', label: 'Recent (30-180 days)' },
        { value: 'regular', label: 'Regular (180-365 days)' },
        { value: 'senior', label: 'Senior (1+ years)' }
      ]
    }
  ];

  const sortOptions = [
    { value: 'full_name', label: 'Name (A-Z)' },
    { value: '-full_name', label: 'Name (Z-A)' },
    { value: 'joining_date', label: 'Joining Date (Oldest)' },
    { value: '-joining_date', label: 'Joining Date (Newest)' },
    { value: 'course__course_name', label: 'Course (A-Z)' },
    { value: 'batch__batch_name', label: 'Batch (A-Z)' }
  ];

  if (loading) return <LoadingSpinner size="lg" className="py-8" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Students</CardTitle>
          <Link
            to="/students/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Student
          </Link>
        </CardHeader>
        <CardContent>
          <SearchAndFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
            filters={filterOptions}
            sortOptions={sortOptions}
            searchPlaceholder="Search by name, email, phone, course, batch..."
            searchValue={searchValue}
            currentFilters={{ is_active: filters.is_active, course: filters.course, batch: filters.batch, age_group: filters.age_group }}
            currentSort={filters.ordering || ''}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.full_name}</div>
                      <div className="text-sm text-gray-500">{student.student_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{student.course_name}</TableCell>
                  <TableCell>{student.batch_name}</TableCell>
                  <TableCell>{new Date(student.joining_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={student.is_active ? 'success' : 'error'}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
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
        title="Edit Student"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={editFormData.full_name || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={editFormData.email || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={editFormData.phone_no || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, phone_no: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
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
            <label className="block text-sm font-medium text-gray-700">Batch</label>
            <select
              value={editFormData.batch || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, batch: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Batch</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.batch_name}</option>
              ))}
            </select>
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
              Update Student
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentList;