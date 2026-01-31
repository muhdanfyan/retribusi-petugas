import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { QrCode, ArrowLeft, Search } from 'lucide-react';

export default function FieldScanner() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualSearch, setManualSearch] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string) => {
      setScanResult(decodedText);
      scanner.clear();
      navigate(`/billing?search=${encodeURIComponent(decodedText)}`);
    };

    const onScanFailure = () => {
      // Silence scan errors
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, [navigate]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualSearch.trim()) {
      navigate(`/billing?search=${encodeURIComponent(manualSearch)}`);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scanner Lapangan</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <QrCode className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scan QR Code</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Arahkan kamera ke QR Code Invoice atau NIK Wajib Pajak
            </p>
          </div>
        </div>

        <div id="reader" className="w-full"></div>

        {scanResult && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-100 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-400 text-center">
              Berhasil memindai: <span className="font-bold">{scanResult}</span>
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Input Manual</h3>
        <form onSubmit={handleManualSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Ketik NIK atau No. Invoice..."
            value={manualSearch}
            onChange={(e) => setManualSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </form>
      </div>
    </div>
  );
}
