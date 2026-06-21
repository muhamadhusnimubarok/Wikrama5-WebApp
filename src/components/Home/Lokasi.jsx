import { MapPin, Navigation } from 'lucide-react';

export default function Lokasi() {
  return (
    <section className="py-12 sm:py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-1.5 rounded-full text-sm mb-4">
            <MapPin className="w-4 h-4 text-[#F25C54]" />
            <span className="text-[#F25C54] font-medium">Lokasi Kami</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
            Kunjungi SMK Wikrama Bogor
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            Temukan kami di lokasi strategis di Kota Bogor
          </p>
        </div>

        {/* Map + Info */}
        <div className="grid md:grid-cols-3 gap-4">
          
          {/* Map */}
          <div className="md:col-span-2 rounded-2xl overflow-hidden border border-gray-200 h-[280px] sm:h-[350px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.408080445123!2d106.8137740749945!3d-6.594994793411209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c5b7e0a8b8c7%3A0x4b0c0c0c0c0c0c0c!2sSMK%20Wikrama%20Bogor!5e0!3m2!1sid!2sid!4v1680000000000!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi SMK Wikrama Bogor"
            />
          </div>

          {/* Info */}
          <div className="space-y-3">
            {/* Alamat */}
            <div className="bg-gray-50 rounded-xl p-4">
              <MapPin className="w-5 h-5 text-[#F25C54] mb-2" />
              <h3 className="font-bold text-gray-800 text-sm mb-1">Alamat</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Jl. Raya Wangun No.21, Sindangsari, Bogor Timur, Kota Bogor, Jawa Barat 16146
              </p>
            </div>

            {/* Navigasi */}
            <div className="bg-gray-50 rounded-xl p-4">
              <Navigation className="w-5 h-5 text-blue-500 mb-2" />
              <h3 className="font-bold text-gray-800 text-sm mb-1">Navigasi</h3>
              <a
                href="https://maps.app.goo.gl/3gXbX4QqQqQqQqQq9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Buka di Google Maps
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-[#F25C54] to-[#e04f47] rounded-xl p-4 text-white text-center">
              <p className="text-2xl font-black">SMK Wikrama</p>
              <p className="text-xs opacity-90 mt-1">Bogor, Jawa Barat</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}