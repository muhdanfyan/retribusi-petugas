import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, LogIn, Loader2 } from 'lucide-react';

export default function PetugasLogin() {
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

    const result = await login(email, password);
    const { error: loginError, user } = result as { error: string | null, user?: any };
    
    if (!loginError) {
      if (user?.role === 'kasir' || user?.role === 'super_admin') {
        navigate('/billing');
      } else {
        setError('Hanya akun Petugas yang dapat login melalui jalur ini.');
      }
    } else {
      setError(loginError || 'Email atau password salah');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#070e27] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <CreditCard className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                  PETUGAS <span className="text-blue-400">BAPENDA</span>
                </h1>
                <p className="text-xs text-blue-200/60 font-black uppercase tracking-[0.2em]">
                  FIELD OFFICER PORTAL
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">
                  Email Petugas
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all outline-none text-sm font-medium"
                    placeholder="nama@bapenda.go.id"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest ml-1">
                  Kata Sandi
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/20 focus:ring-2 focus:ring-blue-500 focus:bg-white/10 transition-all outline-none text-sm font-medium"
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 backdrop-blur-md rounded-2xl text-red-300 text-xs font-bold text-center animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-12px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.6)] active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>LOGIN PORTAL</span>
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-white/[0.02] p-6 text-center border-t border-white/5 backdrop-blur-md">
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
              &copy; 2026 SIPANDA Online &bull; KOTA BAUBAU
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
