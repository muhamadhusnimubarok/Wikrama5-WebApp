import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  X,
  Settings,
  Ban,
  Heart,
  Star,
  Circle,
  Image as ImageIcon,
  Layers,
  Palette,
  Type
} from 'lucide-react';

export function FloatingSetting({ onClick }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 p-4 rounded-full text-white shadow-2xl hover:scale-110 transition-transform duration-300"
      style={{ backgroundColor: theme.primaryColor }}
    >
      <Settings className="w-6 h-6 animate-[spin_5s_linear_infinite]" />
    </button>
  );
}

export default function ThemeSettingModal({ isOpen, onClose }) {
  const { theme, updateTheme } = useTheme();

  // Local state agar UI latar/elemen tidak berubah sebelum tombol "Terapkan" diklik
  const [localTheme, setLocalTheme] = useState(theme);

  // Sinkronisasi local state saat modal dibuka
  useEffect(() => {
    if (isOpen) setLocalTheme(theme);
  }, [isOpen, theme]);

  if (!isOpen) return null;

  const handleApply = () => {
    updateTheme(localTheme); // Terapkan ke Context Global
    onClose();               // Tutup Modal
  };

  const primaryColors = ['#3d48c0', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#0f172a'];

  const fonts = [
    { label: 'Inter', value: "'Inter', sans-serif" },
    { label: 'Poppins', value: "'Poppins', sans-serif" },
    { label: 'Quicksand', value: "'Quicksand', sans-serif" },
    { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },

    { label: 'Rubik Beastly (Aneh)', value: "'Rubik Beastly', sans-serif" },
    { label: 'Bungee Spice (3D)', value: "'Bungee Spice', sans-serif" },
    { label: 'Permanent Marker', value: "'Permanent Marker', cursive" },
    { label: 'Jacquarda (Gotik)', value: "'Jacquarda Bastarda 9', serif" }
  ];

  const backgrounds = [
    { name: 'Putih Bersih', value: '#ffffff' },
    { name: 'Soft Blue', value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
    { name: 'Warm Peach', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { name: 'Soft Purple', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
    { name: 'Dark Mode', value: '#0f172a' },
  ];

  const elements = [
    { name: 'Kosong', type: 'none', icon: Ban },
    { name: 'Love', type: 'heart', icon: Heart },
    { name: 'Bintang', type: 'star', icon: Star },
    { name: 'Lingkaran', type: 'circle', icon: Circle }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden" style={{ fontFamily: localTheme.fontFamily }}>

        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: localTheme.primaryColor }} />
            Kustomisasi Tampilan
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-full shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar">

          {/* 1. Setting Latar Belakang (Background) */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <ImageIcon className="w-4 h-4" /> Latar Belakang (Layer Paling Bawah)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {backgrounds.map(bg => (
                <button
                  key={bg.name}
                  onClick={() => setLocalTheme({ ...localTheme, background: bg.value })}
                  className={`relative h-12 rounded-xl border-2 transition-all overflow-hidden ${localTheme.background === bg.value ? 'border-slate-800 shadow-md scale-[1.02]' : 'border-slate-200 hover:border-slate-400'}`}
                >
                  <div className="absolute inset-0 w-full h-full" style={{ background: bg.value }} />
                  <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold drop-shadow-md ${bg.value === '#ffffff' ? 'text-slate-800' : 'text-white'}`}>
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Setting Elemen (Partikel) */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Layers className="w-4 h-4" /> Animasi Elemen Raksasa
            </label>
            <div className="grid grid-cols-4 gap-2">
              {elements.map(el => (
                <button
                  key={el.type}
                  onClick={() => setLocalTheme({ ...localTheme, elementType: el.type })}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${localTheme.elementType === el.type ? 'bg-slate-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                  style={{ borderColor: localTheme.elementType === el.type ? localTheme.primaryColor : '#f1f5f9' }}
                >
                  <el.icon className="w-6 h-6" style={{ color: localTheme.elementType === el.type ? localTheme.primaryColor : '#94a3b8' }} />
                  <span className="text-[10px] font-bold text-slate-500">{el.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">*Hanya 2 elemen yang akan muncul & bertabrakan di tengah.</p>
          </div>

          {/* 3. Setting Warna Utama */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Palette className="w-4 h-4" /> Warna Aksen (Tombol & Teks)
            </label>
            <div className="flex flex-wrap gap-3">
              {primaryColors.map(color => (
                <button
                  key={color}
                  onClick={() => setLocalTheme({ ...localTheme, primaryColor: color })}
                  className={`w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 ${localTheme.primaryColor === color ? 'ring-4 ring-offset-2' : ''}`}
                  style={{ backgroundColor: color, ringColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 4. Setting Font */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Type className="w-4 h-4" /> Jenis Font (Google Fonts)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fonts.map(f => (
                <button
                  key={f.label}
                  onClick={() => setLocalTheme({ ...localTheme, fontFamily: f.value })}
                  className="py-2 px-3 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    fontFamily: f.value,
                    backgroundColor: localTheme.fontFamily === f.value ? localTheme.primaryColor : '#ffffff',
                    color: localTheme.fontFamily === f.value ? '#ffffff' : '#334155',
                    borderColor: localTheme.fontFamily === f.value ? localTheme.primaryColor : '#e2e8f0'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer / Tombol Apply */}
        <div className="p-6 border-t border-slate-100">
          <button
            onClick={handleApply}
            className="w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-all hover:opacity-90 hover:-translate-y-1"
            style={{ backgroundColor: localTheme.primaryColor }}
          >
            Terapkan Perubahan
          </button>
        </div>

      </div>
    </div>
  );
}


// export default ThemeSettingModal; 