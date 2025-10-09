import { useState, useEffect } from 'react';
import { studentService } from '../../services';

const FeeManagementForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    student: '',
    amount: '',
    discount: '0',
    is_quickpay: false,
    instalment_duration: '',
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchStudents();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const fetchStudents = async () => {
    try {
      const response = await studentService.getActiveStudents({ no_pagination: true });
      setStudents(response.data.results);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await onSubmit(formData);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Student *</label>
        <select
          name="student"
          value={formData.student}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.full_name} ({student.student_id})
            </option>
          ))}
        </select>
        {errors.student && <p className="form-error">{errors.student[0]}</p>}
      </div>

      <div>
        <label className="form-label">Fee Amount *</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="form-input"
          placeholder="0.00"
          step="0.01"
          min="0"
          max="500000"
          required
        />
        {errors.amount && <p className="form-error">{errors.amount[0]}</p>}
      </div>

      <div>
        <label className="form-label">Discount Amount</label>
        <input
          type="number"
          name="discount"
          value={formData.discount}
          onChange={handleChange}
          className="form-input"
          placeholder="0.00"
          step="0.01"
          min="0"
        />
        {errors.discount && <p className="form-error">{errors.discount[0]}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="is_quickpay"
          checked={formData.is_quickpay}
          onChange={handleChange}
          className="rounded"
        />
        <label className="text-sm font-medium text-gray-700">Quick Payment (Full amount at once)</label>
      </div>

      {!formData.is_quickpay && (
        <div>
          <label className="form-label">Installment Duration (months) *</label>
          <input
            type="number"
            name="instalment_duration"
            value={formData.instalment_duration}
            onChange={handleChange}
            className="form-input"
            min="1"
            max="60"
            required={!formData.is_quickpay}
          />
          {errors.instalment_duration && <p className="form-error">{errors.instalment_duration[0]}</p>}
        </div>
      )}

      {errors.non_field_errors && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {errors.non_field_errors[0]}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Fee Record'}
        </button>
      </div>
    </form>
  );
};

export default FeeManagementForm;