import { useState, useEffect } from 'react';
import { fineService } from '../../services';

const FineManagement = () => {
  const [fines, setFines] = useState([]);
  const [overdueStudents, setOverdueStudents] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('fines');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'fines') {
        const response = await fineService.getFines();
        setFines(response.data.results || []);
      } else if (activeTab === 'overdue') {
        const response = await fineService.getOverdueStudents();
        setOverdueStudents(response.data.results || []);
      }
      
      const statsResponse = await fineService.getFineStatistics();
      setStatistics(statsResponse.data.data || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (fineId) => {
    try {
      await fineService.markFinePaid(fineId);
      fetchData();
    } catch (error) {
      console.error('Error marking fine as paid:', error);
    }
  };

  const handleWaiveFine = async (fineId, reason) => {
    try {
      await fineService.waiveFine(fineId, { waived_reason: reason });
      fetchData();
    } catch (error) {
      console.error('Error waiving fine:', error);
    }
  };

  const handleCreateFine = async (studentData) => {
    setSelectedStudent(studentData);
    setShowCreateModal(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fine Management</h1>
        <p className="text-gray-600">Manage fines for overdue payments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Fines</h3>
          <p className="text-2xl font-bold text-gray-900">{statistics.total_fines || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Fines</h3>
          <p className="text-2xl font-bold text-orange-600">{statistics.active_fines || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Collected Amount</h3>
          <p className="text-2xl font-bold text-green-600">₹{statistics.collected_fine_amount || '0.00'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Amount</h3>
          <p className="text-2xl font-bold text-red-600">₹{statistics.active_fine_amount || '0.00'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('fines')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'fines'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Fines
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'overdue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overdue Students
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <>
              {activeTab === 'fines' && (
                <FinesTable 
                  fines={fines} 
                  onMarkPaid={handleMarkPaid}
                  onWaive={handleWaiveFine}
                />
              )}
              {activeTab === 'overdue' && (
                <OverdueStudentsTable 
                  students={overdueStudents}
                  onCreateFine={handleCreateFine}
                />
              )}
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateFineModal
          student={selectedStudent}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

const FinesTable = ({ fines, onMarkPaid, onWaive }) => {
  const [waiveModal, setWaiveModal] = useState({ show: false, fineId: null });
  const [waiveReason, setWaiveReason] = useState('');

  const handleWaive = () => {
    if (waiveReason.trim()) {
      onWaive(waiveModal.fineId, waiveReason);
      setWaiveModal({ show: false, fineId: null });
      setWaiveReason('');
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fines.map((fine) => (
              <tr key={fine.uid}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{fine.student_name}</div>
                    <div className="text-sm text-gray-500">{fine.student_code}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {fine.fine_type_display}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ₹{fine.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(fine.due_date).toLocaleDateString()}
                  {fine.is_overdue && (
                    <span className="ml-2 text-xs text-red-600">({fine.days_overdue} days overdue)</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    fine.status === 'ACTIVE' ? 'bg-orange-100 text-orange-800' :
                    fine.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    fine.status === 'WAIVED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {fine.status_display}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {fine.status === 'ACTIVE' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onMarkPaid(fine.uid)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => setWaiveModal({ show: true, fineId: fine.uid })}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Waive
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {waiveModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Waive Fine</h3>
            <textarea
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              placeholder="Enter reason for waiving the fine..."
              className="w-full p-3 border border-gray-300 rounded-md"
              rows="3"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setWaiveModal({ show: false, fineId: null })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWaive}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Waive Fine
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OverdueStudentsTable = ({ students, onCreateFine }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Existing Fine</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                  <div className="text-sm text-gray-500">{student.student_code}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.course_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ₹{student.due_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                {student.days_overdue} days
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{student.existing_fine_amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onCreateFine(student)}
                  className="text-red-600 hover:text-red-900"
                >
                  Apply Fine
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CreateFineModal = ({ student, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fine_type: 'OVERDUE',
    amount: '',
    reason: '',
    due_date: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fineService.createFine({
        student: student.student_id,
        installment: student.installment_id,
        ...formData,
        applied_date: new Date().toISOString().split('T')[0]
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating fine:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Apply Fine - {student.student_name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fine Type</label>
            <select
              value={formData.fine_type}
              onChange={(e) => setFormData({...formData, fine_type: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="OVERDUE">Overdue Payment</option>
              <option value="LATE_FEE">Late Fee</option>
              <option value="PENALTY">Penalty</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Apply Fine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FineManagement;