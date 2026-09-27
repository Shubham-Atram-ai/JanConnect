import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import NewProblem from './pages/citizen/NewProblem';
import MyProblems from './pages/citizen/MyProblems';
import ProblemDetail from './pages/citizen/ProblemDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminChallengeDetail from './pages/admin/AdminChallengeDetail';
import UniversityAssignments from './pages/university/UniversityAssignments';
import AssignmentDetail from './pages/university/AssignmentDetail';
import UniversityWorkspaces from './pages/university/UniversityWorkspaces';
import WorkspaceDetail from './pages/university/WorkspaceDetail';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

// ─── Route Guard ─────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// ─── Root redirect based on role ─────────────────────────────────────────────
function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, fetchProfile]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'CITIZEN') return <Navigate to="/citizen" replace />;
  if (user?.role === 'PLATFORM_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (['UNIVERSITY_ADMIN', 'FACULTY', 'STUDENT', 'RESEARCHER'].includes(user?.role || '')) {
    return <Navigate to="/university/assignments" replace />;
  }
  return <Navigate to="/citizen" replace />; // Default for now
}

function App() {
  const { isAuthenticated, fetchProfile } = useAuthStore();

  // Restore session on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Citizen routes */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/problems/new"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <NewProblem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/problems"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <MyProblems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/problems/:id"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <ProblemDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/challenges/:id"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <AdminChallengeDetail />
              </ProtectedRoute>
            }
          />

          {/* University routes */}
          <Route
            path="/university/assignments"
            element={
              <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'FACULTY', 'STUDENT', 'RESEARCHER']}>
                <UniversityAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/university/assignments/:id"
            element={
              <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'FACULTY', 'STUDENT', 'RESEARCHER']}>
                <AssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/university/workspaces"
            element={
              <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'FACULTY', 'STUDENT', 'RESEARCHER', 'PLATFORM_ADMIN']}>
                <UniversityWorkspaces />
              </ProtectedRoute>
            }
          />
          <Route
            path="/university/workspaces/:id"
            element={
              <ProtectedRoute allowedRoles={['UNIVERSITY_ADMIN', 'FACULTY', 'STUDENT', 'RESEARCHER', 'PLATFORM_ADMIN']}>
                <WorkspaceDetail />
              </ProtectedRoute>
            }
          />

          {/* Legacy dashboard redirect */}
          <Route path="/dashboard" element={<Navigate to="/citizen" replace />} />

          {/* Root */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
