import { useState, useEffect } from 'react';
import SearchableDropdown from '../ui/SearchableDropdown';
import { studentService, feeService, courseService, batchService } from '../../services';

const PaymentForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    course: '',
    batch: '',
    student: '',
    installment: '',
    amount_paid: '',
    payment_mode: 'CASH',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [installments, setInstallments] = useState([]);
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

  useEffect(() => {
    if (formData.student) {
      fetchStudentInstallments();
    }
  }, [formData.student]);

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

  const fetchStudentInstallments = async () => {
    try {
      const feeResponse = await feeService.getFeeManagementByStudent(formData.student);
      if (feeResponse.data.data) {
        const installmentsResponse = await feeService.getFeeManagementInstallments(feeResponse.data.data.id);
        const pendingInstallments = installmentsResponse.data.results.filter(
          inst => inst.status !== 'PAID'
        );
        setInstallments(pendingInstallments);
      }
    } catch (error) {
      console.error('Error fetching installments:', error);
      setInstallments([]);
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

  const paymentModes = [
    { value: 'CASH', label: 'Cash' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'CARD', label: 'Card' },
    { value: 'UPI', label: 'UPI' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  ];

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
        <label className="form-label">Installment *</label>
        <select
          name="installment"
          value={formData.installment}
          onChange={handleChange}
          className="form-select"
          required
          disabled={!formData.student}
        >
          <option value="">Select Installment</option>
          {installments.map((installment) => (
            <option key={installment.id} value={installment.id}>
              Installment #{installment.installment_number} - Due: {installment.due_date} - Amount: ₹{installment.amount_due}
            </option>
          ))}
        </select>
        {errors.installment && <p className="form-error">{errors.installment[0]}</p>}
      </div>

      <div>
        <label className="form-label">Amount Paid *</label>
        <input
          type="number"
          name="amount_paid"
          value={formData.amount_paid}
          onChange={handleChange}
          className="form-input"
          placeholder="0.00"
          step="0.01"
          min="0"
          required
        />
        {errors.amount_paid && <p className="form-error">{errors.amount_paid[0]}</p>}
      </div>

      <div>
        <label className="form-label">Payment Mode *</label>
        <select
          name="payment_mode"
          value={formData.payment_mode}
          onChange={handleChange}
          className="form-select"
          required
        >
          {paymentModes.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        {errors.payment_mode && <p className="form-error">{errors.payment_mode[0]}</p>}
      </div>

      <div>
        <label className="form-label">Payment Date *</label>
        <input
          type="date"
          name="payment_date"
          value={formData.payment_date}
          onChange={handleChange}
          className="form-input"
          required
        />
        {errors.payment_date && <p className="form-error">{errors.payment_date[0]}</p>}
      </div>

      <div>
        <label className="form-label">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="form-input"
          rows="3"
          placeholder="Additional notes about the payment..."
        />
        {errors.notes && <p className="form-error">{errors.notes[0]}</p>}
      </div>

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
          {loading ? 'Processing...' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;