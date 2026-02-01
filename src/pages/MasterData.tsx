import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Tarif, Zona, RetributionType, Opd } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker position={position}></Marker>
  ) : null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MasterData() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tarif' | 'zona' | 'klasifikasi'>('tarif');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'opd';

  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [opds, setOpds] = useState<Opd[]>([]);

  const [showTarifModal, setShowTarifModal] = useState(false);
  const [showZonaModal, setShowZonaModal] = useState(false);
  const [editingTarif, setEditingTarif] = useState<Tarif | null>(null);
  const [editingZona, setEditingZona] = useState<Zona | null>(null);

  const [tarifForm, setTarifForm] = useState({
    name: '',
    category: 'Retribusi Umum',
    amount: '',
    unit: '',
    status: 'active' as 'active' | 'inactive',
    opd_id: '',
    icon: null as File | null,
    form_schema: [] as any[],
    requirements: [] as any[],
  });

  const [zonaForm, setZonaForm] = useState({
    name: '',
    code: '',
    multiplier: '1',
    amount: '',
    description: '',
    latitude: -5.4677, // Center of Bau-Bau
    longitude: 122.6048,
    opd_id: '',
    retribution_type_id: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [typesRes, zonesRes, opdsRes] = await Promise.all([
          api.get('/api/retribution-types'),
          api.get('/api/zones'),
          api.get('/api/opds'),
        ]);

        // Map RetributionType to Tarif
        const mappedTarifs: Tarif[] = (typesRes.data || typesRes)
          .filter((t: RetributionType) => t.is_active)
          .map((t: RetributionType) => ({
            id: t.id.toString(),
            name: t.name,
            category: 'Retribusi',
            amount: Number(t.base_amount),
            unit: t.unit,
            status: t.is_active ? 'active' : 'inactive',
            department: t.opd?.name || 'Unknown',
            opd_id: t.opd_id,
            icon: t.icon,
            form_schema: t.form_schema || [],
            requirements: t.requirements || [],
          }));

        setTarifs(mappedTarifs);
        setZonas((zonesRes.data || zonesRes).map((z: any) => ({ ...z, id: z.id.toString() })));
        setOpds(opdsRes.data || opdsRes);
      } catch (error) {
        console.error('Error fetching master data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredTarifs = useMemo(() => {
    if (!user) return [];
    if (user.role === 'super_admin') {
      return tarifs;
    }
    return tarifs.filter((tarif: any) => tarif.opd_id === user.opd_id);
  }, [user, tarifs]);

  const groupedKlasifikasi = useMemo(() => {
    const categories: Record<string, Tarif[]> = {};
    filteredTarifs.forEach(t => {
      const cat = t.category || 'Lainnya';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(t);
    });
    return categories;
  }, [filteredTarifs]);

  const handleAddTarif = () => {
    setEditingTarif(null);
    setTarifForm({
      name: '',
      category: 'Retribusi Umum',
      amount: '',
      unit: '',
      status: 'active',
      opd_id: user?.role === 'opd' ? user.opd_id?.toString() || '' : opds[0]?.id.toString() || '',
      icon: null,
      form_schema: [],
      requirements: [],
    });
    setShowTarifModal(true);
  };

  const handleEditTarif = (tarif: Tarif) => {
    setEditingTarif(tarif);
    setTarifForm({
      name: tarif.name,
      category: tarif.category,
      amount: tarif.amount.toString(),
      unit: tarif.unit,
      status: tarif.status,
      opd_id: (tarif as any).opd_id?.toString() || '',
      icon: null,
      form_schema: tarif.form_schema || [],
      requirements: tarif.requirements || [],
    });
    setShowTarifModal(true);
  };

  const handleDeleteTarif = async (id: string | number) => {
    if (confirm('Apakah Anda yakin ingin menghapus tarif ini?')) {
      try {
        await api.delete(`/api/retribution-types/${id}`);
        setTarifs(tarifs.filter((t) => t.id.toString() !== id.toString()));
      } catch (error) {
        alert('Gagal menghapus tarif');
      }
    }
  };

  const handleSubmitTarif = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', tarifForm.name);
    formData.append('base_amount', tarifForm.amount);
    formData.append('unit', tarifForm.unit);
    formData.append('is_active', tarifForm.status === 'active' ? '1' : '0');
    formData.append('opd_id', tarifForm.opd_id);
    
    if (tarifForm.icon) {
      formData.append('icon', tarifForm.icon);
    }

    try {
      if (tarifForm.form_schema.length > 0) {
        formData.append('form_schema', JSON.stringify(tarifForm.form_schema));
      }
      if (tarifForm.requirements.length > 0) {
        formData.append('requirements', JSON.stringify(tarifForm.requirements));
      }

      if (editingTarif) {
        // Use POST with _method=PUT for Laravel to handle multipart/form-data updates
        formData.append('_method', 'PUT');
        const updated = await api.post(`/api/retribution-types/${editingTarif.id}`, formData);
        const t = updated.data || updated;
        setTarifs(tarifs.map((prev) => prev.id === editingTarif.id ? {
          id: t.id.toString(),
          name: t.name,
          category: 'Retribusi',
          amount: Number(t.base_amount),
          unit: t.unit,
          status: t.is_active ? 'active' : 'inactive',
          department: opds.find(o => o.id === t.opd_id)?.name || 'Unknown',
          opd_id: t.opd_id,
          icon: t.icon,
        } : prev));
      } else {
        const created = await api.post('/api/retribution-types', formData);
        const t = created.data || created;
        const newTarif: Tarif = {
          id: t.id.toString(),
          name: t.name,
          category: 'Retribusi',
          amount: Number(t.base_amount),
          unit: t.unit,
          status: t.is_active ? 'active' : 'inactive',
          department: opds.find(o => o.id === t.opd_id)?.name || 'Unknown',
          opd_id: t.opd_id,
          icon: t.icon,
        } as any;
        setTarifs([...tarifs, newTarif]);
      }
      setShowTarifModal(false);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Gagal menyimpan tarif');
    }
  };

  const handleAddZona = () => {
    setEditingZona(null);
    setZonaForm({ 
      name: '', 
      code: '', 
      multiplier: '1', 
      amount: '',
      description: '',
      latitude: -5.4677,
      longitude: 122.6048,
      opd_id: user?.role === 'opd' ? user.opd_id?.toString() || '' : '',
      retribution_type_id: '',
    });
    setShowZonaModal(true);
  };

  const handleEditZona = (zona: Zona) => {
    setEditingZona(zona);
    setZonaForm({
      name: zona.name,
      code: zona.code,
      multiplier: zona.multiplier.toString(),
      amount: zona.amount?.toString() || '',
      description: zona.description,
      latitude: Number(zona.latitude) || -5.4677,
      longitude: Number(zona.longitude) || 122.6048,
      opd_id: zona.opd_id?.toString() || '',
      retribution_type_id: zona.retribution_type_id?.toString() || '',
    });
    setShowZonaModal(true);
  };

  const handleDeleteZona = async (id: string | number) => {
    if (confirm('Apakah Anda yakin ingin menghapus zona ini?')) {
      try {
        await api.delete(`/api/zones/${id}`);
        setZonas(zonas.filter((z) => z.id.toString() !== id.toString()));
      } catch (error) {
        alert('Gagal menghapus zona');
      }
    }
  };

  const handleSubmitZona = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: zonaForm.name,
      code: zonaForm.code,
      multiplier: Number(zonaForm.multiplier),
      amount: Number(zonaForm.amount),
      description: zonaForm.description,
      latitude: zonaForm.latitude,
      longitude: zonaForm.longitude,
      opd_id: zonaForm.opd_id,
      retribution_type_id: zonaForm.retribution_type_id,
    };

    try {
      if (editingZona) {
        const updated = await api.put(`/api/zones/${editingZona.id}`, payload);
        setZonas(zonas.map((z) => z.id === editingZona.id ? { ...updated, id: updated.id.toString() } : z));
      } else {
        const created = await api.post('/api/zones', payload);
        setZonas([...zonas, { ...created, id: created.id.toString() }]);
      }
      setShowZonaModal(false);
    } catch (error) {
      alert('Gagal menyimpan zona');
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Master Data Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola tarif, zona, dan klasifikasi
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('tarif')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tarif'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Tarif
            </button>
            <button
              onClick={() => setActiveTab('zona')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'zona'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Zona
            </button>
            <button
              onClick={() => setActiveTab('klasifikasi')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'klasifikasi'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Klasifikasi
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'tarif' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daftar Tarif
                </h2>
                {isAdmin && (
                  <button
                    onClick={handleAddTarif}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Tarif
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Icon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nama Tarif
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        OPD Terkait
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Tarif
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Satuan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTarifs.map((tarif) => (
                      <tr key={tarif.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          {(tarif as any).icon ? (
                            <img src={(tarif as any).icon} alt="" className="w-8 h-8 object-contain" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                              -
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {tarif.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {tarif.department}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(tarif.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {tarif.unit}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tarif.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {tarif.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-sm text-right space-x-2">
                            <button
                              onClick={() => handleEditTarif(tarif)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTarif(tarif.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'zona' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daftar Zona
                </h2>
                {isAdmin && (
                  <button
                    onClick={handleAddZona}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Zona
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nama Zona
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Retribusi & OPD
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Kode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Multiplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Tarif
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Deskripsi
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {zonas
                      .filter(z => !user || user.role === 'super_admin' || z.opd_id === user.opd_id)
                      .map((zona) => (
                      <tr key={zona.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {zona.name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {zona.retribution_type?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {zona.opd?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {zona.code}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {zona.multiplier}x
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(Number(zona.amount || 0))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {zona.description}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-sm text-right space-x-2">
                            <button
                              onClick={() => handleEditZona(zona)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteZona(zona.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'klasifikasi' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Potensi Berdasarkan Klasifikasi
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedKlasifikasi).map(([category, items]) => (
                  <div key={category} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white">{category}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold rounded-lg">
                        {items.length} Jenis
                      </span>
                    </div>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Total Potensi Dasar</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(items.reduce((sum, i) => sum + i.amount, 0))}
                      </span>
                    </div>
                  </div>
                ))}
                {Object.keys(groupedKlasifikasi).length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500 italic">
                    Belum ada data klasifikasi tersedia.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showTarifModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTarif ? 'Edit Tarif' : 'Tambah Tarif Baru'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">Konfigurasi tarif dan skema input data wajib pajak.</p>
            </div>

            <form onSubmit={handleSubmitTarif} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Tarif
                </label>
                <input
                  type="text"
                  value={tarifForm.name}
                  onChange={(e) => setTarifForm({ ...tarifForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {user?.role === 'super_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OPD atau Dinas Terkait
                  </label>
                  <select
                    value={tarifForm.opd_id}
                    onChange={(e) => setTarifForm({ ...tarifForm, opd_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih OPD</option>
                    {opds.map((opd) => (
                      <option key={opd.id} value={opd.id}>{opd.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarif (Rp)
                </label>
                <input
                  type="number"
                  value={tarifForm.amount}
                  onChange={(e) => setTarifForm({ ...tarifForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon (Gambar)
                </label>
                <div className="flex items-center gap-4">
                  {((tarifForm as any).icon || (editingTarif as any)?.icon) && (
                    <img 
                      src={tarifForm.icon ? URL.createObjectURL(tarifForm.icon) : (editingTarif as any).icon} 
                      alt="Preview" 
                      className="w-12 h-12 object-contain border rounded p-1"
                    />
                  )}
                  <input
                    type="file"
                    onChange={(e) => setTarifForm({ ...tarifForm, icon: e.target.files?.[0] || null })}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="image/*"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Satuan
                </label>
                <input
                  type="text"
                  value={tarifForm.unit}
                  onChange={(e) => setTarifForm({ ...tarifForm, unit: e.target.value })}
                  placeholder="per bulan, per m², per jam, dll"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={tarifForm.status}
                  onChange={(e) =>
                    setTarifForm({ ...tarifForm, status: e.target.value as 'active' | 'inactive' })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Form Schema Builder */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-white">
                    Skema Input Data (Metadata)
                  </label>
                  <button
                    type="button"
                    onClick={() => setTarifForm({
                      ...tarifForm,
                      form_schema: [...tarifForm.form_schema, { key: '', label: '', type: 'text', required: false }]
                    })}
                    className="text-xs text-blue-600 font-semibold"
                  >
                    + Tambah Field
                  </button>
                </div>
                <div className="space-y-2">
                  {tarifForm.form_schema.map((field, index) => (
                    <div key={index} className="flex gap-2 items-start bg-gray-50 dark:bg-gray-900/40 p-2 rounded border border-gray-100 dark:border-gray-700">
                      <div className="flex-1 space-y-1">
                        <input
                          placeholder="Key (e.g. sqm)"
                          className="w-full text-xs p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          value={field.key}
                          onChange={(e) => {
                            const newSchema = [...tarifForm.form_schema];
                            newSchema[index].key = e.target.value;
                            setTarifForm({ ...tarifForm, form_schema: newSchema });
                          }}
                        />
                        <input
                          placeholder="Label (e.g. Luas m2)"
                          className="w-full text-xs p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          value={field.label}
                          onChange={(e) => {
                            const newSchema = [...tarifForm.form_schema];
                            newSchema[index].label = e.target.value;
                            setTarifForm({ ...tarifForm, form_schema: newSchema });
                          }}
                        />
                      </div>
                      <select
                        className="text-xs p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={field.type}
                        onChange={(e) => {
                          const newSchema = [...tarifForm.form_schema];
                          newSchema[index].type = e.target.value;
                          setTarifForm({ ...tarifForm, form_schema: newSchema });
                        }}
                      >
                        <option value="text">Teks</option>
                        <option value="number">Angka</option>
                        <option value="date">Tanggal</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const newSchema = tarifForm.form_schema.filter((_, i) => i !== index);
                          setTarifForm({ ...tarifForm, form_schema: newSchema });
                        }}
                        className="text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {tarifForm.form_schema.length === 0 && (
                    <p className="text-[10px] text-gray-500 italic text-center">Belum ada field khusus.</p>
                  )}
                </div>
              </div>

              {/* Requirements Builder */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-white">
                    Persyaratan Dokumen
                  </label>
                  <button
                    type="button"
                    onClick={() => setTarifForm({
                      ...tarifForm,
                      requirements: [...tarifForm.requirements, { key: '', label: '', required: true }]
                    })}
                    className="text-xs text-blue-600 font-semibold"
                  >
                    + Tambah Dokumen
                  </button>
                </div>
                <div className="space-y-2">
                  {tarifForm.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900/40 p-2 rounded border border-gray-100 dark:border-gray-700">
                      <input
                        placeholder="Nama Dokumen (e.g. Foto Lokasi)"
                        className="flex-1 text-xs p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={req.label}
                        onChange={(e) => {
                          const newReqs = [...tarifForm.requirements];
                          newReqs[index].label = e.target.value;
                          newReqs[index].key = e.target.value.toLowerCase().replace(/\s+/g, '_');
                          setTarifForm({ ...tarifForm, requirements: newReqs });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newReqs = tarifForm.requirements.filter((_, i) => i !== index);
                          setTarifForm({ ...tarifForm, requirements: newReqs });
                        }}
                        className="text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {tarifForm.requirements.length === 0 && (
                    <p className="text-[10px] text-gray-500 italic text-center">Belum ada syarat dokumen.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTarifModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingTarif ? 'Update' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showZonaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingZona ? 'Edit Zona' : 'Tambah Zona Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmitZona} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Zona
                </label>
                <input
                  type="text"
                  value={zonaForm.name}
                  onChange={(e) => setZonaForm({ ...zonaForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {user?.role === 'super_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    OPD atau Dinas Terkait
                  </label>
                  <select
                    value={zonaForm.opd_id}
                    onChange={(e) => setZonaForm({ ...zonaForm, opd_id: e.target.value, retribution_type_id: '' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih OPD</option>
                    {opds.map((opd) => (
                      <option key={opd.id} value={opd.id}>{opd.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jenis Retribusi
                </label>
                <select
                  value={zonaForm.retribution_type_id}
                  onChange={(e) => setZonaForm({ ...zonaForm, retribution_type_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Jenis Retribusi</option>
                  {tarifs
                    .filter(t => !zonaForm.opd_id || t.opd_id?.toString() === zonaForm.opd_id.toString())
                    .map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kode Zona
                  </label>
                  <input
                    type="text"
                    value={zonaForm.code}
                    onChange={(e) => setZonaForm({ ...zonaForm, code: e.target.value })}
                    placeholder="Z01, Z02, dll"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={zonaForm.multiplier}
                    onChange={(e) => setZonaForm({ ...zonaForm, multiplier: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarif Dasar (Rp)
                </label>
                <input
                  type="number"
                  value={zonaForm.amount}
                  onChange={(e) => setZonaForm({ ...zonaForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={zonaForm.description}
                  onChange={(e) => setZonaForm({ ...zonaForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Lokasi di Map
                </label>
                <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 z-0">
                  <MapContainer 
                    center={[zonaForm.latitude, zonaForm.longitude]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker 
                      position={[zonaForm.latitude, zonaForm.longitude]} 
                      setPosition={(pos) => setZonaForm({ ...zonaForm, latitude: pos[0], longitude: pos[1] })} 
                    />
                    <ChangeView center={[zonaForm.latitude, zonaForm.longitude]} />
                  </MapContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-[10px] text-gray-500">Lat: {zonaForm.latitude.toFixed(6)}</div>
                  <div className="text-[10px] text-gray-500">Lng: {zonaForm.longitude.toFixed(6)}</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowZonaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingZona ? 'Update' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
