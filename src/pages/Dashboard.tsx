import { TrendingUp, DollarSign, FileText, Users, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const kpiData = [
    {
      label: 'Total Pendapatan',
      value: 'Rp 45.2M',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-baubau-green',
    },
    {
      label: 'Collection Rate',
      value: '87.3%',
      change: '+5.2%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-baubau-blue',
    },
    {
      label: 'Tagihan Pending',
      value: '234',
      change: '-8.1%',
      trend: 'down',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-baubau-yellow',
    },
    {
      label: 'Wajib Pajak Aktif',
      value: '1,247',
      change: '+15.3%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-violet-500',
    },
  ];

  const revenueData = [
    { month: 'Mei', amount: 6.8 },
    { month: 'Jun', amount: 7.2 },
    { month: 'Jul', amount: 6.5 },
    { month: 'Agu', amount: 8.1 },
    { month: 'Sep', amount: 7.8 },
    { month: 'Okt', amount: 8.8 },
  ];

  const maxAmount = Math.max(...revenueData.map((d) => d.amount));

  const recentTransactions = [
    { id: 'TRX001', taxpayer: 'PT Maju Jaya', type: 'Retribusi Pasar', amount: 'Rp 2.5M', status: 'lunas' },
    { id: 'TRX002', taxpayer: 'CV Berkah', type: 'Pajak Reklame', amount: 'Rp 1.8M', status: 'pending' },
    { id: 'TRX003', taxpayer: 'UD Sejahtera', type: 'Retribusi Parkir', amount: 'Rp 950K', status: 'lunas' },
    { id: 'TRX004', taxpayer: 'PT Global', type: 'Pajak Hotel', amount: 'Rp 3.2M', status: 'overdue' },
  ];

  const kpiProgress = [
    { label: 'Target Bulanan', current: 87, target: 100, color: 'bg-baubau-blue' },
    { label: 'Efisiensi Koleksi', current: 92, target: 100, color: 'bg-baubau-green' },
    { label: 'Verifikasi SLA', current: 78, target: 100, color: 'bg-baubau-yellow' },
  ];

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
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Oktober 2025</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Tren Pendapatan (Miliar Rupiah)
          </h2>
          <div className="space-y-4">
            {revenueData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {data.month}
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    Rp {data.amount}M
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-baubau-blue-light to-baubau-blue h-3 rounded-full transition-all"
                    style={{ width: `${(data.amount / maxAmount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            KPI Monitoring
          </h2>
          <div className="space-y-6">
            {kpiProgress.map((kpi, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {kpi.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {kpi.current}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${kpi.color} h-2 rounded-full transition-all`}
                    style={{ width: `${kpi.current}%` }}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Wajib Pajak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {transaction.taxpayer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
