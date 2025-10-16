import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui';
import { batchService } from '../../services';

const CreateBatch = () => {
  const [formData, setFormData] = useState({
    batch_name: '',
    start_date: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await batchService.createBatch(formData);
      navigate('/batches');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Batch Name *</label>
              <input
                type="text"
                name="batch_name"
                value={formData.batch_name}
                onChange={handleChange}
                className="form-input"
                required
              />
              {errors.batch_name && <p className="form-error">{errors.batch_name[0]}</p>}
            </div>

            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="form-input"
              />
              {errors.start_date && <p className="form-error">{errors.start_date[0]}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/batches')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Batch'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBatch;