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
  petugas_achievement?: {
    collections_count: number;
    total_amount: number;
    taxpayers_registered: number;
  } | null;
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

  const createCustomIcon = (iconUrl: string | null, seed: any, status?: string) => {
    // If it's a taxpayer, use a user icon
    if (status === 'taxpayer') {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            width: 32px; height: 32px; 
            background: #2d5cd5; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            box-shadow: 0 4px 10px rgba(45,92,213,0.3); border: 2px solid white;
            color: white;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
    }

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
          border: 2px solid #10b981;
        ">
          <img src="${finalIconUrl}" style="width: 100%; height: 100%; object-fit: contain; padding: 2px;" />
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-32 w-full max-w-full overflow-hidden">
      
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

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
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
      <div className="lg:hidden flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight shrink-0">Dashboard</h2>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <button onClick={handlePrev} className="p-2 text-[#2d5cd5] active:bg-slate-50 transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2d5cd5] px-1 whitespace-nowrap">{getDisplayDate(true)}</span>
            <button onClick={handleNext} className="p-2 text-[#2d5cd5] active:bg-slate-50 transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner w-full mb-2">
          <button 
            onClick={() => { setFilterType('day'); setCurrentDate(new Date()); }}
            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'day' ? 'bg-white dark:bg-slate-700 text-[#2d5cd5] shadow-sm' : 'text-slate-400'}`}
          >
            Harian
          </button>
          <button 
            onClick={() => { setFilterType('week'); setCurrentDate(new Date()); }}
            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'week' ? 'bg-white dark:bg-slate-700 text-[#2d5cd5] shadow-sm' : 'text-slate-400'}`}
          >
            Pekanan
          </button>
          <button 
            onClick={() => { setFilterType('month'); setCurrentDate(new Date()); }}
            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${filterType === 'month' ? 'bg-white dark:bg-slate-700 text-[#2d5cd5] shadow-sm' : 'text-slate-400'}`}
          >
            Bulanan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 lg:col-span-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2d5cd5] to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-blue-500/30 group">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-6 sm:gap-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Pendapatan</p>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{formatLargeCurrency(stats?.total_revenue || 0)}</h3>
                </div>
                <button 
                  onClick={() => navigate('/billing')}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center transition-all active:scale-90"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
                  {stats?.trends.revenue || '+0%'}
                </div>
                <p className="text-blue-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60">vs periode lalu</p>
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
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
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

      {/* Petugas Personal Achievement Section */}
      {stats?.petugas_achievement && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 origin-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
             <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>
             <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <TrendingUp size={28} />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Pencapaian Saya</h4>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.petugas_achievement.total_amount)}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black text-emerald-500">{stats.petugas_achievement.collections_count}</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Koleksi</p>
                </div>
             </div>
              <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-8 relative z-10">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WP Terdaftar</p>
                   <p className="text-xl font-black text-slate-900 dark:text-white">{stats.petugas_achievement.taxpayers_registered}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rasio Berhasil</p>
                   <p className="text-xl font-black text-slate-900 dark:text-white">{Math.round((stats.petugas_achievement.collections_count / (stats.petugas_achievement.collections_count + (stats.pending_bills / 10))) * 100) || 100}%</p>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Buttons (Mobile Quick Actions) */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/scanner')}
            className="flex items-center justify-center gap-3 bg-[#2d5cd5] text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            <QrCode size={18} />
            Scan QR
          </button>
          <button 
            onClick={() => navigate('/billing')}
            className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all"
          >
            <SearchIcon size={18} />
            Cari WP
          </button>
        </div>
        <button 
          onClick={() => navigate('/field-check')}
          className="flex items-center justify-center gap-3 bg-emerald-600 text-white p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <MapIcon size={18} />
          Laporan Lapangan (GPS)
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
        
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar lg:grid lg:grid-cols-6 lg:gap-6 relative">
          {retributionTypes.slice(0, 6).map((type, i) => (
            <button
              key={type.id || i}
              onClick={() => navigate(`/billing?type=${type.id}`)}
              className="flex-shrink-0 w-32 lg:w-full bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-center"
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

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm overflow-hidden relative group">
          <div className="flex items-start justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#2d5cd5] rounded-full"></div>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendapatan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</span>
              </div>
            </div>
          </div>
          
          <div className="h-40 sm:h-48 relative w-full overflow-hidden mt-2 sm:mt-4">
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
              <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center justify-between">
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

          <div className="col-span-12 lg:col-span-5 h-full min-h-[300px] sm:min-h-[400px]">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-2 shadow-sm h-full overflow-hidden group">
              <div className="p-4 sm:p-6 flex items-center justify-between">
                <h3 className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2d5cd5]" />
                  Potensi Langsung
                </h3>
                <MoreHorizontal size={18} className="text-slate-300 cursor-pointer" />
              </div>
              <div className="h-[250px] sm:h-[calc(100%-4rem)] rounded-3xl overflow-hidden">
                <MapContainer center={[-5.47, 122.6]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {potentials.map((potential, index) => (
                    <Marker 
                      key={index} 
                      position={potential.position}
                      icon={createCustomIcon(potential.icon || null, potential.retribution_type_id || index, potential.status)}
                    >
                      <Popup>
                        <div className="p-3 min-w-[200px] font-sans">
                          <h3 className="font-black text-slate-900 text-sm mb-1">{potential.name}</h3>
                          <p className="text-[10px] text-[#2d5cd5] font-black uppercase mb-2 tracking-wider">{potential.agency}</p>
                          <span className={`inline-flex px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-[0.15em] ${potential.status === 'taxpayer' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {potential.status === 'taxpayer' ? 'Wajib Pajak' : 'Zona Potensi'}
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
