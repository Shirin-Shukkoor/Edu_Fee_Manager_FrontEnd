import { useState, useEffect } from 'react';
import SearchableDropdown from '../ui/SearchableDropdown';
import { studentService, courseService, batchService } from '../../services';

const FeeManagementForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    course: '',
    batch: '',
    student: '',
    amount: '',
    discount: '0',
    is_quickpay: false,
    instalment_duration: '',
  });
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourses();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.course) {
      fetchBatches();
    } else {
      setBatches([]);
      setStudents([]);
      setFormData(prev => ({ ...prev, batch: '', student: '' }));
    }
  }, [formData.course]);

  useEffect(() => {
    if (formData.course && formData.batch) {
      fetchStudents();
    } else {
      setStudents([]);
      setFormData(prev => ({ ...prev, student: '' }));
    }
  }, [formData.course, formData.batch]);

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
      const response = await batchService.getActiveBatches({ course: formData.course, no_pagination: true });
      setBatches(response.data.results);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getStudentsByCourseAndBatch(formData.course, formData.batch);
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
        <label className="form-label">Course *</label>
        <SearchableDropdown
          options={courses.map(course => ({ value: course.id, label: course.course_name }))}
          value={formData.course}
          onChange={(value) => setFormData(prev => ({ ...prev, course: value, batch: '', student: '' }))}
          placeholder="Select Course"
          searchPlaceholder="Search courses..."
          className="w-full"
        />
        {errors.course && <p className="form-error">{errors.course[0]}</p>}
      </div>

      <div>
        <label className="form-label">Batch *</label>
        <SearchableDropdown
          options={batches.map(batch => ({ value: batch.id, label: batch.batch_name }))}
          value={formData.batch}
          onChange={(value) => setFormData(prev => ({ ...prev, batch: value, student: '' }))}
          placeholder={!formData.course ? 'Select Course first' : 'Select Batch'}
          searchPlaceholder="Search batches..."
          disabled={!formData.course}
          className="w-full"
        />
        {errors.batch && <p className="form-error">{errors.batch[0]}</p>}
      </div>

      <div>
        <label className="form-label">Student *</label>
        <SearchableDropdown
          options={students.map(student => ({ 
            value: student.id, 
            label: `${student.full_name} (${student.student_id})` 
          }))}
          value={formData.student}
          onChange={(value) => setFormData(prev => ({ ...prev, student: value }))}
          placeholder={!formData.course || !formData.batch ? 'Select Course and Batch first' : 'Select Student'}
          searchPlaceholder="Search students..."
          disabled={!formData.course || !formData.batch}
          className="w-full"
        />
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