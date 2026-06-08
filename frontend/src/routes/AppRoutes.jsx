import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import MentorLayout from '../layouts/MentorLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import StudentLoginPage from '../pages/StudentLoginPage';
import StudentSignupPage from '../pages/StudentSignupPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import MentorLoginPage from '../pages/MentorLoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminCohortsPage from '../pages/AdminCohortsPage';
import AdminTestsPage from '../pages/AdminTestsPage';
import AdminQuestionsPage from '../pages/AdminQuestionsPage';
import MentorDashboardPage from '../pages/MentorDashboardPage';
import MentorStudentsPage from '../pages/MentorStudentsPage';
import MentorStudentDetailPage from '../pages/MentorStudentDetailPage';
import MentorTasksPage from '../pages/MentorTasksPage';
import MentorDoubtsPage from '../pages/MentorDoubtsPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes with main layout (navbar + footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<StudentLoginPage />} />
            <Route path="/signup" element={<StudentSignupPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/mentor/login" element={<MentorLoginPage />} />
          </Route>

          {/* Protected admin routes with admin layout (sidebar) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="cohorts" element={<AdminCohortsPage />} />
            <Route path="tests" element={<AdminTestsPage />} />
            <Route path="questions" element={<AdminQuestionsPage />} />
          </Route>

          {/* Protected mentor routes with mentor layout (sidebar) */}
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute roles={['MENTOR']}>
                <MentorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MentorDashboardPage />} />
            <Route path="students" element={<MentorStudentsPage />} />
            <Route path="students/:id" element={<MentorStudentDetailPage />} />
            <Route path="tasks" element={<MentorTasksPage />} />
            <Route path="doubts" element={<MentorDoubtsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
