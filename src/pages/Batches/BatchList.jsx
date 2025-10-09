import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner } from '../../components/ui';
import { batchService } from '../../services';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1 });

  useEffect(() => {
    fetchBatches();
  }, [filters]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      );
      const response = await batchService.getBatches(cleanFilters);
      setBatches(response.data.results);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching batches:', error);
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
          <CardTitle>Batches</CardTitle>
          <Link
            to="/batches/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Batch
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search batches..."
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
                <TableHead>Batch Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batch_name}</TableCell>
                  <TableCell>{new Date(batch.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={batch.is_active ? 'success' : 'error'}>
                      {batch.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{batch.created_by_username}</TableCell>
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

export default BatchList;