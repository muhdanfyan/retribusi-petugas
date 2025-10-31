import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('Email atau password salah');
    }
  };

  const quickLogin = (demoEmail: string, demoPassword: string) => {
    if (login(demoEmail, demoPassword)) {
      navigate('/dashboard');
    }
  };

  const demoAccounts = [
    { email: 'admin@baubau', password: 'superadmin123', label: 'Super Admin', color: 'bg-red-600 hover:bg-red-700' },
    { email: 'dinas@baubau', password: 'admin123', label: 'Admin Dinas', color: 'bg-blue-600 hover:bg-blue-700' },
    { email: 'verifikator@baubau', password: 'ver123', label: 'Verifikator', color: 'bg-green-600 hover:bg-green-700' },
    { email: 'kasir@baubau', password: 'kasir123', label: 'Kasir', color: 'bg-yellow-600 hover:bg-yellow-700' },
    { email: 'viewer@baubau', password: 'view123', label: 'Viewer', color: 'bg-gray-600 hover:bg-gray-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@baubau"
                required
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
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
                className={`w-full ${account.color} text-white font-medium py-3 px-4 rounded-lg transition-all hover:shadow-lg text-left`}
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

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-300">
              <strong>Catatan:</strong> Ini adalah prototype dengan data dummy.
              Setiap role memiliki akses menu yang berbeda sesuai permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
