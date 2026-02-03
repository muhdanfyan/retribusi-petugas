import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, Search, FileText, Loader2, QrCode, Plus } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import { Billing as BillingType } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Billing() {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [billings, setBillings] = useState<BillingType[]>([]);
  const [retributionTypes, setRetributionTypes] = useState<any[]>([]);
  const [taxObjects, setTaxObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  const [selectedBill, setSelectedBill] = useState<BillingType | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'pending' | 'overdue'>('all');

  const [formData, setFormData] = useState({
    tax_object_id: '',
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
        const [billsRes, typesRes, objectsRes] = await Promise.all([
          api.get('/api/bills'),
          api.get('/api/retribution-types'),
          api.get('/api/tax-objects'),
        ]);

        const mappedBills: BillingType[] = (billsRes.data || billsRes).map((b: any) => ({
          id: b.id.toString(),
          invoiceNumber: b.bill_number,
          taxpayerName: b.taxpayer?.name || b.user?.name || 'Unknown',
          taxpayerId: b.taxpayer?.npwpd || 'N/A',
          type: b.retribution_type?.name || 'N/A',
          amount: Number(b.amount),
          dueDate: b.due_date,
          status: b.status as any,
          createdAt: b.created_at,
        }));

        setBillings(mappedBills);
        setRetributionTypes(typesRes.data || typesRes);
        setTaxObjects(objectsRes.data || objectsRes);
      } catch (error) {
        console.error('Error fetching data:', error);
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
        tax_object_id: Number(formData.tax_object_id),
        period: formData.period,
        due_date: formData.due_date,
      });

      const b = response.data || response;
      const selectedObj = taxObjects.find(o => o.id === b.tax_object_id);
      
      const newBilling: BillingType = {
        id: b.id.toString(),
        invoiceNumber: b.bill_number,
        taxpayerName: selectedObj?.taxpayer?.name || 'Unknown',
        taxpayerId: selectedObj?.taxpayer?.npwpd || 'N/A',
        type: selectedObj?.retribution_type?.name || 'N/A',
        amount: Number(b.amount),
        dueDate: b.due_date,
        status: b.status as any,
        createdAt: b.created_at,
      };

      setBillings([newBilling, ...billings]);
      setShowModal(false);
      setFormData({ tax_object_id: '', period: '', due_date: '' });
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
        taxpayerId: b.taxpayer?.npwpd || 'N/A',
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      await api.post(`/api/bills/${selectedBill.id}/pay`, {
        payment_method: 'cash',
        amount: selectedBill.amount,
      });

      alert('Pembayaran berhasil dicatat');
      setShowPaymentModal(false);
      setSelectedBill(null);
      
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Billing & Tagihan</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {currentUser?.role === 'petugas' ? 'Monitor dan catat pembayaran tagihan' : 'Generate dan kelola tagihan operasional petugas'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentUser?.role !== 'petugas' && (
            <>
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95 shadow-emerald-500/10"
              >
                <FileText size={18} />
                Bulk Gen
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95 shadow-blue-500/10"
              >
                <Plus size={18} />
                Generate
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/scanner')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            <QrCode size={18} />
            SCAN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Tagihan</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lunas</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.lunas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending</p>
          <p className="text-2xl font-black text-amber-500">{summary.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Overdue</p>
          <p className="text-2xl font-black text-rose-500">{summary.overdue}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari invoice, nama, atau NPWPD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm appearance-none font-bold"
              >
                <option value="all">Semua Status</option>
                <option value="lunas">Lunas</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-bold">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Wajib Pajak</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Jumlah</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBillings.length > 0 ? (
                filteredBillings.map((billing) => (
                  <tr key={billing.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-blue-600 dark:text-blue-400">{billing.invoiceNumber}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{new Date(billing.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-gray-900 dark:text-white">{billing.taxpayerName}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{billing.type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(billing.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-[9px] font-black uppercase tracking-tighter rounded-md ${
                        billing.status === 'lunas' ? 'bg-emerald-100 text-emerald-700' : 
                        billing.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {billing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {billing.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedBill(billing);
                            setShowPaymentModal(true);
                          }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-lg transition-all active:scale-95"
                        >
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic font-medium">Data tidak ditemukan</td>
                </tr>
              )}
            </tbody>
        </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4 px-4 pb-4">
          {filteredBillings.length > 0 ? (
            filteredBillings.map((billing) => (
              <div key={billing.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none mb-1">{billing.invoiceNumber}</p>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">{billing.taxpayerName}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    billing.status === 'lunas' ? 'bg-emerald-50 text-emerald-600' : 
                    billing.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {billing.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Jumlah</p>
                    <p className="text-xs font-black text-gray-900 dark:text-white">{formatCurrency(billing.amount)}</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tanggal</p>
                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{new Date(billing.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700/50">
                  <p className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{billing.type}</p>
                  {billing.status === 'pending' && (
                    <button
                      onClick={() => {
                        setSelectedBill(billing);
                        setShowPaymentModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Bayar
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400 italic font-medium">Data tidak ditemukan</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Generate Tagihan</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleGenerate} className="p-8 space-y-5">
              <SearchableSelect
                label="Objek Pajak Target"
                options={taxObjects.map(obj => ({
                  id: obj.id,
                  label: `${obj.nop} - ${obj.taxpayer?.name || 'N/A'}`,
                  subLabel: obj.name
                }))}
                value={formData.tax_object_id}
                onSelect={(val) => setFormData({ ...formData, tax_object_id: val.toString() })}
                placeholder="Pilih Objek"
                searchPlaceholder="Cari NOP atau Nama WP..."
              />
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-[10px] text-blue-900 dark:text-blue-300 font-medium">
                  Jumlah tagihan akan dihitung otomatis berdasarkan tarif yang berlaku untuk objek pajak ini.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Periode</label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                    placeholder="e.g. Jan 2026"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all mt-4">
                BUAT TAGIHAN
              </button>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-50">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Bulk Generate</h2>
            </div>
            <form onSubmit={handleBulkGenerate} className="p-8 space-y-5">
              <SearchableSelect
                label="Kategori Retribusi"
                options={retributionTypes.map(rt => ({
                  id: rt.id,
                  label: rt.name
                }))}
                value={bulkFormData.retribution_type_id}
                onSelect={(val) => setBulkFormData({ ...bulkFormData, retribution_type_id: val.toString() })}
                placeholder="Pilih Kategori"
                searchPlaceholder="Cari kategori..."
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Periode</label>
                  <input
                    type="text"
                    value={bulkFormData.period}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, period: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={bulkFormData.due_date}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, due_date: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all mt-4">
                PROSES BULK
              </button>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Konfirmasi Pembayaran</h2>
              <p className="text-slate-400 text-sm font-medium">Verifikasi detail tagihan sebelum mencatat pembayaran</p>
            </div>
            
            {/* Invoice Details */}
            <div className="mt-6 space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">No. Invoice</p>
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400">{selectedBill.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Jatuh Tempo</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {new Date(selectedBill.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Wajib Pajak</p>
                <p className="text-base font-black text-slate-900 dark:text-white">{selectedBill.taxpayerName}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1">{selectedBill.taxpayerId}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Jenis Retribusi</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{selectedBill.type}</p>
              </div>
            </div>

            {/* Amount Highlight */}
            <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl p-5 text-center border border-emerald-100 dark:border-emerald-800">
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(selectedBill.amount)}</p>
              <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 font-medium mt-2 uppercase tracking-wider">Metode: Tunai (Cash)</p>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                BATAL
              </button>
              <button
                onClick={handlePayment}
                className="flex-[2] px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                KONFIRMASI BAYAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
