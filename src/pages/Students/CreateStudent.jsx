import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui';
import { studentService, courseService, batchService } from '../../services';

const CreateStudent = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_no: '',
    parent_name: '',
    parent_number: '',
    course: '',
    batch: '',
    joining_date: new Date().toISOString().split('T')[0],
  });
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchBatches();
  }, []);

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
      await studentService.createStudent(formData);
      navigate('/students');
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                {errors.full_name && <p className="form-error">{errors.full_name[0]}</p>}
              </div>

              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                {errors.email && <p className="form-error">{errors.email[0]}</p>}
              </div>

              <div>
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                {errors.phone_no && <p className="form-error">{errors.phone_no[0]}</p>}
              </div>

              <div>
                <label className="form-label">Parent Name</label>
                <input
                  type="text"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.parent_name && <p className="form-error">{errors.parent_name[0]}</p>}
              </div>

              <div>
                <label className="form-label">Parent Number</label>
                <input
                  type="tel"
                  name="parent_number"
                  value={formData.parent_number}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.parent_number && <p className="form-error">{errors.parent_number[0]}</p>}
              </div>

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
                      {course.course_name}
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
                <label className="form-label">Joining Date *</label>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                {errors.joining_date && <p className="form-error">{errors.joining_date[0]}</p>}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateStudent;