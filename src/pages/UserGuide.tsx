import { 
  BookOpen, 
  LogIn, 
  LayoutDashboard, 
  Users, 
  ScanLine, 
  Database, 
  FileText, 
  BarChart3, 
  Info,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  MousePointer2,
  Eye,
  LogOut,
  Trash2,
  Edit3,
  Camera,
  Download,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserGuide() {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'login',
      title: '1. Modul Login',
      icon: <LogIn className="w-6 h-6 text-emerald-500" />,
      color: 'emerald',
      description: 'Gerbang utama untuk memverifikasi identitas Anda sebagai petugas resmi Pemerintah Kota Baubau.',
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                <tr>
                  <th className="px-4 py-3 font-black uppercase tracking-wider">Aksi</th>
                  <th className="px-4 py-3 font-black uppercase tracking-wider">Cara</th>
                  <th className="px-4 py-3 font-black uppercase tracking-wider">Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="px-4 py-3 font-bold">Masuk</td>
                  <td className="px-4 py-3">Email & Password, tekan <span className="text-blue-600 font-bold">Login</span></td>
                  <td className="px-4 py-3 italic">Buka Dashboard</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold">Cek Password</td>
                  <td className="px-4 py-3">Tekan ikon <Eye className="inline w-4 h-4" /></td>
                  <td className="px-4 py-3 italic">Karakter terlihat</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold">Membatalkan</td>
                  <td className="px-4 py-3">Tutup tab/aplikasi</td>
                  <td className="px-4 py-3 italic">Sesi aman</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: '2. Modul Dashboard',
      icon: <LayoutDashboard className="w-6 h-6 text-blue-500" />,
      color: 'blue',
      description: 'Monitor hasil kerja harian Anda dalam satu layar ringkas.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Wajib Retribusi', desc: 'Jumlah orang/toko terdata' },
            { label: 'Total Billing Aktif', desc: 'Tagihan belum lunas' },
            { label: 'Penerimaan Hari Ini', desc: 'Total uang (Rupiah)' }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'manajemen',
      title: '3. Manajemen Wajib Retribusi',
      icon: <Users className="w-6 h-6 text-orange-500" />,
      color: 'orange',
      description: 'Tempat mengelola "Buku Induk" Wajib Retribusi (Daftar, Edit, Hapus).',
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h4 className="font-black text-sm uppercase tracking-tight mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Alur Pendaftaran (5 Tahap)
            </h4>
            <div className="space-y-4">
              {[
                { s: '1', t: 'Identitas', d: 'NIK, Nama, WA. Tekan "Selanjutnya".' },
                { s: '2', t: 'Skema', d: 'Pilih Jenis & Bidang Retribusi.' },
                { s: '3', t: 'Detail', d: 'Isi teknis & Upload foto fisik.' },
                { s: '4', t: 'Lokasi', d: 'Geser Pin Peta & Isi alamat.' },
                { s: '5', t: 'Simpan', d: 'Tekan "Simpan & Daftarkan".' }
              ].map((step) => (
                <div key={step.s} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-[10px] font-black text-orange-600 shrink-0">{step.s}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{step.t}</p>
                    <p className="text-xs text-gray-500">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2 font-black text-xs text-blue-700">
                <Edit3 className="w-4 h-4" /> UBAH (EDIT)
              </div>
              <p className="text-xs text-gray-600">Tekan ikon Pensil Biru, ubah data, lalu tekan "Update Data" di tahap akhir.</p>
            </div>
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800">
              <div className="flex items-center gap-2 mb-2 font-black text-xs text-rose-700">
                <Trash2 className="w-4 h-4" /> HAPUS
              </div>
              <p className="text-xs text-gray-600">Tekan ikon Sampah Merah, lalu konfirmasi "Ya, Hapus" untuk hapus permanen.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'scanner',
      title: '4. Modul Scanner Lapangan',
      icon: <ScanLine className="w-6 h-6 text-indigo-500" />,
      color: 'indigo',
      description: 'Mencari data warga secepat kilat menggunakan kamera.',
      content: (
        <div className="space-y-4">
          <div className="flex flex-col items-center p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-800">
            <Camera className="w-12 h-12 text-indigo-400 mb-4" />
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Arahkan Kamera ke QR Code</p>
            <p className="text-xs text-indigo-600/60 mt-1">Gunakan "Input Manual" jika kamera buram</p>
          </div>
          <p className="text-xs text-gray-500 italic flex items-center gap-2">
            <Info className="w-4 h-4" /> Tekan tombol Panah Kembali (Kiri Atas) untuk menutup kamera.
          </p>
        </div>
      )
    },
    {
      id: 'master',
      title: '5. Modul Master Data',
      icon: <Database className="w-6 h-6 text-slate-500" />,
      color: 'slate',
      description: 'Pusat informasi harga dan aturan (Read-Only).',
      content: (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Tab: JENIS</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Berisi daftar kategori besar retribusi (misal: Retribusi Sampah, Pasar). Di sini Anda bisa melihat **Tarif Dasar** dan **Satuan** hitungnya.</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Tab: KLASIFIKASI</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Berisi pembagian bidang di dalam jenis retribusi. Digunakan untuk menentukan skema form yang akan muncul saat pendaftaran.</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Tab: ZONA</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Menampilkan wilayah atau lokasi khusus yang memiliki **Multiplier** (pengali tarif) berbeda-beda sesuai letak geografis.</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Tab: TARIF</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Kombinasi akhir antara Jenis + Klasifikasi + Zona. Merupakan nominal pasti yang akan ditagihkan kepada masyarakat.</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
              <strong>Info Penting:</strong> Menu ini hanya bersifat referensi. Petugas tidak dapat menambah atau mengubah tarif. Jika terdapat perbedaan harga di lapangan dengan aplikasi, segera lapor ke Admin OPD.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'billing',
      title: '6. Billing & Pembayaran',
      icon: <FileText className="w-6 h-6 text-teal-500" />,
      color: 'teal',
      description: 'Mencetak Nota (Tagihan) dan menerima Bayaran.',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="font-black text-[10px] text-teal-600 uppercase tracking-widest">Terbitkan Nota</h5>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <p className="text-xs font-bold">1. Tekan "Generate" (Biru)</p>
              <p className="text-xs text-gray-500">2. Isi Target & Jatuh Tempo</p>
              <p className="text-xs text-gray-500">3. Tekan "Buat Tagihan"</p>
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="font-black text-[10px] text-emerald-600 uppercase tracking-widest">Terima Bayaran</h5>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
              <p className="text-xs font-bold text-emerald-900">1. Tekan "Bayar" (Hijau)</p>
              <p className="text-xs text-emerald-700">2. Terima Uang Tunai Sesuai Layar</p>
              <p className="text-xs text-emerald-700">3. Tekan "Konfirmasi Bayar"</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reporting',
      title: '7. Modul Laporan',
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
      color: 'purple',
      description: 'Laporan rekapitulasi setoran untuk diserahkan ke Dinas.',
      content: (
        <div className="flex items-center justify-between p-6 bg-purple-50 dark:bg-purple-900/20 rounded-3xl border border-purple-100 dark:border-purple-800">
          <div className="space-y-2">
            <p className="text-sm font-bold text-purple-900 dark:text-purple-300 leading-none">Ekspor ke Excel/CSV</p>
            <p className="text-xs text-purple-600">Download rekap transaksi dalam satu klik.</p>
          </div>
          <button className="p-4 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-500/20">
            <Download className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">User Guide</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aplikasi Petugas SIPANDA</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
          <BookOpen size={24} />
        </div>
      </div>

      {/* Intro Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-black mb-4 tracking-tight">Kuasai Aplikasi dalam 10 Menit.</h2>
          <p className="text-blue-100 font-medium leading-relaxed">
            Ikuti panduan visual dan langkah-langkah praktis di bawah ini untuk memudahkan tugas penagihan Anda di lapangan.
          </p>
        </div>
        <HelpCircle className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 rotate-12" />
      </div>

      {/* Sections Loop */}
      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl bg-${section.color}-50 dark:bg-${section.color}-900/20 flex items-center justify-center`}>
                {section.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{section.title}</h3>
                <p className="text-sm text-gray-500 font-medium">{section.description}</p>
              </div>
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="bg-slate-900 dark:bg-gray-800 rounded-3xl p-8 text-center space-y-6">
        <div>
          <h4 className="text-xl font-black text-white mb-2">Ingat Kode Warna!</h4>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { c: 'bg-blue-500', l: 'Simpan/Lanjut' },
              { c: 'bg-emerald-500', l: 'Bayar/Lunas' },
              { c: 'bg-rose-500', l: 'Hapus/Batal' },
              { c: 'bg-gray-500', l: 'Tutup/Abu' }
            ].map((tag, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${tag.c}`}></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tag.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
