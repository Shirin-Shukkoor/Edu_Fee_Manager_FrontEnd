import { useState, useEffect } from 'react';
import { courseService, batchService } from '../../services';

const CourseFeeForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    course: '',
    batch: '',
    actual_fee: '',
  });
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourses();
    fetchBatches();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Course *</label>
        <select
          name="course"
          value={formData.course}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_name} ({course.duration} months)
            </option>
          ))}
        </select>
        {errors.course && <p className="form-error">{errors.course[0]}</p>}
      </div>

      <div>
        <label className="form-label">Batch *</label>
        <select
          name="batch"
          value={formData.batch}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="">Select Batch</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.batch_name}
            </option>
          ))}
        </select>
        {errors.batch && <p className="form-error">{errors.batch[0]}</p>}
      </div>

      <div>
        <label className="form-label">Fee Amount *</label>
        <input
          type="number"
          name="actual_fee"
          value={formData.actual_fee}
          onChange={handleChange}
          className="form-input"
          placeholder="0.00"
          step="0.01"
          min="0"
          max="100000"
          required
        />
        {errors.actual_fee && <p className="form-error">{errors.actual_fee[0]}</p>}
      </div>

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
          {loading ? 'Saving...' : 'Save Fee'}
        </button>
      </div>
    </form>
  );
};

export default CourseFeeForm;