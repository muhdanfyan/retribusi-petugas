import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import KasirLogin from './pages/KasirLogin';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Reporting from './pages/Reporting';
import MasterData from './pages/MasterData';
import TaxpayerManagement from './pages/TaxpayerManagement';
import Profile from './pages/Profile';
import FieldScanner from './pages/FieldScanner';
import PaymentConfirmation from './pages/PaymentConfirmation';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/kasir/login" element={<KasirLogin />} />

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
              path="/scanner"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'kasir']}>
                  <Layout>
                    <FieldScanner />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment-confirmation"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'kasir']}>
                  <Layout>
                    <PaymentConfirmation />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/taxpayers"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'kasir']}>
                  <Layout>
                    <TaxpayerManagement />
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
              path="/reporting"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'viewer', 'kasir']}>
                  <Layout>
                    <Reporting />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/master-data"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'verifikator', 'kasir', 'viewer']}>
                  <Layout>
                    <MasterData />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'verifikator', 'kasir', 'viewer']}>
                  <Layout>
                    <Profile />
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

