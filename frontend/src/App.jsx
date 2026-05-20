import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Payments from './pages/admin/Payments';
import AdminTasks from './pages/admin/Tasks';
import AdminAttendance from './pages/admin/Attendance';
import Routines from './pages/admin/Routines';
import Exams from './pages/admin/Exams';
import Results from './pages/admin/Results';
import Analytics from './pages/admin/Analytics';
import Documents from './pages/admin/Documents';
import AdminNotifications from './pages/admin/Notifications';
import Subjects from './pages/admin/Subjects';

import StudentDashboard from './pages/student/Dashboard';
import StudentTasks from './pages/student/Tasks';
import StudentResults from './pages/student/Results';
import StudentAttendance from './pages/student/Attendance';
import StudentResources from './pages/student/Resources';
import StudentRoutine from './pages/student/Routine';
import StudentNotifications from './pages/student/Notifications';

function ProtectedRoute({ children, role }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  }
  return children;
}

export default function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#333', color: '#fff', borderRadius: '8px' },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout title="Admin Panel" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="payments" element={<Payments />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="routines" element={<Routines />} />
          <Route path="exams" element={<Exams />} />
          <Route path="results" element={<Results />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="documents" element={<Documents />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="subjects" element={<Subjects />} />
        </Route>

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout title="Student Panel" />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="tasks" element={<StudentTasks />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="routine" element={<StudentRoutine />} />
          <Route path="notifications" element={<StudentNotifications />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
