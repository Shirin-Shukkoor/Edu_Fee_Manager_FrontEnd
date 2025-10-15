import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Pagination, LoadingSpinner, Modal } from '../../components/ui';
import SearchAndFilter from '../../components/ui/SearchAndFilter';
import { batchService } from '../../services';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1 });
  const [searchValue, setSearchValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setEditFormData({
      batch_name: batch.batch_name,
      start_date: batch.start_date,
      is_active: batch.is_active
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await batchService.updateBatch(editingBatch.id, editFormData);
      setShowEditModal(false);
      fetchBatches();
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  };

  const handleDelete = async (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await batchService.deleteBatch(batchId);
        fetchBatches();
      } catch (error) {
        console.error('Error deleting batch:', error);
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
    }
  ];

  const sortOptions = [
    { value: 'batch_name', label: 'Name (A-Z)' },
    { value: '-batch_name', label: 'Name (Z-A)' },
    { value: 'start_date', label: 'Start Date (Oldest)' },
    { value: '-start_date', label: 'Start Date (Newest)' },
    { value: 'created_at', label: 'Created (Oldest)' },
    { value: '-created_at', label: 'Created (Newest)' }
  ];

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
          <SearchAndFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            onSort={handleSort}
            filters={filterOptions}
            sortOptions={sortOptions}
            searchPlaceholder="Search batches by name..."
            searchValue={searchValue}
            currentFilters={{ is_active: filters.is_active }}
            currentSort={filters.ordering || ''}
          />

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
                      <button 
                        onClick={() => handleEdit(batch)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(batch.id)}
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
        title="Edit Batch"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Batch Name</label>
            <input
              type="text"
              value={editFormData.batch_name || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, batch_name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={editFormData.start_date || ''}
              onChange={(e) => setEditFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
              Update Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BatchList;