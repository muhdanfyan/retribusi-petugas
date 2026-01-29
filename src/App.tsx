import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import OpdRegistration from './pages/OpdRegistration';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Billing from './pages/Billing';
import Verification from './pages/Verification';
import Reporting from './pages/Reporting';
import MasterData from './pages/MasterData';
import SystemAdmin from './pages/SystemAdmin';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register/opd" element={<OpdRegistration />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'verifikator', 'kasir', 'viewer']}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd']}>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/billing"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'kasir']}>
                  <Layout>
                    <Billing />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/verification"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'verifikator']}>
                  <Layout>
                    <Verification />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reporting"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'viewer']}>
                  <Layout>
                    <Reporting />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/master-data"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd']}>
                  <Layout>
                    <MasterData />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/system"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <Layout>
                    <SystemAdmin />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
