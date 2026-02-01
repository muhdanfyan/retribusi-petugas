import { 
  Plus, Edit, Trash2, Search, Loader2, Filter, X, 
  User, CreditCard, MapPin, Phone, Briefcase, 
  FileCheck, Camera, HardDrive, Info, CheckCircle2 
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { Taxpayer, Opd, RetributionType } from '../types';
import { useAuth } from '../contexts/AuthContext';

const BAUBAU_DATA = {
  "Batupoaro": ["Bone-bone", "Tarafu", "Wameo", "Kaobula", "Lanto", "Ngananaumala"],
  "Betoambari": ["Sulaa", "Waborobo", "Labalawa", "Lipu", "Katobengke"],
  "Bungi": ["Bugi", "Gonda Baru", "Kaisabu Baru", "Karya Baru", "Ngkari-Ngkari"],
  "Kokalukuna": ["Kadolomoko", "Waruruma", "Lakologou", "Kadolo", "Liwuto", "Sukanaeyo"],
  "Lea-lea": ["Palabusa", "Kalia-Lia", "Kantalai", "Kolese", "Lowu-Lowu"],
  "Murhum": ["Baadia", "Melai", "Wajo", "Lamangga", "Tanganapada"],
  "Sorawolio": ["Gonda Baru", "Karya Baru", "Bugis", "Gonda"],
  "Wolio": ["Bataraguru", "Tomba", "Wangkanapi", "Wale", "Batulo", "Bukit Wolio Indah", "Kadolokatapi"]
};

export default function TaxpayerManagement() {
  const { user } = useAuth();
  const [taxpayers, setTaxpayers] = useState<Taxpayer[]>([]);
  const [opds, setOpds] = useState<Opd[]>([]);
  const [retributionTypes, setRetributionTypes] = useState<RetributionType[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [opdFilter, setOpdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTaxpayer, setEditingTaxpayer] = useState<Taxpayer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taxpayerToDelete, setTaxpayerToDelete] = useState<number | null>(null);

  const [form, setForm] = useState({
    nik: '',
    name: '',
    address: '',
    phone: '',
    npwpd: '',
    object_name: '',
    object_address: '',
    district: '',
    sub_district: '',
    is_active: true,
    opd_id: '',
    retribution_type_ids: [] as number[],
    retribution_classification_ids: [] as number[],
    metadata: {} as Record<string, any>,
  });

  const [files, setFiles] = useState({
    foto_lokasi_open_kamera: null as File | null,
    formulir_data_dukung: null as File | null,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search: search,
        ...(opdFilter ? { opd_id: opdFilter } : user?.role !== 'super_admin' ? { opd_id: user?.opd_id?.toString() || '' } : {}),
      });

      const [taxpayersRes, opdsRes, typesRes, classificationsRes] = await Promise.all([
        api.get(`/api/taxpayers?${queryParams}`),
        user?.role === 'super_admin' ? api.get('/api/opds') : Promise.resolve({ data: [] }),
        api.get('/api/retribution-types'),
        api.get('/api/retribution-classifications'),
      ]);

      setTaxpayers(taxpayersRes.data);
      setTotalPages(taxpayersRes.last_page);
      
      if (user?.role === 'super_admin') {
        setOpds(opdsRes.data || opdsRes);
      }
      
      setRetributionTypes((typesRes.data || typesRes).filter((t: any) => t.is_active));
      setClassifications(classificationsRes.data || classificationsRes);
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
      district: '',
      sub_district: '',
      is_active: true,
      opd_id: user?.opd_id?.toString() || '',
      retribution_type_ids: [],
      retribution_classification_ids: [],
      metadata: {},
    });
    setFiles({
      foto_lokasi_open_kamera: null,
      formulir_data_dukung: null,
    });
    setCurrentStep(1);
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
      district: (taxpayer as any).district || '',
      sub_district: (taxpayer as any).sub_district || '',
      is_active: taxpayer.is_active,
      opd_id: taxpayer.opd_id.toString(),
      retribution_type_ids: taxpayer.retribution_types?.map(t => t.id) || [],
      retribution_classification_ids: (taxpayer as any).retribution_classifications?.map((c: any) => c.id) || [],
      metadata: taxpayer.metadata || {},
    });
    setFiles({
      foto_lokasi_open_kamera: null,
      formulir_data_dukung: null,
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    console.log('Triggering delete for taxpayer:', id);
    setTaxpayerToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!taxpayerToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/api/taxpayers/${taxpayerToDelete}`);
      setShowDeleteModal(false);
      setTaxpayerToDelete(null);
      fetchData();
    } catch (error) {
      alert('Gagal menghapus wajib pajak');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append basic fields
      Object.keys(form).forEach(key => {
        if (key === 'retribution_type_ids') {
          form.retribution_type_ids.forEach(id => formData.append('retribution_type_ids[]', id.toString()));
        } else if (key === 'retribution_classification_ids') {
          form.retribution_classification_ids.forEach(id => formData.append('retribution_classification_ids[]', id.toString()));
        } else if (key === 'metadata') {
          formData.append('metadata', JSON.stringify(form.metadata));
        } else {
          formData.append(key, (form as any)[key]);
        }
      });

      // Append files
      if (files.foto_lokasi_open_kamera) {
        formData.append('foto_lokasi_open_kamera', files.foto_lokasi_open_kamera);
      }
      if (files.formulir_data_dukung) {
        formData.append('formulir_data_dukung', files.formulir_data_dukung);
      }

      if (editingTaxpayer) {
        // Use POST with _method=PUT for multipart/form-data update
        formData.append('_method', 'PUT');
        await api.post(`/api/taxpayers/${editingTaxpayer.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/taxpayers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      console.error('Update/Store Error:', error);
      const message = error.response?.data?.message || error.message || 'Gagal menyimpan data';
      const detail = error.response?.data?.errors ? '\n\n' + Object.values(error.response.data.errors).flat().join('\n') : '';
      alert(message + detail);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRetributionType = (id: number) => {
    setForm(prev => {
      const isSelected = prev.retribution_type_ids.includes(id);
      const newTypeIds = isSelected
        ? prev.retribution_type_ids.filter(tid => tid !== id)
        : [...prev.retribution_type_ids, id];
      
      // If de-selecting a type, also de-select all its classifications
      const newClassificationIds = isSelected
        ? prev.retribution_classification_ids.filter(cid => {
            const cls = classifications.find(c => c.id === cid);
            return cls?.retribution_type_id !== id;
          })
        : prev.retribution_classification_ids;

      return {
        ...prev,
        retribution_type_ids: newTypeIds,
        retribution_classification_ids: newClassificationIds
      };
    });
  };

  const toggleClassification = (id: number, typeId: number) => {
    setForm(prev => {
      const isSelected = prev.retribution_classification_ids.includes(id);
      const newClassificationIds = isSelected
        ? prev.retribution_classification_ids.filter(cid => cid !== id)
        : [...prev.retribution_classification_ids, id];

      // Automatically select the type if any classification is selected
      const newTypeIds = !isSelected && !prev.retribution_type_ids.includes(typeId)
        ? [...prev.retribution_type_ids, typeId]
        : prev.retribution_type_ids;

      return {
        ...prev,
        retribution_type_ids: newTypeIds,
        retribution_classification_ids: newClassificationIds
      };
    });
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-all duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] max-w-5xl w-full max-h-[92vh] flex overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* Left Sidebar: Stepper */}
            <div className="w-80 bg-slate-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-800 p-10 flex flex-col">
              <div className="mb-10">
                <div className="flex items-center gap-3 text-blue-600 mb-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-xl tracking-tighter">RETRIBUSI</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {editingTaxpayer ? 'Perbarui Data' : 'Pendaftaran Baru'}
                </h2>
              </div>

              <div className="flex-1 space-y-2 relative">
                {/* Stepper Line */}
                <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                {[
                  { id: 1, title: 'Data Penanggung Jawab', icon: User },
                  { id: 2, title: 'Data Objek', icon: Briefcase },
                  { id: 3, title: 'Kategori', icon: CreditCard },
                  { id: 4, title: 'Lainnya', icon: Info },
                  { id: 5, title: 'Selesai', icon: CheckCircle2 },
                ].map((step) => (
                  <div key={step.id} className="relative z-10 flex items-center gap-4 group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                      currentStep === step.id 
                        ? 'bg-blue-600 border-blue-100 dark:border-blue-900 text-white shadow-lg' 
                        : currentStep > step.id
                        ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900 text-white'
                        : 'bg-white dark:bg-gray-700 border-gray-50 dark:border-gray-800 text-gray-400'
                    }`}>
                      {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === step.id ? 'text-blue-600' : 'text-gray-400'}`}>Step 0{step.id}</span>
                      <span className={`text-sm font-bold ${currentStep === step.id ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{step.title}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="mt-10 py-4 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Batalkan
              </button>
            </div>

            {/* Right Pane: Form Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                {currentStep === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Data Penanggung Jawab</h3>
                      <p className="text-gray-500 text-sm font-medium">Informasi identitas dasar wajib pajak</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="group relative">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">NIK (Nomor Induk Kependudukan)</label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="01010102302..."
                          value={form.nik}
                          onChange={(e) => setForm({ ...form, nik: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white focus:border-blue-500/50 transition-all font-bold placeholder:text-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                          <input
                            type="text"
                            placeholder="Sesuai KTP"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white focus:border-blue-500 transition-all font-bold"
                          />
                        </div>
                        <div className="group">
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">No. WhatsApp</label>
                          <input
                            type="text"
                            placeholder="0812..."
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white focus:border-blue-500 transition-all font-bold"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Alamat Domisili</label>
                        <textarea
                          rows={3}
                          placeholder="Alamat lengkap..."
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white focus:border-blue-500 transition-all font-bold resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] mb-2">Account & Object Details</h3>
                      <p className="text-gray-500 text-sm font-medium">Informasi instansi dan lokasi objek retribusi</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {user?.role === 'super_admin' ? (
                        <div className="group">
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Dinas/OPD Terkait</label>
                          <select
                            value={form.opd_id}
                            onChange={(e) => setForm({ ...form, opd_id: e.target.value, retribution_type_ids: [] })}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold appearance-none cursor-pointer"
                          >
                            <option value="">Pilih Dinas Pengelola</option>
                            {opds.map(opd => <option key={opd.id} value={opd.id}>{opd.name}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                          <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Authenticated Agency</label>
                          <div className="text-blue-900 dark:text-blue-200 font-bold">{user?.department || 'OPD Terkait'}</div>
                        </div>
                      )}

                      <div className="group">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nama Objek Retribusi</label>
                        <input
                          type="text"
                          placeholder="Merek/Toko/Lahan..."
                          value={form.object_name}
                          onChange={(e) => setForm({ ...form, object_name: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Kecamatan</label>
                          <select
                            value={form.district}
                            onChange={(e) => setForm({ ...form, district: e.target.value, sub_district: '' })}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold appearance-none cursor-pointer"
                          >
                            <option value="">Pilih Kecamatan</option>
                            {Object.keys(BAUBAU_DATA).map(kec => <option key={kec} value={kec}>{kec}</option>)}
                          </select>
                        </div>
                        <div className="group">
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Kelurahan</label>
                          <select
                            value={form.sub_district}
                            onChange={(e) => setForm({ ...form, sub_district: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold appearance-none cursor-pointer"
                            disabled={!form.district}
                          >
                            <option value="">Pilih Kelurahan</option>
                            {form.district && (BAUBAU_DATA as any)[form.district].map((kel: string) => <option key={kel} value={kel}>{kel}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Alamat Lokasi Objek (Detail)</label>
                        <input
                          type="text"
                          placeholder="Jl. Gajah Mada No..."
                          value={form.object_address}
                          onChange={(e) => setForm({ ...form, object_address: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">NPWPD (Opsional)</label>
                        <input
                          type="text"
                          placeholder="Nomor Pokok Wajib Pajak Daerah"
                          value={form.npwpd}
                          onChange={(e) => setForm({ ...form, npwpd: e.target.value })}
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Tax & Retribution Details</h3>
                      <p className="text-gray-500 text-sm font-medium">Pilih kategori retribusi yang berlaku</p>
                    </div>

                    {!form.opd_id ? (
                      <div className="py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                        <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Pilih Dinas pada langkah sebelumnya</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredRetributionTypes.map(type => (
                          <div
                            key={type.id}
                            className={`p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${
                              form.retribution_type_ids.includes(type.id)
                                ? 'border-blue-600 bg-blue-600/5 shadow-xl shadow-blue-500/5'
                                : 'border-gray-100 dark:border-gray-800'
                            }`}
                          >
                            <div 
                              onClick={() => toggleRetributionType(type.id)}
                              className="flex items-center gap-4 cursor-pointer mb-6"
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                form.retribution_type_ids.includes(type.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                              }`}>
                                <CreditCard className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tighter">{type.name}</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Klasifikasi di bawah ini</div>
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                form.retribution_type_ids.includes(type.id) ? 'border-blue-600 bg-blue-600' : 'border-gray-200'
                              }`}>
                                {form.retribution_type_ids.includes(type.id) && <Plus className="w-3 h-3 text-white rotate-45" />}
                              </div>
                            </div>

                            {/* Classifications Grid */}
                            <div className="grid grid-cols-2 gap-3 pl-4">
                              {classifications
                                .filter(c => c.retribution_type_id === type.id)
                                .map(cls => (
                                  <div
                                    key={cls.id}
                                    onClick={() => toggleClassification(cls.id, type.id)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                                      form.retribution_classification_ids.includes(cls.id)
                                        ? 'border-emerald-500 bg-white dark:bg-gray-800 shadow-md'
                                        : 'border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/30'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                      form.retribution_classification_ids.includes(cls.id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                                    }`}>
                                      {form.retribution_classification_ids.includes(cls.id) && <Plus className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-tight ${
                                      form.retribution_classification_ids.includes(cls.id) ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                                    }`}>
                                      {cls.name}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Additional Specifications</h3>
                      <p className="text-gray-500 text-sm font-medium">Informasi tambahan sesuai kategori retribusi</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {retributionTypes
                        .filter(t => form.retribution_type_ids.includes(t.id) && t.form_schema)
                        .reduce((acc, current) => {
                          current.form_schema?.forEach(field => {
                            if (!acc.find(f => f.key === field.key)) acc.push(field);
                          });
                          return acc;
                        }, [] as any[])
                        .map((field) => (
                          <div key={field.key} className="group">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{field.label}</label>
                            {field.type === 'select' ? (
                              <select
                                value={form.metadata[field.key] || ''}
                                onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, [field.key]: e.target.value } })}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold"
                              >
                                <option value="">Pilih {field.label}</option>
                                {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input
                                type={field.type}
                                value={form.metadata[field.key] || ''}
                                onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, [field.key]: e.target.value } })}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-bold"
                                placeholder={field.label}
                              />
                            )}
                          </div>
                        ))}
                      {form.retribution_type_ids.length === 0 && (
                        <div className="col-span-2 py-20 text-center text-gray-400 font-black uppercase text-[10px] tracking-widest border-2 border-dashed border-gray-100 rounded-[2rem]">
                          Tidak ada field tambahan untuk kategori terpilih
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div>
                      <h3 className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] mb-2">Review & Documentation</h3>
                      <p className="text-gray-500 text-sm font-medium">Unggah dokumen pendukung dan tinjau data</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <label className="block group cursor-pointer">
                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Foto Lokasi (Open Kamera)</div>
                         <div className={`p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${
                           files.foto_lokasi_open_kamera ? 'bg-emerald-50 border-emerald-500/50' : 'bg-gray-50 border-gray-100 hover:border-blue-500'
                         }`}>
                           <input type="file" accept="image/*" onChange={e => setFiles({...files, foto_lokasi_open_kamera: e.target.files?.[0] || null})} className="hidden" />
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${files.foto_lokasi_open_kamera ? 'bg-emerald-500 text-white' : 'bg-white text-gray-300'}`}>
                             <Camera className="w-7 h-7" />
                           </div>
                           <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                             {files.foto_lokasi_open_kamera ? files.foto_lokasi_open_kamera.name : 'Klik untuk Upload'}
                           </span>
                         </div>
                       </label>

                       <label className="block group cursor-pointer">
                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Formulir Data Dukung</div>
                         <div className={`p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${
                           files.formulir_data_dukung ? 'bg-indigo-50 border-indigo-500/50' : 'bg-gray-50 border-gray-100 hover:border-blue-500'
                         }`}>
                           <input type="file" onChange={e => setFiles({...files, formulir_data_dukung: e.target.files?.[0] || null})} className="hidden" />
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${files.formulir_data_dukung ? 'bg-indigo-500 text-white' : 'bg-white text-gray-300'}`}>
                             <FileCheck className="w-7 h-7" />
                           </div>
                           <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                             {files.formulir_data_dukung ? files.formulir_data_dukung.name : 'Klik untuk Upload'}
                           </span>
                         </div>
                       </label>
                    </div>

                    <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-lg">Konfirmasi Pendaftaran</h4>
                      </div>
                      <p className="text-blue-100 text-sm font-medium leading-relaxed">
                        Pastikan seluruh data yang dimasukkan telah sesuai dengan persyaratan. 
                        Data yang didaftarkan akan melalui proses verifikasi oleh tim dinas terkait.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="p-10 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-white dark:bg-gray-900 rounded-b-[2rem]">
                <button
                  type="button"
                  onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                  className="px-10 py-4 border-2 border-gray-100 dark:border-gray-800 text-xs font-black text-gray-400 uppercase tracking-widest rounded-2xl hover:bg-gray-50 disabled:opacity-0 transition-all"
                >
                  Previous
                </button>
                
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all active:scale-95"
                  >
                    {submitting ? 'Processing...' : (editingTaxpayer ? 'Simpan Perubahan' : 'Submit Registration')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Hapus Wajib Pajak?</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                Tindakan ini tidak dapat dibatalkan. Seluruh data penagihan terkait juga mungkin akan terdampak.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-900 dark:text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-600/30 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
