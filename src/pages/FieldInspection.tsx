import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, MapPin, CheckCircle, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function FieldInspection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const noticeId = searchParams.get('noticeId');
  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (noticeId) {
      fetchNotice();
    }
    // Get current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Gagal mendapatkan lokasi GPS. Pastikan GPS aktif.");
        }
      );
    }
  }, [noticeId]);

  const fetchNotice = async () => {
    try {
      const res = await api.get(`/api/pengawas/enforcements`);
      const found = res.data.find((n: any) => n.id.toString() === noticeId);
      setNotice(found);
    } catch (err: any) {
      setError("Gagal memuat data surat perintah.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !photo) {
      alert("Lokasi dan Foto wajib diisi!");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('lat', location.lat.toString());
      formData.append('lng', location.lng.toString());
      formData.append('photo', photo);

      await api.post(`/api/pengawas/enforcements/${noticeId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Laporan kunjungan lapangan berhasil dikirim!");
      navigate('/dashboard');
    } catch (err: any) {
      alert("Gagal mengirim laporan: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Laporan Lapangan</h1>
      </div>

      {notice && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h2 className="font-bold text-blue-900">{notice.number}</h2>
          <p className="text-sm text-blue-700">{notice.tax_object?.name}</p>
          <p className="text-xs text-blue-600 mt-1 uppercase font-bold">{notice.type}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium mb-4">1. Verifikasi Lokasi (GPS)</label>
          {location ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg">
              <MapPin className="w-5 h-5" />
              <span className="text-xs font-mono">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
              <CheckCircle className="w-4 h-4 ml-auto" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 text-yellow-700 rounded-lg animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs">Mencari lokasi akurat...</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium mb-4">2. Ambil Foto Lokasi</label>
          <div 
            onClick={() => document.getElementById('camera-input')?.click()}
            className="aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors overflow-hidden"
          >
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <>
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Klik untuk ambil foto (Kamera)</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            id="camera-input" 
            accept="image/*" 
            capture="environment" 
            onChange={handlePhotoChange}
            className="hidden" 
          />
        </div>

        <button
          type="submit"
          disabled={!location || !photo || submitting}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "KIRIM LAPORAN INSPEKSI"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
