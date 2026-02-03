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
  Eye,
  Trash2,
  Edit3,
  Camera,
  Download,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Highlight = ({ children, color = 'blue' }: { children: React.ReactNode, color?: 'blue' | 'emerald' | 'rose' | 'amber' }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800',
    rose: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800',
  };
  
  return (
    <span className={`px-1.5 py-0.5 rounded-md border font-black text-[0.9em] whitespace-nowrap ${colors[color]}`}>
      {children}
    </span>
  );
};

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
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                <tr>
                  <td className="px-4 py-3 font-bold">Masuk</td>
                  <td className="px-4 py-3">Email & Password, tekan <Highlight color="blue">Login</Highlight></td>
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
          <div className="space-y-8">
            {/* Create Flow */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="w-16 h-16" />
              </div>
              <h4 className="font-black text-sm uppercase tracking-tight mb-6 flex items-center gap-2 text-orange-600">
                <CheckCircle2 className="w-5 h-5" />
                Alur Pendaftaran (WP Baru)
              </h4>
              <div className="space-y-4">
                {[
                  { s: '1', t: 'Identitas', d: 'Masukkan NIK, Nama, dan Lokasi Kecamatan.' },
                  { s: '2', t: 'Skema', d: 'Pilih kategori retribusi yang sesuai usaha.' },
                  { s: '3', t: 'Detail', d: 'Isi variabel teknis & upload foto fisik.' },
                  { s: '4', t: 'Mapping', d: 'Tandai titik koordinat tepat di peta.' },
                  { s: '5', t: 'Simpan', d: 'Tekan tombol "Simpan & Daftarkan".' }
                ].map((step) => (
                  <div key={step.s} className="flex gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-[10px] font-black text-orange-600 shrink-0 group-hover:scale-110 transition-transform">{step.s}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{step.t}</p>
                      <p className="text-xs text-gray-500">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Flow */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-800 shadow-xl shadow-blue-500/5">
              <h4 className="font-black text-sm uppercase tracking-tight mb-8 flex items-center gap-3 text-blue-600">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                Alur Pengubahan (Edit) Data
              </h4>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">1</div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                    Temukan nama warga, lalu tekan tombol <Highlight color="blue">Ikon Pensil Biru</Highlight> di baris tabel paling kanan.
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">2</div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                    Gunakan panel navigasi kiri untuk langsung melompat ke bagian yang ingin diubah (Misal: <Highlight color="amber">Persyaratan</Highlight>).
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">3</div>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                      Selesaikan perubahan, lalu pada tahap terakhir tekan tombol <Highlight color="emerald">Update Data</Highlight>.
                    </p>
                    <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Info className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] font-bold text-blue-800 dark:text-blue-400 leading-relaxed italic">
                        PEMBATALAN: Jika ragu, tekan tombol <Highlight color="rose">Batalkan</Highlight> di posisi kiri bawah layar sebelum menekan update.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Flow */}
            <div className="bg-rose-50/50 dark:bg-rose-900/10 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-800 shadow-xl shadow-rose-500/5">
              <h4 className="font-black text-sm uppercase tracking-tight mb-8 flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                Alur Penghapusan (Hapus) Data
              </h4>
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">1</div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                    Tekan tombol <Highlight color="rose">Ikon Tempat Sampah Merah</Highlight> pada data yang ingin dibuang.
                  </p>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">2</div>
                  <div className="space-y-5">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                      Konfirmasi keamanan akan muncul. Pastikan Anda tidak salah pilih objek.
                    </p>
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-rose-100 flex flex-col items-center gap-4 shadow-sm">
                      <AlertTriangle className="w-8 h-8 text-rose-500 animate-bounce" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Tindakan Akhir:</p>
                      <div className="flex gap-4">
                        <button className="px-6 py-2 bg-rose-600 text-white text-[10px] font-black rounded-xl uppercase shadow-lg shadow-rose-500/20">Ya, Hapus Sekarang</button>
                        <button className="px-6 py-2 bg-gray-100 text-gray-500 text-[10px] font-black rounded-xl uppercase">Jangan Hapus</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-16 flex items-start gap-3 p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-500/10">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <p className="text-[11px] font-black uppercase tracking-wider leading-relaxed">
                    DANGER: DATA YANG DIHAPUS TIDAK DAPAT DIKEMBALIKAN LAGI.
                  </p>
                </div>
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
            <Info className="w-4 h-4" /> Tekan tombol <Highlight color="slate">Panah Kembali</Highlight> di pojok kiri atas untuk menutup kamera.
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
                <p className="text-sm text-gray-700 dark:text-gray-300">Daftar kategori besar. Cek <Highlight color="amber">Tarif Dasar</Highlight> dan <Highlight color="blue">Satuan</Highlight> (misal: per bulan/hari).</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Tab: KLASIFIKASI</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Pembagian <Highlight color="blue">Bidang Usaha</Highlight> untuk menentukan formulir penginputan.</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Tab: ZONA</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Peta wilayah yang memiliki <Highlight color="amber">Pengali (Multiplier)</Highlight> tarif berbeda.</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Tab: TARIF</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Nominal <Highlight color="emerald">Harga Jadi</Highlight> yang akan muncul di nota tagihan.</p>
              </div>
            </div>
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
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <p className="text-xs font-bold leading-relaxed">1. Tekan <Highlight color="blue">Generate</Highlight></p>
              <p className="text-xs text-gray-500 italic">2. Pilih objek & atur tanggal jatuh tempo</p>
              <p className="text-xs font-bold leading-relaxed">3. Tekan <Highlight color="blue">Buat Tagihan</Highlight></p>
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="font-black text-[10px] text-emerald-600 uppercase tracking-widest">Terima Bayaran</h5>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
              <p className="text-xs font-bold text-emerald-900">1. Tekan <Highlight color="emerald">Bayar</Highlight> (Hijau)</p>
              <p className="text-xs text-emerald-700 italic">2. Terima uang tunai sesuai tagihan</p>
              <p className="text-xs font-bold text-emerald-900">3. Tekan <Highlight color="emerald">Konfirmasi Bayar</Highlight></p>
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
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-8 px-6 lg:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-gray-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">User Guide</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Instruksi Operasional Petugas</p>
          </div>
        </div>
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
          <BookOpen size={28} />
        </div>
      </div>

      {/* Intro Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-black mb-4 tracking-tighter">Siap Bertugas?</h2>
          <p className="text-blue-50/70 font-bold leading-relaxed text-sm">
            Klik dan pelajari setiap modul di bawah ini. Kami menandai teks-teks penting dengan <Highlight color="amber">Warna Kuning</Highlight> untuk membantu Anda fokus.
          </p>
        </div>
        <HelpCircle className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 rotate-12" />
      </div>

      {/* Sections Loop */}
      <div className="space-y-20">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="scroll-mt-24 group">
            <div className="flex items-center gap-6 mb-8">
              <div className={`w-16 h-16 rounded-3xl bg-${section.color}-500 flex items-center justify-center text-white shadow-lg shadow-${section.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                {section.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">{section.title}</h3>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">{section.description}</p>
              </div>
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-10 bg-slate-50 dark:bg-gray-800 rounded-[3rem] border border-slate-100 dark:border-gray-700 text-center space-y-8">
        <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Butuh bantuan lebih lanjut?</h4>
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin OPD</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none">
              <Download className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual PDF</p>
          </div>
        </div>
      </div>
    </div>
  );
}
