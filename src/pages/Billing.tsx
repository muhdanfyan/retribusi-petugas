import { useState } from 'react';
import { Plus, Download, Search, Filter, FileText } from 'lucide-react';
import { Billing as BillingType } from '../types';

export default function Billing() {
  const [billings, setBillings] = useState<BillingType[]>([
    { id: '1', invoiceNumber: 'INV-2025-001', taxpayerName: 'PT Maju Jaya', taxpayerId: 'WP001', type: 'Retribusi Pasar', amount: 2500000, dueDate: '2025-11-15', status: 'lunas', createdAt: '2025-10-01' },
    { id: '2', invoiceNumber: 'INV-2025-002', taxpayerName: 'CV Berkah', taxpayerId: 'WP002', type: 'Pajak Reklame', amount: 1800000, dueDate: '2025-11-20', status: 'pending', createdAt: '2025-10-05' },
    { id: '3', invoiceNumber: 'INV-2025-003', taxpayerName: 'UD Sejahtera', taxpayerId: 'WP003', type: 'Retribusi Parkir', amount: 950000, dueDate: '2025-11-10', status: 'lunas', createdAt: '2025-10-08' },
    { id: '4', invoiceNumber: 'INV-2025-004', taxpayerName: 'PT Global', taxpayerId: 'WP004', type: 'Pajak Hotel', amount: 3200000, dueDate: '2025-10-25', status: 'overdue', createdAt: '2025-09-25' },
    { id: '5', invoiceNumber: 'INV-2025-005', taxpayerName: 'CV Makmur', taxpayerId: 'WP005', type: 'Retribusi Pasar', amount: 1500000, dueDate: '2025-11-18', status: 'pending', createdAt: '2025-10-10' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'pending' | 'overdue'>('all');

  const [formData, setFormData] = useState({
    taxpayerName: '',
    taxpayerId: '',
    type: 'Retribusi Pasar',
    amount: '',
    dueDate: '',
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const newBilling: BillingType = {
      id: Date.now().toString(),
      invoiceNumber: `INV-2025-${String(billings.length + 1).padStart(3, '0')}`,
      taxpayerName: formData.taxpayerName,
      taxpayerId: formData.taxpayerId,
      type: formData.type,
      amount: parseInt(formData.amount),
      dueDate: formData.dueDate,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBillings([newBilling, ...billings]);
    setShowModal(false);
    setFormData({ taxpayerName: '', taxpayerId: '', type: 'Retribusi Pasar', amount: '', dueDate: '' });
  };

  const handleBulkGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const bulkCount = 10;
    const newBillings: BillingType[] = [];

    for (let i = 0; i < bulkCount; i++) {
      newBillings.push({
        id: (Date.now() + i).toString(),
        invoiceNumber: `INV-2025-${String(billings.length + i + 1).padStart(3, '0')}`,
        taxpayerName: `Wajib Pajak ${billings.length + i + 1}`,
        taxpayerId: `WP${String(billings.length + i + 1).padStart(3, '0')}`,
        type: 'Retribusi Pasar',
        amount: 1000000 + (i * 100000),
        dueDate: '2025-11-30',
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    setBillings([...newBillings, ...billings]);
    setShowBulkModal(false);
  };

  const filteredBillings = billings.filter((billing) => {
    const matchesSearch =
      billing.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.taxpayerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.taxpayerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || billing.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const summary = {
    total: billings.length,
    lunas: billings.filter((b) => b.status === 'lunas').length,
    pending: billings.filter((b) => b.status === 'pending').length,
    overdue: billings.filter((b) => b.status === 'overdue').length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Tagihan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola dan generate tagihan retribusi dan pajak
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            Bulk Generate
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Generate Tagihan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tagihan</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{summary.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Lunas</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{summary.lunas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{summary.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{summary.overdue}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nomor invoice, nama, atau ID wajib pajak..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="lunas">Lunas</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Wajib Pajak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Jatuh Tempo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBillings.map((billing) => (
                <tr key={billing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {billing.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-gray-900 dark:text-white font-medium">
                      {billing.taxpayerName}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {billing.taxpayerId}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {billing.type}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(billing.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {billing.dueDate}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        billing.status === 'lunas'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : billing.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {billing.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Generate Tagihan Baru
              </h2>
            </div>

            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Wajib Pajak
                </label>
                <input
                  type="text"
                  value={formData.taxpayerName}
                  onChange={(e) => setFormData({ ...formData, taxpayerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID Wajib Pajak
                </label>
                <input
                  type="text"
                  value={formData.taxpayerId}
                  onChange={(e) => setFormData({ ...formData, taxpayerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jenis Tagihan
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option>Retribusi Pasar</option>
                  <option>Pajak Reklame</option>
                  <option>Retribusi Parkir</option>
                  <option>Pajak Hotel</option>
                  <option>Pajak Restoran</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jatuh Tempo
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Bulk Generate Tagihan
              </h2>
            </div>

            <form onSubmit={handleBulkGenerate} className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistem akan generate 10 tagihan dummy untuk testing purposes.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Generate 10 Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
