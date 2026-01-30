import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error: loginError } = await login(email, password);
    
    if (!loginError) {
      navigate('/dashboard');
    } else {
      setError(loginError || 'Email atau password salah');
    }
    setIsSubmitting(false);
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setIsSubmitting(true);
    const { error: loginError } = await login(demoEmail, demoPassword);
    if (!loginError) {
      navigate('/dashboard');
    } else {
      setError(loginError);
    }
    setIsSubmitting(false);
  };

  const demoAccounts = [
    { email: 'superadmin@sipanda.online', password: 'Sipanda123#', label: 'Dev Super Admin', color: 'bg-rose-500 hover:bg-rose-600' },
    { email: 'admin@retribusi.id', password: 'password123', label: 'Super Admin', color: 'bg-indigo-600 hover:bg-indigo-700' },
  ];

  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo-baubau.png" alt="Logo Kota Baubau" className="w-24 h-24 mb-4" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Retribusi & Pajak
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kota Baubau</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-baubau-blue focus:border-transparent"
                placeholder="admin@baubau"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-baubau-blue focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-baubau-blue hover:bg-baubau-blue-dark text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Belum punya akun OPD?{' '}
                <Link
                  to="/register/opd"
                  className="text-baubau-blue hover:underline font-medium"
                >
                  Daftar OPD Baru
                </Link>
              </p>
            </div>
          </form>
        </div>

        {window.location.hostname !== 'admin.sipanda.online' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Demo Accounts
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Klik untuk login cepat dengan role berbeda
            </p>

            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => quickLogin(account.email, account.password)}
                  disabled={isSubmitting}
                  className={`w-full ${account.color} text-white font-medium py-3 px-4 rounded-lg transition-all hover:shadow-lg text-left disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{account.label}</div>
                      <div className="text-sm opacity-90">{account.email}</div>
                    </div>
                    <LogIn className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-300">
                <strong>Catatan:</strong> Sekarang terhubung ke `api.sipanda.online` via Sanctum.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
