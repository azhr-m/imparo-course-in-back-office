import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/AuthProvider';
import MainLayout from './components/layout/MainLayout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage'));
const SubmissionDetailsPage = lazy(() => import('./pages/SubmissionDetailsPage'));
const AgentsPage = lazy(() => import('./pages/AgentsPage'));
const AgentDetailsPage = lazy(() => import('./pages/AgentDetailsPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ActivatePage = lazy(() => import('./pages/ActivatePage'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/activate" element={<ActivatePage />} />
                
                {/* Protected Routes inside Layout */}
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/submissions" element={<SubmissionsPage />} />
                  <Route path="/submissions/:id" element={<SubmissionDetailsPage />} />
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/agents/:id" element={<AgentDetailsPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/users" element={<UsersPage />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
