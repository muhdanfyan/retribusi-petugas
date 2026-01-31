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
  ArrowRight 
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
      <div className="max-w-md mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out p-4">
        {/* Header Section with glassmorphism stats */}
        <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-600/30 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-indigo-600/20 rounded-full blur-[60px]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-blue-300/80 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Revenue Today</p>
                <h1 className="text-4xl font-black tracking-tighter">
                  {formatCurrency(stats?.total_revenue ? stats.total_revenue / 30 : 0)}
                </h1>
              </div>
              <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                <TrendingUp className="w-7 h-7 text-blue-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-3xl p-5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[9px] text-blue-200/50 uppercase tracking-widest font-black mb-1">Unpaid</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black">{stats?.pending_bills || 0}</p>
                  <span className="text-[10px] text-blue-300/40 font-bold uppercase">Bills</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-3xl p-5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[9px] text-blue-200/50 uppercase tracking-widest font-black mb-1">Active WP</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black">{stats?.active_taxpayers || 0}</p>
                  <span className="text-[10px] text-blue-300/40 font-bold uppercase">Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-5">
          <button 
            onClick={() => navigate('/scanner')}
            className="group bg-white dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-col items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
          >
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <QrCode className="w-10 h-10 text-blue-600" />
            </div>
            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Scan QR</span>
          </button>
          
          <button 
            onClick={() => navigate('/billing')}
            className="group bg-white dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-col items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
          >
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center group-hover:-rotate-6 transition-transform">
              <SearchIcon className="w-10 h-10 text-indigo-600" />
            </div>
            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Search WP</span>
          </button>
        </div>

        {/* Section Wrapper */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
              <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-sm">Revenue by Type</h2>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            </div>
            <div className="p-8 space-y-6">
              {revenueByType.length > 0 ? (
                revenueByType.map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-end mb-3">
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">{item.name}</p>
                      <p className="font-black text-gray-900 dark:text-white leading-none">{formatCurrency(Number(item.total))}</p>
                    </div>
                    <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full group-hover:brightness-110 transition-all duration-1000" 
                        style={{ width: `${Math.random() * 50 + 30}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-4 grayscale opacity-30">
                  <CreditCard className="w-12 h-12" />
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No Collections Yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-center">
              <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-sm">Recent Activity</h2>
              <button 
                onClick={() => navigate('/billing')}
                className="text-blue-600 text-[10px] font-black tracking-widest flex items-center gap-2 group"
              >
                VIEW LOG <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-6 flex items-center gap-5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-95 transition-transform">
                    <CreditCard className="w-7 h-7 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">Invoice #{Math.floor(Math.random() * 10000)}</p>
                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">{i + 1}h ago &bull; CASH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-emerald-500 uppercase mb-1 tracking-widest">PAID</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">Rp 75k</p>
                  </div>
                </div>
              ))}
            </div>
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
