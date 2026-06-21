import { useEffect } from 'react';
import { createPortal } from 'react-dom'; // 1. Import createPortal
import { X } from 'lucide-react';

export default function ImagePreviewModal({ isOpen, onClose, imageSrc, imageTitle }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // 2. Bungkus isi modal ke dalam sebuah variabel
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(8px); }
        }
        @keyframes slideUp {
          from { transform: translateY(30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    
      <div 
        // Ubah flex menjadi flex-col agar elemen absolute tidak bertabrakan dengan konteks flex
        className="relative flex flex-col items-center justify-center w-auto max-w-[95vw] sm:max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Tombol Close - selalu di atas */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-all duration-200 hover:scale-110 z-10"
        >
          <X size={28} className="drop-shadow-md" />
        </button>

        {/* Gambar */}
        <img
          src={imageSrc}
          alt={imageTitle || 'Preview'}
          className="w-auto h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />

        {/* Judul - di bawah gambar */}
        {imageTitle && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full whitespace-nowrap max-w-[80vw] overflow-hidden shadow-lg border border-white/10">
            <p className="text-white font-medium text-sm md:text-base truncate">
              {imageTitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // 3. Render menggunakan Portal ke document.body
  return createPortal(modalContent, document.body);
}