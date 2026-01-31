import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Loader2, Filter, X } from 'lucide-react';
import { api } from '../lib/api';
import { Taxpayer, Opd, RetributionType } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function TaxpayerManagement() {
  const { user } = useAuth();
  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);
  const [opds, setOpds] = useState<Opd[]>([]);
  const [retributionTypes, setRetributionTypes] = useState<RetributionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [opdFilter, setOpdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTaxpayer, setEditingTaxpayer] = useState<Taxpayer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nik: '',
    name: '',
    address: '',
    phone: '',
    npwpd: '',
    object_name: '',
    object_address: '',
    is_active: true,
    opd_id: '',
    retribution_type_ids: [] as number[],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search: search,
        ...(opdFilter ? { opd_id: opdFilter } : user?.role !== 'super_admin' ? { opd_id: user?.opd_id?.toString() || '' } : {}),
      });

      const [taxpayersRes, opdsRes, typesRes] = await Promise.all([
        api.get(`/api/taxpayers?${queryParams}`),
        user?.role === 'super_admin' ? api.get('/api/opds') : Promise.resolve({ data: [] }),
        api.get('/api/retribution-types'),
      ]);

      setTaxpayers(taxpayersRes.data);
      setTotalPages(taxpayersRes.last_page);
      
      if (user?.role === 'super_admin') {
        setOpds(opdsRes.data || opdsRes);
      }
      
      setRetributionTypes(typesRes.data || typesRes);
    } catch (error) {
      console.error('Error fetching taxpayers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, opdFilter]);

  const handleAdd = () => {
    setEditingTaxpayer(null);
    setForm({
      nik: '',
      name: '',
      address: '',
      phone: '',
      npwpd: '',
      object_name: '',
      object_address: '',
      is_active: true,
      opd_id: user?.opd_id?.toString() || '',
      retribution_type_ids: [],
    });
    setShowModal(true);
  };

  const handleEdit = (taxpayer: Taxpayer) => {
    setEditingTaxpayer(taxpayer);
    setForm({
      nik: taxpayer.nik,
      name: taxpayer.name,
      address: taxpayer.address || '',
      phone: taxpayer.phone || '',
      npwpd: taxpayer.npwpd || '',
      object_name: taxpayer.object_name || '',
      object_address: taxpayer.object_address || '',
      is_active: taxpayer.is_active,
      opd_id: taxpayer.opd_id.toString(),
      retribution_type_ids: taxpayer.retribution_types?.map(t => t.id) || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus wajib pajak ini?')) {
      try {
        await api.delete(`/api/taxpayers/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus wajib pajak');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTaxpayer) {
        await api.put(`/api/taxpayers/${editingTaxpayer.id}`, form);
      } else {
        await api.post('/api/taxpayers', form);
      }
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRetributionType = (id: number) => {
    setForm(prev => ({
      ...prev,
      retribution_type_ids: prev.retribution_type_ids.includes(id)
        ? prev.retribution_type_ids.filter(tid => tid !== id)
        : [...prev.retribution_type_ids, id]
    }));
  };

  const filteredRetributionTypes = useMemo(() => {
    const selectedOpdId = parseInt(form.opd_id);
    if (!selectedOpdId) return [];
    return retributionTypes.filter(t => t.opd_id === selectedOpdId);
  }, [form.opd_id, retributionTypes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengelolaan Wajib Pajak</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola data subjek dan objek retribusi</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Tambah Wajib Pajak
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari NIK, Nama, atau NPWPD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {user?.role === 'super_admin' && (
            <div className="w-full md:w-64">
              <select
                value={opdFilter}
                onChange={(e) => setOpdFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua OPD</option>
                {opds.map((opd) => (
                  <option key={opd.id} value={opd.id}>{opd.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIK & Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Objek & OPD</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : taxpayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data wajib pajak ditemukan
                  </td>
                </tr>
              ) : (
                taxpayers.map((tp) => (
                  <tr key={tp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{tp.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">NIK: {tp.nik}</div>
                      {tp.npwpd && <div className="text-xs text-blue-600 dark:text-blue-400">NPWPD: {tp.npwpd}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{tp.phone || '-'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={tp.address || ''}>
                        {tp.address || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{tp.object_name || 'Tidak ada objek'}</div>
                      <div className="text-xs text-gray-500">{tp.opd?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tp.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {tp.is_active ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(tp)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tp.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Halaman <span className="font-medium">{page}</span> dari <span className="font-medium">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingTaxpayer ? 'Edit Wajib Pajak' : 'Tambah Wajib Pajak Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Informasi Pribadi</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">NIK (16 Digit)</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={form.nik}
                      onChange={(e) => setForm({ ...form, nik: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alamat</label>
                    <textarea
                      rows={2}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">No. Telepon</label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">NPWPD</label>
                      <input
                        type="text"
                        value={form.npwpd}
                        onChange={(e) => setForm({ ...form, npwpd: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Objek & OPD</h3>
                  
                  {user?.role === 'super_admin' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dinas/OPD Terkait</label>
                      <select
                        value={form.opd_id}
                        onChange={(e) => setForm({ ...form, opd_id: e.target.value, retribution_type_ids: [] })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      >
                        <option value="">Pilih OPD</option>
                        {opds.map(opd => <option key={opd.id} value={opd.id}>{opd.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dinas/OPD</label>
                      <input
                        type="text"
                        value={user?.department || 'OPD Terkait'}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Objek (Contoh: Kios Pasar A1)</label>
                    <input
                      type="text"
                      value={form.object_name}
                      onChange={(e) => setForm({ ...form, object_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alamat Objek</label>
                    <textarea
                      rows={2}
                      value={form.object_address}
                      onChange={(e) => setForm({ ...form, object_address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Aktif</label>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Pilih Jenis Retribusi</h3>
                  {form.opd_id ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredRetributionTypes.length > 0 ? (
                        filteredRetributionTypes.map(type => (
                          <div
                            key={type.id}
                            onClick={() => toggleRetributionType(type.id)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              form.retribution_type_ids.includes(type.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                          >
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{type.name}</div>
                            <div className="text-xs text-gray-500">Rp {type.base_amount.toLocaleString()} / {type.unit}</div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-4 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-300">
                          {user?.role === 'super_admin' ? 'Silakan pilih OPD terlebih dahulu' : 'Tidak ada jenis retribusi untuk OPD ini'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                      <Filter className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Pilih OPD untuk melihat jenis retribusi yang tersedia</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingTaxpayer ? 'Simpan Perubahan' : 'Tambah Wajib Pajak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
