import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, Search, FileText, Loader2, QrCode } from 'lucide-react';
import { Billing as BillingType } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Billing() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [billings, setBillings] = useState<BillingType[]>([]);
  const [retributionTypes, setRetributionTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillingType | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'pending' | 'overdue'>('all');
  const [filterType, setFilterType] = useState('all');



  useEffect(() => {
    async function fetchData() {
      try {
        const [billsRes, typesRes] = await Promise.all([
          api.get('/api/bills'),
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
        setRetributionTypes(typesRes.data || typesRes);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);



  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      await api.post(`/api/bills/${selectedBill.id}/pay`, {
        payment_method: 'cash', // Default to cash for field payment
        amount: selectedBill.amount,
      });

      alert('Pembayaran berhasil dicatat');
      setShowPaymentModal(false);
      setSelectedBill(null);
      
      // Refresh list
      setBillings(prev => prev.map(b => 
        b.id === selectedBill.id ? { ...b, status: 'lunas' } : b
      ));
    } catch (error) {
      alert('Gagal mencatat pembayaran');
    }
  };

  const filteredBillings = billings.filter((billing) => {
    const matchesSearch =
      billing.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.taxpayerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.taxpayerId.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || billing.status === filterStatus;
    const matchesType = filterType === 'all' || billing.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Billing & Tagihan</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kelola dan generate tagihan retribusi dan pajak
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/scanner')}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <QrCode className="w-5 h-5" />
            <span>Scan QR Pajak</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari invoice, nama, atau ID WP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">Semua Status</option>
                <option value="lunas">Lunas</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">Semua Jenis</option>
                {retributionTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Aksi
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
                    <td className="px-6 py-4 text-sm text-right">
                      {billing.status === 'pending' && ['super_admin', 'opd', 'kasir'].includes(currentUser?.role || '') && (
                        <button
                          onClick={() => {
                            setSelectedBill(billing);
                            setShowPaymentModal(true);
                          }}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md transition-colors"
                        >
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                    Belum ada data tagihan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {filteredBillings.length > 0 ? (
            filteredBillings.map((billing) => (
              <div key={billing.id} className="p-4 bg-white dark:bg-gray-800 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{billing.invoiceNumber}</p>
                    <h3 className="font-bold text-gray-900 dark:text-white">{billing.taxpayerName}</h3>
                    <p className="text-xs text-gray-500">{billing.type}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${
                      billing.status === 'lunas'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40'
                        : billing.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/40'
                    }`}
                  >
                    {billing.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Total Tagihan</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">{formatCurrency(billing.amount)}</p>
                  </div>
                  {billing.status === 'pending' && ['super_admin', 'opd', 'kasir'].includes(currentUser?.role || '') && (
                    <button
                      onClick={() => {
                        setSelectedBill(billing);
                        setShowPaymentModal(true);
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg transition-all active:scale-95"
                    >
                      BAYAR
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <FileText className="w-3 h-3" />
                  <span className="font-bold">Tempo: {new Date(billing.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 italic">
              Belum ada data tagihan
            </div>
          )}
        </div>
      </div>



      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Konfirmasi Pembayaran
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Nomor Invoice</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedBill.invoiceNumber}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Wajib Pajak</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedBill.taxpayerName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Total Bayar</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(selectedBill.amount)}
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedBill(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Bayar Tunai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
