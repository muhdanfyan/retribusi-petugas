import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, FileText, Users, AlertCircle, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../lib/api';

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
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [potentials, setPotentials] = useState<Potential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, trendRes, mapRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/revenue-trend'),
          api.get('/api/dashboard/map-potentials'),
        ]);

        setStats(statsRes);
        setRevenueData(trendRes);
        setPotentials(mapRes);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-baubau-blue" />
      </div>
    );
  }

  const kpiData = [
    {
      label: 'Total Pendapatan',
      value: formatCurrency(stats?.total_revenue || 0),
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
      trend: stats?.trends.pending_bills.includes('-') ? 'up' : 'down', // Down is good for pending
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview pendapatan retribusi dan pajak daerah
          </p>
        </div>
        <div className="text-right">
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
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {kpi.value}
                </p>
                <span
                  className={`inline-flex items-center text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {kpi.change} vs bulan lalu
                </span>
              </div>
              <div className={`${kpi.color} p-3 rounded-xl text-white shadow-sm`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Peta Potensi Retribusi
        </h2>
        <div style={{ height: '400px', width: '100%' }}>
          <MapContainer center={[-5.47, 122.6]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {potentials.map((potential, index) => (
              <Marker key={index} position={potential.position}>
                <Popup>
                  <b>{potential.name}</b><br />
                  {potential.agency}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Tren Pendapatan (Miliar Rupiah)
          </h2>
          <div className="space-y-4">
            {revenueData.length > 0 ? (
              revenueData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {data.month}
                    </span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(Number(data.amount))}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-baubau-blue-light to-baubau-blue h-3 rounded-full transition-all"
                      style={{ width: `${(Number(data.amount) / maxAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8 italic">Belum ada data pendapatan</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            KPI Monitoring
          </h2>
          <div className="space-y-6">
            {[
              { label: 'Target Bulanan', current: stats?.collection_rate || 0, color: 'bg-baubau-blue' },
              { label: 'Efisiensi Koleksi', current: stats?.collection_rate ? stats.collection_rate + 5 : 0, color: 'bg-baubau-green' },
              { label: 'Verifikasi SLA', current: 78, color: 'bg-baubau-yellow' },
            ].map((kpi, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {kpi.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {Math.min(kpi.current, 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${kpi.color} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.min(kpi.current, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-blue-900/20 rounded-lg border border-yellow-100 dark:border-blue-800">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-baubau-yellow-dark dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-blue-300">
                  Perhatian
                </p>
                <p className="text-xs text-yellow-700 dark:text-blue-400 mt-1">
                  Verifikasi SLA di bawah target. Tingkatkan efisiensi proses approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaksi Terbaru
          </h2>
        </div>
        <div className="p-8 text-center text-gray-500 italic">
          Data transaksi disinkronisasi dari sistem pembayaran...
        </div>
      </div>
    </div>
  );
}
