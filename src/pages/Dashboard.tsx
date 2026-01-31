import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  FileText, 
  Users, 
  AlertCircle, 
  Loader2, 
  QrCode, 
  Search as SearchIcon, 
  CreditCard, 
  BarChart3,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Map as MapIcon,
  Activity
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
  const { user } = useAuth();
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
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}Jt`;
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#2d5cd5]" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* Top Section: Greeting & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Command Center
            <span className="text-[10px] font-black bg-[#2d5cd5] text-white px-3 py-1 rounded-full uppercase tracking-widest align-middle">Beta</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Hello, {user?.name}. Here's what's happening today.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/scanner')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#2d5cd5] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-[0_15px_30px_-10px_rgba(45,92,213,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(45,92,213,0.6)] hover:-translate-y-0.5 transition-all"
          >
            <QrCode size={18} />
            Scan QR Code
          </button>
          <button 
            onClick={() => navigate('/billing')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-100 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all"
          >
            <SearchIcon size={18} />
            Search Taxpayer
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Revenue', 
            value: formatLargeCurrency(stats?.total_revenue || 0), 
            change: stats?.trends.revenue || '+0%',
            trend: stats?.trends.revenue.includes('+') ? 'up' : 'down',
            icon: DollarSign, 
            bg: 'bg-blue-500/10', 
            text: 'text-blue-600',
            glow: 'shadow-blue-500/10'
          },
          { 
            label: 'Collection Rate', 
            value: `${stats?.collection_rate || 0}%`, 
            change: stats?.trends.collection_rate || '+0%',
            trend: stats?.trends.collection_rate.includes('+') ? 'up' : 'down',
            icon: TrendingUp, 
            bg: 'bg-emerald-500/10', 
            text: 'text-emerald-600',
            glow: 'shadow-emerald-500/10'
          },
          { 
            label: 'Pending Bills', 
            value: stats?.pending_bills.toLocaleString() || '0', 
            change: stats?.trends.pending_bills || '+0%',
            trend: stats?.trends.pending_bills.includes('-') ? 'up' : 'down',
            icon: FileText, 
            bg: 'bg-amber-500/10', 
            text: 'text-amber-600',
            glow: 'shadow-amber-500/10'
          },
          { 
            label: 'Active Taxpayers', 
            value: stats?.active_taxpayers.toLocaleString() || '0', 
            change: stats?.trends.active_taxpayers || '+0%',
            trend: stats?.trends.active_taxpayers.includes('+') ? 'up' : 'down',
            icon: Users, 
            bg: 'bg-indigo-500/10', 
            text: 'text-indigo-600',
            glow: 'shadow-indigo-500/10'
          }
        ].map((kpi, i) => (
          <div key={i} className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm ${kpi.glow} hover:shadow-xl transition-all group`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`${kpi.bg} p-3 rounded-2xl ${kpi.text} group-hover:scale-110 transition-transform`}>
                <kpi.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {kpi.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {kpi.change}
              </div>
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{kpi.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Grid: Map & Trends */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Potentials Map */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <MapIcon size={20} className="text-[#2d5cd5]" />
                  Potensi Retribusi Daerah
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Real-time Location Data Tracking</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Live Data</span>
              </div>
            </div>
            <div className="flex-1 relative">
              <MapContainer center={[-5.47, 122.6]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {potentials.map((potential, index) => (
                  <Marker key={index} position={potential.position}>
                    <Popup>
                      <div className="p-3 min-w-[200px] font-sans">
                        <h3 className="font-black text-slate-900 text-sm mb-1">{potential.name}</h3>
                        <p className="text-[10px] text-[#2d5cd5] font-black uppercase mb-2 tracking-wider">{potential.agency}</p>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-[0.15em] ${
                            potential.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {potential.status}
                          </span>
                          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#2d5cd5]">Detail →</button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Revenue Trends Summary */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Activity size={20} className="text-indigo-600" />
                Tren Pendapatan Tahun {new Date().getFullYear()}
              </h2>
              <button className="text-[10px] font-black text-slate-400 hover:text-[#2d5cd5] uppercase tracking-widest flex items-center gap-2">
                Download Report <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-6 lg:grid-cols-12 gap-4 items-end h-48">
              {revenueData.length > 0 ? (
                revenueData.map((data, i) => {
                  const max = Math.max(...revenueData.map(d => Number(d.amount)));
                  const height = (Number(data.amount) / max) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 group">
                      <div className="relative w-full flex justify-center">
                         <div 
                          className="absolute bottom-full mb-2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none"
                        >
                          {formatCurrency(Number(data.amount))}
                        </div>
                        <div 
                          className="w-full max-w-[40px] bg-gradient-to-t from-slate-100 to-slate-50 border border-slate-100 rounded-t-xl group-hover:from-[#2d5cd5] group-hover:to-blue-400 transition-all duration-500 shadow-sm"
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transform lg:rotate-0 -rotate-45">{data.month.slice(0, 3)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                   <p className="text-slate-300 font-bold italic text-sm">Data tren belum tersedia</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories & Activity Feed */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
              Revenue Mix
              <BarChart3 size={18} className="text-slate-300" />
            </h2>
            <div className="space-y-6">
              {revenueByType.length > 0 ? (
                revenueByType.slice(0, 5).map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-1">
                      <span className="text-slate-400 truncate pr-4">{item.name}</span>
                      <span className="text-slate-900">{formatCurrency(Number(item.total))}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#2d5cd5] rounded-full" 
                        style={{ width: `${Math.random() * 60 + 20}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-300 font-bold italic text-sm">No data</div>
              )}
            </div>
            <button className="w-full mt-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
              Full Analytics Report
            </button>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
              Live Feed
              <Clock size={18} className="text-slate-300" />
            </h2>
            <div className="space-y-8">
              {[
                { type: 'Payment', Ref: '#8821', amount: 'Rp 25.000', time: '2m ago', icon: CreditCard, color: 'text-[#2d5cd5]' },
                { type: 'New WP', Ref: 'PT Berkah', amount: 'Verified', time: '15m ago', icon: Users, color: 'text-indigo-600' },
                { type: 'Update', Ref: 'Billing #90', amount: 'Revised', time: '1h ago', icon: FileText, color: 'text-amber-600' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center ${activity.color} group-hover:scale-110 transition-transform`}>
                    <activity.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-black text-slate-900">{activity.type}</p>
                      <span className="text-[10px] font-bold text-slate-300">{activity.time}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{activity.Ref}</p>
                    <p className="text-[11px] font-black text-slate-900 mt-1">{activity.amount}</p>
                  </div>
                  <div className="self-center">
                    <ChevronRight size={16} className="text-slate-200 group-hover:text-[#2d5cd5] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
