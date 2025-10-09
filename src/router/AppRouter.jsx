import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import Login from '../pages/Login/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import CourseList from '../pages/Courses/CourseList';
import CreateCourse from '../pages/Courses/CreateCourse';
import BatchList from '../pages/Batches/BatchList';
import CreateBatch from '../pages/Batches/CreateBatch';
import StudentList from '../pages/Students/StudentList';
import CreateStudent from '../pages/Students/CreateStudent';
import FeeManagementList from '../pages/FeeManagement/FeeManagementList';
import PaymentList from '../pages/Payments/PaymentList';
import CourseFeeList from '../pages/CourseFees/CourseFeeList';
import StudentInstallments from '../pages/Students/StudentInstallments';
import PendingPayments from '../pages/FeeManagement/PendingPayments';

const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
    };
    
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {isAuthenticated ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Course Routes */}
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/create" element={<CreateCourse />} />
            
            {/* Batch Routes */}
            <Route path="batches" element={<BatchList />} />
            <Route path="batches/create" element={<CreateBatch />} />
            
            {/* Student Routes */}
            <Route path="students" element={<StudentList />} />
            <Route path="students/create" element={<CreateStudent />} />
            <Route path="students/:studentId/installments" element={<StudentInstallments />} />
            
            {/* Fee Management Routes */}
            <Route path="fee-management" element={<FeeManagementList />} />
            <Route path="fee-management/pending" element={<PendingPayments />} />
            
            {/* Payment Routes */}
            <Route path="payments" element={<PaymentList />} />
            
            {/* Course Fees Routes */}
            <Route path="course-fees" element={<CourseFeeList />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default AppRouter;