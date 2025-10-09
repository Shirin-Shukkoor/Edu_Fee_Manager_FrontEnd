import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner } from '../../components/ui';
import { studentService } from '../../services';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1 });

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

  const handleSearch = (value) => {
    if (value.trim()) {
      setFilters({ ...filters, search: value, page: 1 });
    } else {
      const { search, ...rest } = filters;
      setFilters(rest);
    }
  };

  const handleStatusFilter = (value) => {
    if (value) {
      setFilters({ ...filters, is_active: value, page: 1 });
    } else {
      const { is_active, ...rest } = filters;
      setFilters(rest);
    }
  };

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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search students..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
              onBlur={(e) => handleSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

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
    </div>
  );
};

export default StudentList;