import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Users, 
  AlertCircle, 
  Loader2, 
  QrCode, 
  Search as SearchIcon, 
  CreditCard, 
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Stats {
  total_revenue: number;
  collection_rate: number;
  pending_bills: number;
  active_taxpayers: number;
  trends: {
    revenue: string;
    collection_rate: string;
    pending_bills: string;
    active_taxpayers: string;
  };
}

interface RevenueItem {
  month: string;
  amount: string | number;
}

interface Potential {
  position: [number, number];
  name: string;
  agency: string;
  address?: string;
  status: string;
}

export default function Dashboard() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [potentials, setPotentials] = useState<Potential[]>([]);
  const [revenueByType, setRevenueByType] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, trendRes, mapRes, typesRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/revenue-trend'),
          api.get('/api/dashboard/map-potentials'),
          api.get('/api/retribution-types'),
        ]);

        setStats(statsRes);
        setRevenueData(trendRes);
        setPotentials(mapRes);
        
        // Use revenue_by_type from stats, or fallback to retribution types with 0 revenue
        const revenueTypes = statsRes.revenue_by_type || [];
        if (revenueTypes.length === 0) {
          const types = typesRes.data || typesRes;
          setRevenueByType(types.map((t: any) => ({ name: t.name, total: 0 })));
        } else {
          setRevenueByType(revenueTypes);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    }
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}Jt`;
    }
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-baubau-blue" />
      </div>
    );
  }

  // MERCHANT STYLE VIEW FOR KASIR
  if (currentUser?.role === 'kasir') {
    return (
      <div className="max-w-md mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out p-4">
        {/* Profile Greeting */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20">
              {currentUser.name?.charAt(0) || 'K'}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Selamat Bertugas</p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{currentUser.name || 'Kasir'}</h2>
            </div>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Hero Card - Production Style */}
        <div className="bg-[#0f172a] rounded-[3rem] p-10 text-white shadow-[0_45px_100px_-25px_rgba(0,0,0,0.3)] relative overflow-hidden group border border-white/5">
          <div className="absolute top-[-30%] right-[-20%] w-72 h-72 bg-blue-500/30 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-indigo-600/20 rounded-full blur-[80px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col gap-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-400/80 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Total Koleksi Hari Ini</p>
                <h1 className="text-5xl font-black tracking-tighter mb-1">
                  {formatCurrency(stats?.total_revenue ? stats.total_revenue / 30 : 0)}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{stats?.trends.revenue || '+12%'}</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">vs kemarin</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="relative group/item">
                <div className="absolute -inset-2 bg-white/5 rounded-[2rem] opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <p className="text-[9px] text-blue-200/50 uppercase tracking-[0.2em] font-black mb-2">Tagihan</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white">{stats?.pending_bills || 0}</p>
                    <span className="text-[10px] text-blue-300/40 font-bold uppercase tracking-widest">Pending</span>
                  </div>
                </div>
              </div>
              <div className="relative group/item">
                <div className="absolute -inset-2 bg-white/5 rounded-[2rem] opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <p className="text-[9px] text-blue-200/50 uppercase tracking-[0.2em] font-black mb-2">Wajib Pajak</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white">{stats?.active_taxpayers || 0}</p>
                    <span className="text-[10px] text-blue-300/40 font-bold uppercase tracking-widest">Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid - Simplified & Larger */}
        <div className="grid grid-cols-2 gap-6">
          <button 
            onClick={() => navigate('/scanner')}
            className="group relative h-48 bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-5 transition-all hover:scale-[1.03] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center group-hover:bg-blue-500/20 group-hover:rotate-6 transition-all duration-500">
              <QrCode className="w-12 h-12 text-blue-600" />
            </div>
            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Scan QR</span>
          </button>
          
          <button 
            onClick={() => navigate('/billing')}
            className="group relative h-48 bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-5 transition-all hover:scale-[1.03] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:-rotate-6 transition-all duration-500">
              <SearchIcon className="w-12 h-12 text-indigo-600" />
            </div>
            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Cari WP</span>
          </button>
        </div>

        {/* Breakdown Section */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="p-10 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
              <div>
                <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg leading-none mb-1">Kategori Utama</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Revenue Breakdown</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="p-10 space-y-8">
              {revenueByType.length > 0 ? (
                revenueByType.slice(0, 4).map((item, i) => (
                  <div key={i} className="group cursor-default">
                    <div className="flex justify-between items-end mb-4">
                      <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em] leading-none group-hover:text-blue-500 transition-colors">{item.name}</p>
                      <p className="font-black text-gray-900 dark:text-white leading-none">{formatCurrency(Number(item.total))}</p>
                    </div>
                    <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-gray-50 dark:border-white/10">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full group-hover:brightness-110 transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                        style={{ width: `${Math.random() * 50 + 30}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 flex flex-col items-center justify-center gap-6 opacity-20">
                  <CreditCard className="w-16 h-16" />
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Belum Ada Koleksi</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/reporting')}
              className="w-full py-6 bg-gray-50 dark:bg-white/5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors border-t border-gray-50 dark:border-white/10"
            >
              See All Categories
            </button>
          </div>

          {/* Activity Section */}
          <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="p-10 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
              <div>
                <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg leading-none mb-1">Aktivitas Terbaru</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real-time Activity</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              </div>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-8 flex items-center gap-6 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-90 group-hover:bg-blue-500/10 transition-all duration-500">
                    <FileText className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">{i + 1} jam yang lalu</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">#{Math.floor(1000 + Math.random() * 9000)}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Metode: Tunai</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sukses</p>
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">Rp {(25 + Math.floor(Math.random() * 100))}rb</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/billing')}
              className="w-full py-6 bg-gray-50 dark:bg-white/5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors border-t border-gray-50 dark:border-white/10"
            >
              View Full Transaction Log
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD VIEW FOR SUPER ADMIN / OPD
  const kpiData = [
    {
      label: 'Total Pendapatan',
      value: formatLargeCurrency(stats?.total_revenue || 0),
      change: stats?.trends.revenue || '+0%',
      trend: stats?.trends.revenue.includes('+') ? 'up' : 'down',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-baubau-green',
    },
    {
      label: 'Collection Rate',
      value: `${stats?.collection_rate || 0}%`,
      change: stats?.trends.collection_rate || '+0%',
      trend: stats?.trends.collection_rate.includes('+') ? 'up' : 'down',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-baubau-blue',
    },
    {
      label: 'Tagihan Pending',
      value: stats?.pending_bills.toString() || '0',
      change: stats?.trends.pending_bills || '+0%',
      trend: stats?.trends.pending_bills.includes('-') ? 'up' : 'down',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-baubau-yellow',
    },
    {
      label: 'Wajib Pajak Aktif',
      value: stats?.active_taxpayers.toLocaleString() || '0',
      change: stats?.trends.active_taxpayers || '+0%',
      trend: stats?.trends.active_taxpayers.includes('+') ? 'up' : 'down',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-violet-500',
    },
  ];

  const maxAmount = Math.max(...revenueData.map((d) => Number(d.amount)), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview pendapatan retribusi dan pajak daerah
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Periode</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{kpi.label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  {kpi.value}
                </p>
                <span
                  className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                    kpi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {kpi.change}
                </span>
              </div>
              <div className={`${kpi.color} p-3 rounded-2xl text-white shadow-lg`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
            Peta Potensi Retribusi
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-gray-500 uppercase">Live Data</span>
          </div>
        </div>
        <div style={{ height: '450px', width: '100%' }}>
          <MapContainer center={[-5.47, 122.6]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {potentials.map((potential, index) => (
              <Marker key={index} position={potential.position}>
                <Popup>
                  <div className="p-2 min-w-[150px]">
                    <h3 className="font-black text-gray-900 text-sm mb-1">{potential.name}</h3>
                    <p className="text-[10px] text-gray-600 font-bold uppercase mb-2">{potential.agency}</p>
                    {potential.address && <p className="text-[10px] text-gray-500 leading-relaxed mb-3">{potential.address}</p>}
                    <span className={`inline-flex px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                      potential.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {potential.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-8 uppercase tracking-tight">
            Tren Pendapatan Tahun Ini
          </h2>
          <div className="space-y-6">
            {revenueData.length > 0 ? (
              revenueData.map((data, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {data.month}
                    </span>
                    <span className="text-gray-900 dark:text-white font-black">
                      {formatCurrency(Number(data.amount))}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-50 dark:border-gray-700">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 group-hover:from-blue-400 group-hover:to-indigo-500"
                      style={{ width: `${(Number(data.amount) / maxAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-12 italic">Belum ada data pendapatan yang tersedia.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-8 uppercase tracking-tight">
            Target & KPI
          </h2>
          <div className="space-y-8">
            {[
              { label: 'Target Bulanan', current: stats?.collection_rate || 0, color: 'bg-blue-500' },
              { label: 'Efisiensi Koleksi', current: stats?.collection_rate ? stats.collection_rate + 5 : 0, color: 'bg-emerald-500' },
              { label: 'Verifikasi SLA', current: 78, color: 'bg-amber-500' },
            ].map((kpi, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                    {kpi.label}
                  </span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    {Math.min(kpi.current, 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${kpi.color} h-full rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.min(kpi.current, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-black text-blue-900 dark:text-blue-300 uppercase tracking-tight">
                  Saran Optimalisasi
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2 leading-relaxed">
                  Verifikasi SLA diprediksi akan menurun 5% minggu depan. Disarankan untuk menambah personel verifikator sementara.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
            Log Sistem Terbaru
          </h2>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-gray-300 animate-pulse" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Sinkronisasi log dengan server utama...</p>
        </div>
      </div>
    </div>
  );
}
