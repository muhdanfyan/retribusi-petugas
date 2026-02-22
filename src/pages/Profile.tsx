import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { 
  User, 
  Key, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Globe,
  Palette,
  Shield,
  Smartphone,
  ArrowLeft,
  Pencil,
  X,
  Eye,
  EyeOff,
  LogOut,
  FileText,
  Upload,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadingSurat, setUploadingSurat] = useState(false);
  const suratInputRef = useRef<HTMLInputElement>(null);

  const suratPenugasanUrl = (user as any)?.metadata?.surat_penugasan_url || null;

  const handleUploadSurat = async (file: File) => {
    setUploadingSurat(true);
    try {
      const formData = new FormData();
      formData.append('name', user?.name || '');
      formData.append('email', user?.email || '');
      formData.append('surat_penugasan', file);
      formData.append('_method', 'PUT');

      const response = await api.post('/api/user/profile', formData);
      updateUser(response.user);
      setMessage({ type: 'success', text: 'Surat Penugasan berhasil diupload' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal upload surat penugasan' });
    } finally {
      setUploadingSurat(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.put('/api/user/profile', profileForm);
      updateUser(response.user);
      setMessage({ type: 'success', text: response.message || 'Profil berhasil diperbarui' });
      setTimeout(() => setShowEditModal(false), 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal memperbarui profil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak sesuai' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/api/user/password', passwordForm);
      setMessage({ type: 'success', text: response.message || 'Password berhasil diubah' });
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal mengubah password' });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: Globe, label: 'Bahasa', value: 'Indonesia', onClick: () => {} },
    { icon: Palette, label: 'Tampilan', value: 'Light', onClick: () => {} },
    { icon: Shield, label: 'Keamanan Aplikasi', onClick: () => {} },
    { icon: Smartphone, label: 'Kelola Perangkat', onClick: () => {} },
    { icon: Key, label: 'Ganti Password', onClick: () => setShowPasswordModal(true) },
    { 
      icon: LogOut, 
      label: 'Keluar dari Akun', 
      className: 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20',
      iconClassName: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500', 
      onClick: () => { logout(); navigate('/login'); } 
    },
  ];


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Gradient Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-orange-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 h-64 rounded-b-[3rem]"></div>
        
        {/* Back Button */}
        <div className="relative z-10 px-4 pt-12 pb-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Title */}
        <div className="relative z-10 px-6 pb-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="relative z-10 -mt-4 mx-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 text-center">
          {/* Avatar Area */}
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#2d5cd5] to-blue-500 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-500/30 border-4 border-white dark:border-slate-800 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              {user?.name?.charAt(0) || <User size={40} />}
            </div>
          </div>
          
          {/* User Info */}
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center justify-center gap-1">
            <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
            {user?.opd && (
              <>
                <span className="mx-1">•</span>
                <span>{user.opd.name}</span>
              </>
            )}
          </p>

          {/* Edit Profile Button */}
          <button 
            onClick={() => setShowEditModal(true)}
            className="mt-8 w-full py-4 bg-[#2d5cd5] hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Surat Penugasan Section */}
      <div className="mt-6 mx-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Surat Penugasan</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Scan/foto surat penugasan dari kantor</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {message && message.text.includes('Surat') && (
              <div className={`p-3 rounded-xl flex items-center gap-2 text-sm mb-4 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </div>
            )}

            {suratPenugasanUrl ? (
              <div className="space-y-3">
                {/* Preview */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  {suratPenugasanUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex items-center justify-center py-8">
                      <FileText size={48} className="text-amber-500" />
                      <span className="ml-3 text-sm font-bold text-slate-500">Dokumen PDF</span>
                    </div>
                  ) : (
                    <img
                      src={suratPenugasanUrl}
                      alt="Surat Penugasan"
                      className="w-full max-h-48 object-contain"
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={suratPenugasanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={14} />
                    Lihat
                  </a>
                  <button
                    onClick={() => suratInputRef.current?.click()}
                    disabled={uploadingSurat}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadingSurat ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Ganti File
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => suratInputRef.current?.click()}
                disabled={uploadingSurat}
                className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all flex flex-col items-center gap-3 disabled:opacity-50"
              >
                {uploadingSurat ? (
                  <Loader2 size={28} className="animate-spin text-amber-500" />
                ) : (
                  <Upload size={28} className="text-slate-400" />
                )}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                    {uploadingSurat ? 'Mengupload...' : 'Upload Surat Penugasan'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, atau PDF • Maks. 5MB</p>
                </div>
              </button>
            )}

            <input
              ref={suratInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadSurat(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="mt-6 mx-4 space-y-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {menuItems.slice(0, 2).map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon size={22} className="text-[#2d5cd5]" />
                </div>
                <span className="font-black text-[11px] uppercase tracking-widest text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-sm text-slate-400">{item.value}</span>}
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {menuItems.slice(2).map((item: any, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${item.className || ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${item.iconClassName || 'bg-slate-50 dark:bg-slate-800/50 text-[#2d5cd5]'}`}>
                  <item.icon size={22} />
                </div>
                <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              {message && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ganti Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {message && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Key size={18} />
                    Ganti Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
