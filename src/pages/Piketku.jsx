import { Wrench } from 'lucide-react';

export default function Piketku() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center animate-fadeIn">
        {/* Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-2">
          Under Maintenance
        </h1>
        
        {/* Description */}
        <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Halaman jadwal piket sedang dalam pengembangan. 
          Silakan kembali lagi nanti.
        </p>
        
        {/* Optional: Info tambahan */}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-sm text-yellow-700">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          Segera hadir
        </div>
      </div>
    </main>
  );
}