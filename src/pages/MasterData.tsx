import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Tarif, Zona } from '../types';

export default function MasterData() {
  const [activeTab, setActiveTab] = useState<'tarif' | 'zona' | 'klasifikasi'>('tarif');

  const [tarifs, setTarifs] = useState<Tarif[]>([
    { id: '1', name: 'Pasar Tradisional', category: 'Retribusi Pasar', amount: 50000, unit: 'per bulan', status: 'active' },
    { id: '2', name: 'Pasar Modern', category: 'Retribusi Pasar', amount: 150000, unit: 'per bulan', status: 'active' },
    { id: '3', name: 'Reklame Billboard', category: 'Pajak Reklame', amount: 500000, unit: 'per m²', status: 'active' },
    { id: '4', name: 'Parkir Mobil', category: 'Retribusi Parkir', amount: 5000, unit: 'per jam', status: 'active' },
    { id: '5', name: 'Parkir Motor', category: 'Retribusi Parkir', amount: 2000, unit: 'per jam', status: 'inactive' },
  ]);

  const [zonas, setZonas] = useState<Zona[]>([
    { id: '1', name: 'Zona Pusat Kota', code: 'Z01', multiplier: 1.5, description: 'Area pusat bisnis dan pemerintahan' },
    { id: '2', name: 'Zona Komersial', code: 'Z02', multiplier: 1.3, description: 'Area pertokoan dan mall' },
    { id: '3', name: 'Zona Residensial', code: 'Z03', multiplier: 1.0, description: 'Area perumahan' },
    { id: '4', name: 'Zona Pinggiran', code: 'Z04', multiplier: 0.8, description: 'Area pinggiran kota' },
  ]);

  const [showTarifModal, setShowTarifModal] = useState(false);
  const [showZonaModal, setShowZonaModal] = useState(false);
  const [editingTarif, setEditingTarif] = useState<Tarif | null>(null);
  const [editingZona, setEditingZona] = useState<Zona | null>(null);

  const [tarifForm, setTarifForm] = useState({
    name: '',
    category: 'Retribusi Pasar',
    amount: '',
    unit: '',
    status: 'active' as const,
  });

  const [zonaForm, setZonaForm] = useState({
    name: '',
    code: '',
    multiplier: '',
    description: '',
  });

  const handleAddTarif = () => {
    setEditingTarif(null);
    setTarifForm({ name: '', category: 'Retribusi Pasar', amount: '', unit: '', status: 'active' });
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
    });
    setShowTarifModal(true);
  };

  const handleDeleteTarif = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tarif ini?')) {
      setTarifs(tarifs.filter((t) => t.id !== id));
    }
  };

  const handleSubmitTarif = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTarif) {
      setTarifs(
        tarifs.map((t) =>
          t.id === editingTarif.id
            ? { ...t, ...tarifForm, amount: parseInt(tarifForm.amount) }
            : t
        )
      );
    } else {
      const newTarif: Tarif = {
        id: Date.now().toString(),
        ...tarifForm,
        amount: parseInt(tarifForm.amount),
      };
      setTarifs([...tarifs, newTarif]);
    }

    setShowTarifModal(false);
  };

  const handleAddZona = () => {
    setEditingZona(null);
    setZonaForm({ name: '', code: '', multiplier: '', description: '' });
    setShowZonaModal(true);
  };

  const handleEditZona = (zona: Zona) => {
    setEditingZona(zona);
    setZonaForm({
      name: zona.name,
      code: zona.code,
      multiplier: zona.multiplier.toString(),
      description: zona.description,
    });
    setShowZonaModal(true);
  };

  const handleDeleteZona = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus zona ini?')) {
      setZonas(zonas.filter((z) => z.id !== id));
    }
  };

  const handleSubmitZona = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingZona) {
      setZonas(
        zonas.map((z) =>
          z.id === editingZona.id
            ? { ...z, ...zonaForm, multiplier: parseFloat(zonaForm.multiplier) }
            : z
        )
      );
    } else {
      const newZona: Zona = {
        id: Date.now().toString(),
        ...zonaForm,
        multiplier: parseFloat(zonaForm.multiplier),
      };
      setZonas([...zonas, newZona]);
    }

    setShowZonaModal(false);
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
                <button
                  onClick={handleAddTarif}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Tarif
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nama Tarif
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Kategori
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {tarifs.map((tarif) => (
                      <tr key={tarif.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {tarif.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {tarif.category}
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
                <button
                  onClick={handleAddZona}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Tambah Zona
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nama Zona
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Kode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Multiplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Deskripsi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {zonas.map((zona) => (
                      <tr key={zona.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {zona.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {zona.code}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {zona.multiplier}x
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {zona.description}
                        </td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'klasifikasi' && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Klasifikasi management akan ditambahkan di sini
              </p>
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
            </div>

            <form onSubmit={handleSubmitTarif} className="p-6 space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori
                </label>
                <select
                  value={tarifForm.category}
                  onChange={(e) => setTarifForm({ ...tarifForm, category: e.target.value })}
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
                  placeholder="1.0, 1.5, 2.0, dll"
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
