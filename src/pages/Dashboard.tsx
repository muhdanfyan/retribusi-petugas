import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  Loader2, 
  QrCode, 
  Search as SearchIcon, 
  CreditCard,
  Map as MapIcon,
  Activity,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar
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
  icon?: string | null;
  retribution_type_id?: number | string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [potentials, setPotentials] = useState<Potential[]>([]);
  const [retributionTypes, setRetributionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date Filtering State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'day' | 'week' | 'month'>('month');

  const getDayDates = (date: Date) => {
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);
    return { start, end };
  };

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0,0,0,0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);

    return { start, end };
  };

  const getMonthDates = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      let range;
      if (filterType === 'day') range = getDayDates(currentDate);
      else if (filterType === 'week') range = getWeekDates(currentDate);
      else range = getMonthDates(currentDate);

      const params = {
        start_date: range.start.toISOString().split('T')[0],
        end_date: range.end.toISOString().split('T')[0]
      };

      const [statsRes, trendRes, mapRes, typesRes] = await Promise.all([
        api.get('/api/dashboard/stats', { params }),
        api.get('/api/dashboard/revenue-trend', { params }),
        api.get('/api/dashboard/map-potentials'),
        api.get('/api/retribution-types?is_active=1'),
      ]);

      setStats(statsRes);
      setRevenueData(trendRes);
      setPotentials(mapRes);
      setRetributionTypes(typesRes.data || typesRes);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, filterType]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (filterType === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (filterType === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (filterType === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (filterType === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const getDisplayDate = (short = false) => {
    if (filterType === 'day') {
      return currentDate.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: short ? 'short' : 'long', 
        year: 'numeric' 
      });
    }
    if (filterType === 'month') {
      return currentDate.toLocaleString('id-ID', { 
        month: short ? 'short' : 'long', 
        year: 'numeric' 
      });
    }
    const { start, end } = getWeekDates(currentDate);
    return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

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

  const chartPath = useMemo(() => {
    if (revenueData.length < 2) return '';
    const maxAmount = Math.max(...revenueData.map(d => Number(d.amount))) || 1;
    const points = revenueData.map((d, i) => ({
      x: (i / (revenueData.length - 1)) * 400,
      y: 130 - (Number(d.amount) / maxAmount) * 100
    }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` Q ${cpX} ${p0.y} ${cpX} ${(p0.y + p1.y) / 2} T ${p1.x} ${p1.y}`;
    }
    return d;
  }, [revenueData]);

  if (loading && !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#2d5cd5]" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  const createCustomIcon = (iconUrl: string | null, seed: any) => {
    const finalIconUrl = iconUrl?.startsWith('http') 
      ? iconUrl 
      : (iconUrl ? `${import.meta.env.VITE_API_URL}${iconUrl.startsWith('/') ? '' : '/'}${iconUrl}` : `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=2563eb&shape1Color=white`);

    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          width: 32px; 
          height: 32px; 
          background: white; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
          overflow: hidden;
        ">
          <img src="${finalIconUrl}" style="width: 100%; height: 100%; object-fit: contain; padding: 2px;" />
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 lg:space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* Desktop Top Section */}
      <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#2d5cd5] rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
            <img src="https://res.cloudinary.com/ddhgtgsed/image/upload/v1769878859/branding/logo-baubau.png" alt="Logo" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Pusat Kendali
              <span className="text-[10px] font-black bg-[#2d5cd5] text-white px-3 py-1 rounded-full uppercase tracking-widest align-middle">Beta</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Halo, {user?.name}. Berikut ringkasan aktivitas hari ini.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Filters */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button 
              onClick={() => { setFilterType('day'); setCurrentDate(new Date()); }}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'day' ? 'bg-white dark:bg-slate-700 text-[#2d5cd5] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Harian
            </button>
            <button 
              onClick={() => { setFilterType('week'); setCurrentDate(new Date()); }}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'week' ? 'bg-white dark:bg-slate-700 text-[#2d5cd5] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Pekanan
            </button>
            <button 
              onClick={() => { setFilterType('month'); setCurrentDate(new Date()); }}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'month' ? 'bg-white dark:bg-slate-700 text-[#2d5cd5] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Bulanan
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button onClick={handlePrev} className="p-1 hover:bg-slate-50 rounded-full"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-2 min-w-[140px] justify-center text-[#2d5cd5]">
              <Calendar size={14} />
              <span className="text-xs font-black uppercase tracking-widest">{getDisplayDate()}</span>
            </div>
            <button onClick={handleNext} className="p-1 hover:bg-slate-50 rounded-full"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Mobile Title & Navigator */}
      <div className="lg:hidden flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Pendapatan</h2>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm scale-90">
            <button onClick={handlePrev} className="p-1"><ChevronLeft size={14} /></button>
            <span className="text-[10px] font-black uppercase tracking-widest">{getDisplayDate(true)}</span>
            <button onClick={handleNext} className="p-1"><ChevronRight size={14} /></button>
          </div>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full">
          <button 
            onClick={() => { setFilterType('day'); setCurrentDate(new Date()); }}
            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'day' ? 'bg-white dark:bg-slate-700 text-[#2d5cd5] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Harian
          </button>
          <button 
            onClick={() => { setFilterType('week'); setCurrentDate(new Date()); }}
            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'week' ? 'bg-white dark:bg-slate-700 text-[#2d5cd5] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Pekanan
          </button>
          <button 
            onClick={() => { setFilterType('month'); setCurrentDate(new Date()); }}
            className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'month' ? 'bg-white dark:bg-slate-700 text-[#2d5cd5] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Bulanan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 lg:col-span-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2d5cd5] to-blue-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/30 group">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Pendapatan</p>
                  <h3 className="text-3xl font-black tracking-tight">{formatLargeCurrency(stats?.total_revenue || 0)}</h3>
                </div>
                <button 
                  onClick={() => navigate('/billing')}
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all active:scale-90"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-300" />
                  {stats?.trends.revenue || '+0%'}
                </div>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-60">vs periode lalu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 h-full">
            {[
              { 
                label: 'Tingkat Penagihan', 
                value: `${stats?.collection_rate || 0}%`, 
                trend: 'up',
                icon: TrendingUp, 
                bg: 'bg-emerald-500/10', 
                text: 'text-emerald-600',
              },
              { 
                label: 'Tagihan Pending', 
                value: stats?.pending_bills.toLocaleString() || '0', 
                trend: 'down',
                icon: FileText, 
                bg: 'bg-amber-500/10', 
                text: 'text-amber-600',
              },
              { 
                label: 'Wajib Retribusi Aktif', 
                value: stats?.active_taxpayers.toLocaleString() || '0', 
                trend: 'up',
                icon: Users, 
                bg: 'bg-indigo-500/10', 
                text: 'text-indigo-600',
              }
            ].map((kpi, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                <div className={`${kpi.bg} w-10 h-10 rounded-xl flex items-center justify-center ${kpi.text} mb-4 group-hover:scale-110 transition-transform`}>
                  <kpi.icon size={20} />
                </div>
                <div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{kpi.label}</p>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">{kpi.value}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons (Mobile) */}
      <div className="lg:hidden grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/scanner')}
          className="flex flex-col items-center justify-center gap-3 bg-[#2d5cd5] text-white p-6 rounded-[2rem] font-bold text-xs shadow-xl shadow-blue-500/20"
        >
          <QrCode size={24} />
          Scan QR
        </button>
        <button 
          onClick={() => navigate('/billing')}
          className="flex flex-col items-center justify-center gap-3 bg-white text-slate-700 border border-slate-100 p-6 rounded-[2rem] font-bold text-xs shadow-sm"
        >
          <SearchIcon size={24} />
          Cari WP
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Kategori</h2>
          <button 
            onClick={() => navigate('/master-data')}
            className="text-[10px] font-black text-slate-400 hover:text-[#2d5cd5] uppercase tracking-[0.2em] transition-colors"
          >
            Lihat Semua
          </button>
        </div>
        
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-6 lg:gap-6">
          {retributionTypes.slice(0, 6).map((type, i) => (
            <button
              key={type.id || i}
              onClick={() => navigate(`/billing?type=${type.id}`)}
              className="flex-shrink-0 w-32 lg:w-full bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                <img 
                  src={type.icon?.startsWith('http') ? type.icon : (type.icon ? `${import.meta.env.VITE_API_URL}${type.icon.startsWith('/') ? '' : '/'}${type.icon}` : `https://res.cloudinary.com/ddhgtgsed/image/upload/v1769878859/branding/logo-baubau.png`)} 
                  alt={type.name} 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://res.cloudinary.com/ddhgtgsed/image/upload/v1769878859/branding/logo-baubau.png`;
                  }}
                />
              </div>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider line-clamp-1">{type.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Aktivitas</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm overflow-hidden relative group">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#2d5cd5] rounded-full"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendapatan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</span>
              </div>
            </div>
          </div>
          
          <div className="h-48 relative w-full overflow-hidden mt-4">
            <svg viewBox="0 0 400 150" className="w-full h-full preserve-3d">
              {[30, 60, 90, 120].map((y) => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" className="text-slate-50 dark:text-slate-800/50" strokeWidth="1" />
              ))}
              
              {chartPath && (
                <path 
                  d={chartPath} 
                  fill="none" 
                  stroke="#2d5cd5" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  className="drop-shadow-[0_8px_15px_rgba(45,92,213,0.3)]"
                />
              )}
              
              <path 
                d="M 0 120 Q 50 90 100 110 T 200 100 T 300 70 T 400 90" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3" 
                strokeDasharray="8 6"
                strokeLinecap="round"
                className="opacity-40"
              />
            </svg>
            
            <div className="absolute left-0 bottom-0 top-0 flex flex-col justify-between text-[9px] font-black text-slate-300 uppercase py-2">
              <span>{formatLargeCurrency(Math.max(...revenueData.map(d => Number(d.amount))) || 0)}</span>
              <span>0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Riwayat Transaksi</h2>
          <button className="text-[10px] font-black text-slate-400 hover:text-[#2d5cd5] uppercase tracking-[0.2em] transition-colors">Lihat Semua</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 space-y-4">
            {[
              { id: 1, title: 'PT Berkah Sejahtera', category: 'Pajak Restoran', amount: 'Rp 1.800.000', date: '2 Hari lalu', status: 'Verified', icon: FileText, color: 'text-[#2d5cd5]', bg: 'bg-blue-50' },
              { id: 2, title: 'Hotel Grand Baubau', category: 'Pajak Hotel', amount: 'Rp 4.250.000', date: '1 Minggu lalu', status: 'Pending', icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50' },
              { id: 3, title: 'CV Maju Jaya', category: 'Retribusi Parkir', amount: 'Rp 750.000', date: '15 Menit lalu', status: 'Baru', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${item.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{item.title}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{item.amount}</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-12 lg:col-span-5 h-full min-h-[400px]">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-2 shadow-sm h-full overflow-hidden group">
              <div className="p-6 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <MapIcon size={16} className="text-[#2d5cd5]" />
                  Potensi Langsung
                </h3>
                <MoreHorizontal size={18} className="text-slate-300 cursor-pointer" />
              </div>
              <div className="h-[calc(100%-4rem)] rounded-[2rem] overflow-hidden">
                <MapContainer center={[-5.47, 122.6]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {potentials.map((potential, index) => (
                    <Marker 
                      key={index} 
                      position={potential.position}
                      icon={createCustomIcon(potential.icon || null, potential.retribution_type_id || index)}
                    >
                      <Popup>
                        <div className="p-3 min-w-[200px] font-sans">
                          <h3 className="font-black text-slate-900 text-sm mb-1">{potential.name}</h3>
                          <p className="text-[10px] text-[#2d5cd5] font-black uppercase mb-2 tracking-wider">{potential.agency}</p>
                          <span className="inline-flex px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-[0.15em] bg-emerald-50 text-emerald-600">
                            Aktif
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
