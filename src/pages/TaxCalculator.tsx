import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ChevronDown, Loader2, Sparkles, AlertCircle, RefreshCw, Info, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

interface TaxClassification {
  id: number;
  name: string;
  code: string;
  calculation_formula: string;
  retribution_type_id: number;
  retribution_type?: { id: number; name: string };
  form_schema?: { key: string; label: string; type: string }[];
}

interface SimulationResult {
  classification: string;
  formula: string;
  variables: Record<string, number>;
  result: number;
  formatted: string;
}

export default function TaxCalculator() {
  const navigate = useNavigate();
  const [classifications, setClassifications] = useState<TaxClassification[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClassifications();
  }, []);

  const loadClassifications = async () => {
    try {
      const res = await api.get('/api/tax-formulas');
      setClassifications(res.data || []);
    } catch (err) {
      setError('Gagal memuat data klasifikasi pajak.');
    } finally {
      setLoading(false);
    }
  };

  const selected = classifications.find(c => c.id.toString() === selectedId);

  const handleSelectClassification = (id: string) => {
    setSelectedId(id);
    setResult(null);
    setError('');
    const cls = classifications.find(c => c.id.toString() === id);
    if (cls) {
      // Extract variable names from the formula
      const formulaVars = cls.calculation_formula
        .replace(/[+\-*/().0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(v => v && isNaN(Number(v)));
      
      const newVars: Record<string, string> = {};
      formulaVars.forEach(v => { 
        const field = cls.form_schema?.find((f: any) => f.key === v);
        newVars[v] = field?.defaultValue !== undefined ? field.defaultValue.toString() : ''; 
      });
      setVariables(newVars);
    }
  };

  const handleCalculate = async () => {
    if (!selectedId) return;
    setCalculating(true);
    setError('');
    setResult(null);
    
    try {
      const numericVars: Record<string, number> = {};
      Object.entries(variables).forEach(([key, val]) => {
        numericVars[key] = parseFloat(val) || 0;
      });

      const res = await api.post('/api/simulate-tax', {
        classification_id: parseInt(selectedId),
        variables: numericVars,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Gagal menghitung simulasi.');
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setSelectedId('');
    setVariables({});
    setResult(null);
    setError('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getVariableLabel = (key: string): string => {
    if (selected?.form_schema) {
      const field = selected.form_schema.find(f => f.key === key);
      if (field) return field.label;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2d5cd5]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
            Simulasi <span className="text-[#2d5cd5]">Pajak</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Hitung perkiraan tagihan retribusi sesuai regulasi Perwali Nomor 58 Tahun 2024</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-[#2d5cd5]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Aspect: Configuration & Inputs */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Sparkles size={20} />
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Parameter Simulasi</h2>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Jenis Pajak / Retribusi</label>
                <div className="relative">
                  <select
                    value={selectedId}
                    onChange={e => handleSelectClassification(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:border-blue-500/50 transition-all text-base"
                  >
                    <option value="">Pilih Klasifikasi Pajak...</option>
                    {classifications.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.retribution_type?.name ? `${cls.retribution_type.name} — ` : ''}{cls.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {selected && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                  <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={14} className="text-blue-500" />
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Rumus Perhitungan</p>
                    </div>
                    <code className="text-sm text-blue-900 dark:text-blue-300 font-mono font-bold break-all">
                      {selected.calculation_formula}
                    </code>
                  </div>

                  {Object.keys(variables).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.keys(variables).map(key => {
                        const isDuration = key.toLowerCase().includes('bulan') || key.toLowerCase().includes('hari') || key.toLowerCase().includes('tahun') || key.toLowerCase().includes('durasi');
                        return (
                          <div key={key} className="group">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                              {getVariableLabel(key)}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="0"
                                value={variables[key]}
                                onChange={e => setVariables({ ...variables, [key]: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white focus:border-blue-500/50 transition-all pr-20"
                              />
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                {isDuration ? 'Durasi' : 'Nilai'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selected && (
              <div className="flex items-center gap-4 mt-12 pt-8 border-t border-slate-50 dark:border-slate-800">
                <button
                  onClick={handleReset}
                  className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Reset
                </button>
                <button
                  onClick={handleCalculate}
                  disabled={calculating || Object.values(variables).some(v => !v)}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                >
                  {calculating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Calculator size={18} />
                      Hitung Simulasi Sekarang
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed flex gap-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              Hasil simulasi ini hanya bersifat estimasi berdasarkan parameter yang Anda masukkan. Besaran tagihan final akan ditentukan oleh verifikator dinas terkait saat proses penagihan resmi.
            </p>
          </div>
        </div>

        {/* Right Aspect: Result Display */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-[#074764] dark:bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
              
              <div className="relative z-10">
                <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Estimasi Pajak</p>
                <h3 className="text-4xl font-black tracking-tight mb-8">
                  {formatCurrency(result.result)}
                </h3>

                <div className="space-y-4 pt-8 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-bold text-blue-200 uppercase tracking-widest">
                    <span>Klasifikasi</span>
                    <span className="text-white text-right max-w-[150px] truncate">{result.classification}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(result.variables).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span className="text-blue-200/60 font-medium">{getVariableLabel(key)}</span>
                        <span className="font-black text-white">{Number(val).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.2em] mb-2">Logika Perhitungan</p>
                    <code className="text-xs font-mono text-blue-100 break-all leading-relaxed">
                      {result.formula}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Calculator size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-2">Hasil Simulasi</h3>
              <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">Lengkapi parameter dan klik tombol hitung untuk melihat estimasi tagihan</p>
            </div>
          )}

          {/* Quick Links / Tips */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Informasi Tambahan</h4>
            <div className="space-y-2">
              {[
                'Gunakan titik (.) untuk desimal',
                'Pastikan unit waktu sesuai (Bulan/Hari)',
                'Cek Master Data untuk aturan tarif'
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
