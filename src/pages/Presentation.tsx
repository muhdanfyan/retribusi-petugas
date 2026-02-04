import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  BookOpen,
  LogIn,
  LayoutDashboard,
  Users,
  ScanLine,
  Database,
  FileText,
  BarChart3,
  User,
  Play,
  Pause,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 'intro',
    title: 'SIPANDA PETUGAS',
    subtitle: 'Sistem Informasi Pendapatan Daerah',
    content: (
      <div className="text-center space-y-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <BookOpen className="w-16 h-16 text-white" />
        </div>
        <div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">SIPANDA PETUGAS</h1>
          <p className="text-xl text-blue-200 font-bold">Panduan Pengguna Aplikasi Petugas Lapangan</p>
          <p className="text-blue-300/60 mt-2">Pemerintah Kota Baubau</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 pt-8">
          {['Pendataan WP', 'Penagihan', 'GPS Tracking', 'Pelaporan'].map((f, i) => (
            <span key={i} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-bold text-white">
              ✓ {f}
            </span>
          ))}
        </div>
      </div>
    ),
    bg: 'from-[#074764] via-blue-600 to-indigo-700'
  },
  {
    id: 'login',
    title: '1. Modul Login',
    subtitle: 'Gerbang masuk aplikasi',
    icon: <LogIn className="w-8 h-8" />,
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-gray-900">Cara Masuk</h2>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Masukkan Email resmi petugas' },
              { step: '2', text: 'Masukkan Password' },
              { step: '3', text: 'Tekan tombol SIGN IN' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black">
                  {item.step}
                </div>
                <p className="text-lg font-bold text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <p className="text-amber-800 font-bold text-sm">💡 Gunakan ikon 👁️ untuk melihat password</p>
          </div>
        </div>
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <img src="/user-guide/login.png" alt="Login" className="w-full" />
        </div>
      </div>
    ),
    bg: 'from-emerald-50 to-white'
  },
  {
    id: 'dashboard',
    title: '2. Dashboard',
    subtitle: 'Pantau kinerja harian',
    icon: <LayoutDashboard className="w-8 h-8" />,
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <img src="/user-guide/dashboard.png" alt="Dashboard" className="w-full" />
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-gray-900">Informasi Dashboard</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Penerimaan', desc: 'Uang diterima hari ini', color: 'blue' },
              { label: 'Billing Aktif', desc: 'Tagihan belum lunas', color: 'amber' },
              { label: 'WP Aktif', desc: 'Wajib Pajak terdaftar', color: 'emerald' },
              { label: 'Peta Potensi', desc: 'Lokasi objek pajak', color: 'rose' },
            ].map((item) => (
              <div key={item.label} className={`p-4 bg-${item.color}-50 rounded-2xl border border-${item.color}-100`}>
                <p className={`text-xs font-black text-${item.color}-600 uppercase tracking-wide mb-1`}>{item.label}</p>
                <p className="text-sm text-gray-600 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    bg: 'from-blue-50 to-white'
  },
  {
    id: 'wp-list',
    title: '3. Daftar Wajib Pajak',
    subtitle: 'Kelola data WP',
    icon: <Users className="w-8 h-8" />,
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-gray-900">Fitur Utama</h2>
          <div className="space-y-4">
            {[
              { icon: '🔍', text: 'Cari WP berdasarkan nama/NIK' },
              { icon: '➕', text: 'Tambah WP baru' },
              { icon: '✏️', text: 'Edit data WP' },
              { icon: '🗑️', text: 'Hapus WP (hati-hati!)' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-lg font-bold text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <img src="/user-guide/wp_list.png" alt="WP List" className="w-full" />
        </div>
      </div>
    ),
    bg: 'from-orange-50 to-white'
  },
  {
    id: 'wp-form',
    title: '4. Form Pendaftaran',
    subtitle: '5 langkah mudah',
    icon: <FileText className="w-8 h-8" />,
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <img src="/user-guide/wp_form.png" alt="WP Form" className="w-full" />
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-gray-900">5 Langkah Daftar</h2>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Identitas', desc: 'NIK, Nama, WhatsApp' },
              { step: '2', title: 'Kategori', desc: 'Jenis & Klasifikasi' },
              { step: '3', title: 'Persyaratan', desc: 'Upload dokumen' },
              { step: '4', title: 'Lokasi', desc: 'Titik GPS di peta' },
              { step: '5', title: 'Review', desc: 'Cek & Kirim' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg">
                  {item.step}
                </div>
                <div>
                  <p className="font-black text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    bg: 'from-indigo-50 to-white'
  },
  {
    id: 'scanner',
    title: '5. Scanner QR',
    subtitle: 'Cari data cepat',
    icon: <ScanLine className="w-8 h-8" />,
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-gray-900">Kegunaan Scanner</h2>
          <div className="space-y-4">
            {[
              { icon: '📱', title: 'Scan QR Kartu WP', desc: 'Buka profil WP langsung' },
              { icon: '📄', title: 'Scan QR Invoice', desc: 'Lihat detail tagihan' },
              { icon: '⌨️', title: 'Input Manual', desc: 'Jika kamera bermasalah' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <p className="font-black text-gray-900 text-lg">{item.title}</p>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <img src="/user-guide/scanner.png" alt="Scanner" className="w-full" />
        </div>
      </div>
    ),
    bg: 'from-violet-50 to-white'
  },
  {
    id: 'master-data',
    title: '6. Master Data',
    subtitle: 'Data referensi resmi',
    icon: <Database className="w-8 h-8" />,
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <img src="/user-guide/master_data.png" alt="Master Data" className="w-full" />
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-gray-900">Data Referensi</h2>
          <p className="text-gray-600 font-medium">Tab-tab yang tersedia (Read-Only):</p>
          <div className="grid grid-cols-2 gap-4">
            {['Jenis', 'Klasifikasi', 'Zona', 'Tarif'].map((tab) => (
              <div key={tab} className="p-4 bg-slate-100 rounded-2xl text-center">
                <p className="font-black text-slate-700">{tab}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-blue-800 font-bold text-sm">ℹ️ Data ini dikonfigurasi oleh Admin pusat</p>
          </div>
        </div>
      </div>
    ),
    bg: 'from-slate-50 to-white'
  },
  {
    id: 'billing',
    title: '7. Billing',
    subtitle: 'Terima setoran',
    icon: <FileText className="w-8 h-8" />,
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-gray-900">Alur Terima Setoran</h2>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Cari invoice status Pending 🟡' },
              { step: '2', text: 'Tekan tombol Bayar' },
              { step: '3', text: 'Pastikan uang sudah diterima' },
              { step: '4', text: 'Tekan KONFIRMASI BAYAR' },
              { step: '5', text: 'Status berubah Lunas ✅' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-black">
                  {item.step}
                </div>
                <p className="text-lg font-bold text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <img src="/user-guide/billing.png" alt="Billing" className="w-full" />
        </div>
      </div>
    ),
    bg: 'from-teal-50 to-white'
  },
  {
    id: 'reporting',
    title: '8. Laporan',
    subtitle: 'Export & analisa',
    icon: <BarChart3 className="w-8 h-8" />,
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <img src="/user-guide/reporting.png" alt="Reporting" className="w-full" />
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-gray-900">Fitur Laporan</h2>
          <div className="space-y-4">
            {[
              { icon: '📅', text: 'Filter berdasarkan tanggal' },
              { icon: '📊', text: 'Grafik penerimaan harian' },
              { icon: '📥', text: 'Export ke CSV/Excel' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-lg font-bold text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    bg: 'from-purple-50 to-white'
  },
  {
    id: 'profile',
    title: '9. Profil',
    subtitle: 'Akun & logout',
    icon: <User className="w-8 h-8" />,
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-black text-gray-900">Menu Profil</h2>
          <div className="space-y-4">
            {[
              { icon: '👁️', text: 'Lihat info akun' },
              { icon: '🔐', text: 'Ubah password' },
              { icon: '🌙', text: 'Toggle dark mode' },
              { icon: '🚪', text: 'Keluar dari Akun' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-lg font-bold text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
          <img src="/user-guide/profile.png" alt="Profile" className="w-full" />
        </div>
      </div>
    ),
    bg: 'from-gray-50 to-white'
  },
  {
    id: 'closing',
    title: 'Terima Kasih',
    subtitle: 'SIPANDA Petugas',
    content: (
      <div className="text-center space-y-8">
        <div className="w-32 h-32 mx-auto bg-white rounded-[3rem] flex items-center justify-center shadow-2xl">
          <img src="/logo-baubau.png" alt="Logo" className="w-20 h-20 object-contain" />
        </div>
        <div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Terima Kasih</h1>
          <p className="text-xl text-blue-200 font-bold">SIPANDA PETUGAS</p>
          <p className="text-blue-300/60 mt-2">Pemerintah Kota Baubau</p>
        </div>
        <div className="pt-8">
          <p className="text-white/60 text-sm">
            "Bersama Mewujudkan Pendapatan Daerah yang Optimal"
          </p>
        </div>
        <p className="text-blue-300/40 text-xs">Versi 2.0 | Februari 2026</p>
      </div>
    ),
    bg: 'from-[#074764] via-blue-600 to-indigo-700'
  },
];

export default function Presentation() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const slide = slides[currentSlide];
  const isFullscreen = slide.id === 'intro' || slide.id === 'closing';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${slide.bg} transition-all duration-700`}>
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg hover:bg-white transition-all"
        >
          <Home className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm font-black text-gray-900">{currentSlide + 1}</span>
          <span className="text-gray-400">/</span>
          <span className="text-sm font-bold text-gray-500">{slides.length}</span>
        </div>

        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
            isAutoPlay ? 'bg-blue-600 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
          }`}
        >
          {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
        <div 
          className="h-full bg-[#d9a742] transition-all duration-500"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Slide Content */}
      <div className="min-h-screen flex items-center justify-center px-8 py-24">
        <div className={`w-full ${isFullscreen ? 'max-w-3xl' : 'max-w-6xl'}`}>
          {!isFullscreen && (
            <div className="mb-8 flex items-center gap-4">
              {slide.icon && (
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl text-blue-600">
                  {slide.icon}
                </div>
              )}
              <div>
                <h3 className="text-3xl font-black text-gray-900">{slide.title}</h3>
                <p className="text-gray-500 font-bold">{slide.subtitle}</p>
              </div>
            </div>
          )}
          {slide.content}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-50">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-30 hover:bg-white transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? 'w-8 bg-[#074764]' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentSlide === slides.length - 1}
          className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-30 hover:bg-white transition-all"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-400 hidden md:block">
        ← → Navigasi | Space Lanjut | Esc Keluar
      </div>
    </div>
  );
}
