import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useState, useEffect } from 'react';

export function InstallPWA() {
  const { isInstallable, installPWA } = usePWAInstall();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  if (!show || !isInstallable) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#2d5cd5] rounded-xl flex items-center justify-center text-white">
            <Download size={24} />
          </div>
          <div>
            <h3 className="text-slate-900 font-bold text-sm">Install App Petugas</h3>
            <p className="text-slate-500 text-xs">Akses tugas lebih mudah</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={installPWA}
            className="bg-[#2d5cd5] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            Install
          </button>
          <button
            onClick={() => setShow(false)}
            className="p-2 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
