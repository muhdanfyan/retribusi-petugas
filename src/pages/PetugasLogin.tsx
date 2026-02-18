import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Loader2, Facebook, Twitter, Chrome, Apple, Eye, EyeOff, BookOpen } from 'lucide-react';
import { InstallPWA } from '../components/InstallPWA';

export default function PetugasLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    const { error: loginError, user } = result as { error: string | null, user?: any };
    
    if (!loginError) {
      if (user?.role === 'petugas' || user?.role === 'super_admin' || user?.role === 'opd') {
        navigate('/dashboard');
      } else {
        setError('Hanya akun Petugas yang dapat login melalui jalur ini.');
      }
    } else {
      setError(loginError || 'Email atau password salah');
    }
    setIsSubmitting(false);
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsSubmitting(true);
    const result = await login(demoEmail, demoPassword);
    const { error: loginError } = result as { error: string | null };
    if (!loginError) {
      navigate('/dashboard');
    } else {
      setError(loginError);
    }
    setIsSubmitting(false);
  };

  const demoAccounts = [
    { email: 'petugas@bapenda.go.id', label: 'Petugas BAPENDA' },
    { email: 'dishub@retribusi.id', label: 'Admin DISHUB' },
  ];

  return (
    <div className="min-h-screen bg-[#2d5cd5] flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-5%] right-[-10%] w-[100%] h-[40%] bg-white/20 rounded-full blur-[80px] sm:blur-[120px] transform rotate-12"></div>
      <div className="absolute top-[15%] left-[5%] w-16 h-16 sm:w-24 sm:h-24 bg-white/20 rounded-full blur-md"></div>
      <div className="absolute top-[30%] right-[15%] w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full backdrop-blur-sm"></div>

      {/* Header / Back Button */}
      <div className="relative z-20 px-6 pt-10 sm:pt-12 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-all font-bold text-xs sm:text-sm"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <ArrowLeft size={18} />
          </div>
          <span>Kembali</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-end relative z-10 pt-10 sm:pt-12">
        <div className="bg-white rounded-t-[2.5rem] sm:rounded-t-[3.5rem] px-6 sm:px-8 pt-10 sm:pt-12 pb-10 sm:pb-16 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <h1 className="text-3xl sm:text-4xl font-black text-[#2d5cd5] tracking-tight mb-2">Selamat Datang</h1>
              <p className="text-slate-400 text-sm font-medium">Silakan masuk ke akun petugas Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 ml-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-[#2d5cd5] transition-all outline-none font-semibold"
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-slate-500">Password</label>
                  <button type="button" className="text-xs font-bold text-[#2d5cd5] hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-[#2d5cd5] transition-all outline-none font-semibold pr-14"
                    placeholder="••••••••••••"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input type="checkbox" id="remember" className="w-5 h-5 rounded-lg border-slate-200 text-[#2d5cd5] focus:ring-[#2d5cd5]" />
                <label htmlFor="remember" className="text-sm font-bold text-slate-500">Remember me</label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-black text-center animate-shake uppercase tracking-wider">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2d5cd5] text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-12px_rgba(45,92,213,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(45,92,213,0.6)] active:scale-[0.97] disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            <div className="mt-12">
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Sign in with</span>
              </div>

              <div className="flex justify-center gap-5">
                {[Facebook, Twitter, Chrome, Apple].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#2d5cd5] hover:border-[#2d5cd5]/20 hover:bg-blue-50/50 transition-all active:scale-90">
                    <Icon size={18} fill="currentColor" className="opacity-80" />
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-black">Quick Access</p>
                <div className="grid grid-cols-2 gap-3">
                  {demoAccounts.map(acc => (
                    <button
                      key={acc.email}
                      onClick={() => quickLogin(acc.email, 'password123')}
                      className="bg-slate-50 hover:bg-blue-50 text-[#2d5cd5] py-3 px-4 rounded-2xl text-[10px] font-black transition-all border border-slate-100 uppercase tracking-tighter"
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center mt-8 sm:mt-10 text-xs sm:text-sm font-bold text-slate-400">
                Belum punya akun?{' '}
                <Link to="/register" className="text-[#2d5cd5] hover:underline">Daftar sekarang</Link>
              </p>

              <div className="mt-8 flex justify-center">
                <Link 
                  to="/user-guide" 
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#2d5cd5] transition-colors group"
                >
                  <BookOpen size={14} className="group-hover:rotate-12 transition-transform" />
                  View User Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstallPWA />
    </div>
  );
}
