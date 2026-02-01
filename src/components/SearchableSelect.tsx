import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Option {
  id: string | number;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onSelect: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onSelect,
  placeholder = 'Pilih item...',
  searchPlaceholder = 'Cari...',
  label,
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id.toString() === value.toString());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
          {label}
        </label>
      )}
      
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl cursor-pointer hover:ring-2 hover:ring-blue-500/20 transition-all font-bold text-sm"
      >
        <span className={`${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-gray-50 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onSelect(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    value.toString() === opt.id.toString() ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm ${value.toString() === opt.id.toString() ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-gray-900 dark:text-white font-bold'}`}>
                      {opt.label}
                    </span>
                    {opt.subLabel && (
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-0.5">
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                  {value.toString() === opt.id.toString() && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-sm text-gray-400 italic font-bold">
                Tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
