import { useState, useEffect } from 'react';
import { Plus, Download, Search, Filter, FileText, Loader2 } from 'lucide-react';
import { Billing as BillingType } from '../types';
import { api } from '../lib/api';

export default function Billing() {
  const [billings, setBillings] = useState<BillingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'pending' | 'overdue'>('all');

  const [taxpayers, setTaxpayers] = useState<any[]>([]);
  const [retributionTypes, setRetributionTypes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    taxpayer_id: '',
    retribution_type_id: '',
    amount: '',
    period: '',
    due_date: '',
  });

  const [bulkFormData, setBulkFormData] = useState({
    retribution_type_id: '',
    period: '',
    due_date: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [billsRes, taxpayersRes, typesRes] = await Promise.all([
          api.get('/api/bills'),
          api.get('/api/taxpayers'),
          api.get('/api/retribution-types'),
        ]);

        const mappedBills: BillingType[] = (billsRes.data || billsRes).map((b: any) => ({
          id: b.id.toString(),
          invoiceNumber: b.bill_number,
          taxpayerName: b.taxpayer?.name || b.user?.name || 'Unknown',
          taxpayerId: b.taxpayer?.taxpayer_id || 'N/A',
          type: b.retribution_type?.name || 'N/A',
          amount: Number(b.amount),
          dueDate: b.due_date,
          status: b.status as any,
          createdAt: b.created_at,
        }));

        setBillings(mappedBills);
        setTaxpayers(taxpayersRes.data || taxpayersRes);
        setRetributionTypes(typesRes.data || typesRes);
      } catch (error) {
        console.error('Error fetching billing data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/bills', {
        taxpayer_id: Number(formData.taxpayer_id),
        retribution_type_id: Number(formData.retribution_type_id),
        amount: Number(formData.amount),
        period: formData.period,
        due_date: formData.due_date,
      });

      const b = response.data || response;
      const newBilling: BillingType = {
        id: b.id.toString(),
        invoiceNumber: b.bill_number,
        taxpayerName: taxpayers.find(t => t.id === b.taxpayer_id)?.name || 'New Taxpayer',
        taxpayerId: taxpayers.find(t => t.id === b.taxpayer_id)?.taxpayer_id || 'N/A',
        type: retributionTypes.find(t => t.id === b.retribution_type_id)?.name || 'N/A',
        amount: Number(b.amount),
        dueDate: b.due_date,
        status: b.status as any,
        createdAt: b.created_at,
      };

      setBillings([newBilling, ...billings]);
      setShowModal(false);
      setFormData({ taxpayer_id: '', retribution_type_id: '', amount: '', period: '', due_date: '' });
    } catch (error) {
      alert('Gagal generate tagihan');
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/bills/bulk', {
        retribution_type_id: Number(bulkFormData.retribution_type_id),
        period: bulkFormData.period,
        due_date: bulkFormData.due_date,
      });

      alert(response.message || 'Bulk generation berhasil');
      setShowBulkModal(false);
      // Refresh list
      setLoading(true);
      const billsRes = await api.get('/api/bills');
      const mappedBills: BillingType[] = (billsRes.data || billsRes).map((b: any) => ({
        id: b.id.toString(),
        invoiceNumber: b.bill_number,
        taxpayerName: b.taxpayer?.name || b.user?.name || 'Unknown',
        taxpayerId: b.taxpayer?.taxpayer_id || 'N/A',
        type: b.retribution_type?.name || 'N/A',
        amount: Number(b.amount),
        dueDate: b.due_date,
        status: b.status as any,
        createdAt: b.created_at,
      }));
      setBillings(mappedBills);
      setLoading(false);
    } catch (error) {
      alert('Gagal bulk generate');
    }
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

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-baubau-blue" />
      </div>
    );
  }

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
              {filteredBillings.length > 0 ? (
                filteredBillings.map((billing) => (
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
                      {new Date(billing.dueDate).toLocaleDateString('id-ID')}
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    Belum ada data tagihan
                  </td>
                </tr>
              )}
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
                  Wajib Pajak Target
                </label>
                <select
                  value={formData.taxpayer_id}
                  onChange={(e) => setFormData({ ...formData, taxpayer_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Wajib Pajak</option>
                  {taxpayers.map((tp) => (
                    <option key={tp.id} value={tp.id}>{tp.name} ({tp.taxpayer_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jenis Retribusi
                </label>
                <select
                  value={formData.retribution_type_id}
                  onChange={(e) => setFormData({ ...formData, retribution_type_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Jenis</option>
                  {retributionTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
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
                  Periode (e.g., Januari 2026)
                </label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="Januari 2026"
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
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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

            <form onSubmit={handleBulkGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jenis Retribusi
                </label>
                <select
                  value={bulkFormData.retribution_type_id}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, retribution_type_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Jenis</option>
                  {retributionTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Periode
                </label>
                <input
                  type="text"
                  value={bulkFormData.period}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, period: e.target.value })}
                  placeholder="Januari 2026"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jatuh Tempo (Semua)
                </label>
                <input
                  type="date"
                  value={bulkFormData.due_date}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-300">
                  Tagihan akan dibuat untuk semua wajib pajak aktif yang terdaftar pada jenis retribusi ini.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
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
                  Generate Bulk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
