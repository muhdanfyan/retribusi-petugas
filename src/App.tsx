import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PetugasLogin from './pages/PetugasLogin';
import LandingPage from './pages/LandingPage';
import PetugasWelcome from './pages/PetugasWelcome';
import PetugasRegister from './pages/PetugasRegister';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Reporting from './pages/Reporting';
import MasterData from './pages/MasterData';
import TaxpayerManagement from './pages/TaxpayerManagement';
import TaxpayerDetail from './pages/TaxpayerDetail';
import Profile from './pages/Profile';
import FieldScanner from './pages/FieldScanner';
import PaymentConfirmation from './pages/PaymentConfirmation';
import TaxCalculator from './pages/TaxCalculator';
import UserGuide from './pages/UserGuide';
import FieldInspection from './pages/FieldInspection';
import Presentation from './pages/Presentation';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PetugasLogin />} />
            <Route path="/register" element={<PetugasRegister />} />
            <Route path="/welcome" element={<PetugasWelcome />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'verifikator', 'petugas', 'viewer']}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/scanner"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'petugas']}>
                  <Layout>
                    <FieldScanner />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment-confirmation"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'petugas']}>
                  <Layout>
                    <PaymentConfirmation />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/field-check"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'petugas']}>
                  <Layout>
                    <FieldInspection />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/taxpayers"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'petugas']}>
                  <Layout>
                    <TaxpayerManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/taxpayers/:id"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'petugas']}>
                  <Layout>
                    <TaxpayerDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/billing"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'petugas']}>
                  <Layout>
                    <Billing />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reporting"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'viewer', 'petugas']}>
                  <Layout>
                    <Reporting />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/master-data"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'verifikator', 'petugas', 'viewer']}>
                  <Layout>
                    <MasterData />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/calculator"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'petugas']}>
                  <Layout>
                    <TaxCalculator />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'opd', 'verifikator', 'petugas', 'viewer']}>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/user-guide" element={<UserGuide />} />
            <Route path="/presentation" element={<Presentation />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
