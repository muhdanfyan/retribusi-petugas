import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Search, Filter, Loader2, Building2, User as UserIcon, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../lib/api';

interface Opd {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  created_at: string;
  users?: {
    id: string;
    name: string;
    email: string;
  }[];
}

export default function OpdManagement() {
  const [opds, setOpds] = useState<Opd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchOpds();
  }, []);

  const fetchOpds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/opd');
      // The API returns { data: [...] }
      setOpds(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data OPD');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const action = status === 'approved' ? 'menyetujui' : 'menolak';
    if (confirm(`Apakah Anda yakin ingin ${action} pendaftaran OPD ini?`)) {
      try {
        await api.put(`/api/opd/${id}`, { status });
        setOpds(opds.map((opd) => (opd.id === id ? { ...opd, status } : opd)));
      } catch (err: any) {
        alert(err.message || `Gagal ${action} OPD`);
      }
    }
  };

  const filteredOpds = opds.filter((opd) => {
    const matchesSearch =
      opd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opd.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || opd.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500">Memuat data OPD...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kelola OPD</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Persetujuan dan manajemen pendaftaran Organisasi Perangkat Daerah
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama atau kode OPD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {error && (
            <div className="p-6 text-center text-red-500">
              {error}
              <button onClick={fetchOpds} className="ml-2 underline">Coba Lagi</button>
            </div>
          )}
          
          {filteredOpds.length === 0 && !error ? (
            <div className="p-12 text-center text-gray-500">
              Tidak ada data OPD ditemukan.
            </div>
          ) : (
            filteredOpds.map((opd) => (
              <div key={opd.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {opd.name}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase ${
                            opd.status === 'approved' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : opd.status === 'rejected'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {opd.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded inline-block">
                          Kode: {opd.code}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{opd.address || 'Alamat tidak tersedia'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span>{opd.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{opd.email || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                        <UserIcon className="w-4 h-4" />
                        <span>Admin: {opd.users?.[0]?.name} ({opd.users?.[0]?.email})</span>
                      </div>
                    </div>
                  </div>

                  {opd.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateStatus(opd.id, 'approved')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold shadow-sm"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(opd.id, 'rejected')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-semibold"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
