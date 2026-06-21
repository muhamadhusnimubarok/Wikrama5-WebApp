import { useState, useEffect } from 'react';
import { Phone, MapPin, Award, Contact } from 'lucide-react';
import { publicApi, BASE_URL } from '../api/client';

export default function PembimbingSiswa() {
  const [pembimbing, setPembimbing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPembimbing = async () => {
      try {
        const res = await publicApi.get('/pembimbing-siswas');
        const data = res.data.data;
        if (data && data.length > 0) {
          setPembimbing(data[0]);
        }
      } catch (err) {
        setError('Gagal memuat data pembimbing');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPembimbing();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Memuat data pembimbing...</p>
        </div>
      </div>
    );
  }

  if (error || !pembimbing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{error || 'Data pembimbing tidak tersedia'}</p>
        </div>
      </div>
    );
  }

  // Parse job_list
  const jobList = (() => {
    if (!pembimbing.job_list) return [];
    if (typeof pembimbing.job_list === 'string') {
      try {
        return JSON.parse(pembimbing.job_list);
      } catch {
        return pembimbing.job_list.split('\n').filter(item => item.trim() !== '');
      }
    }
    return pembimbing.job_list;
  })();

  return (
    <main className="w-full py-12 px-6 lg:px-8 bg-white min-h-screen font-sans">
      <div className="max-w-6xl mx-auto border border-gray-100 shadow-sm rounded-3xl p-6 sm:p-10 bg-white">
        
        {/* Layout Grid 2 Kolom Kiri & Kanan */}
        <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* ========== Kiri: Foto, Nama, Posisi & Kontak ========== */}
          <div className="md:col-span-4 flex flex-col items-center mt-4">
            
            {/* Wrapper Foto (Tanpa icon T figma) */}
            <div className="relative mb-6">
              <div className="w-56 h-56 rounded-full bg-gradient-to-b from-purple-500 to-purple-200 shadow-inner overflow-hidden flex items-end justify-center border-4 border-white">
                {pembimbing.foto_url ? (
                  <img
                    src={`${BASE_URL}${pembimbing.foto_url}`}
                    alt={pembimbing.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Award className="w-20 h-20 text-white opacity-50 mb-8" />
                )}
              </div>
            </div>

            {/* Nama & Posisi */}
            <h1 className="text-2xl font-bold text-gray-900 text-center tracking-tight">
              {pembimbing.name}
            </h1>
            <p className="text-sm text-gray-700 font-semibold uppercase tracking-widest text-center mt-1.5 mb-8">
              {pembimbing.position}
            </p>

            {/* Kontak WhatsApp */}
            {pembimbing.contack_wa && (
              <div className="flex items-center gap-4 border-t border-gray-100 pt-6 w-full justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <p className="text-sm italic text-gray-600 mb-0.5">Have any questions?</p>
                  <p className="text-base font-bold text-gray-900">
                    Hub : <a 
                            href={`https://wa.me/${pembimbing.contack_wa.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            {pembimbing.contack_wa}
                          </a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ========== Kanan: Deskripsi, Peran & Alamat ========== */}
          <div className="md:col-span-8 flex flex-col h-full">
            
            {/* Kotak Deskripsi dengan Pattern Wavy Ungu & Kaca Transparan */}
            <div 
              className="rounded-[2.5rem] p-6 sm:p-10 mb-8 shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: '#e9d5ff',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d8b4fe' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            >
              {/* Card Deskripsi Transparan (Glassmorphism) */}
              <div className="bg-white/60 backdrop-blur-md shadow-lg rounded-[2rem] p-6 sm:p-8 relative z-10 border border-white/40">
                <p className="text-base sm:text-lg text-gray-800 leading-relaxed text-justify font-medium">
                  {pembimbing.description || 'Deskripsi pembimbing belum tersedia.'}
                </p>
              </div>
            </div>

            {/* Row Bawah: Peran & Alamat */}
            <div className="grid sm:grid-cols-2 gap-8 px-2">
              
              {/* Kolom Peran/Job List */}
              <div className="flex items-start gap-4">
                <Contact className="w-8 h-8 text-black flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                    Peran dan Tugas
                  </h3>
                  {jobList.length > 0 ? (
                    <ul className="space-y-1">
                      {jobList.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">Tidak tersedia</p>
                  )}
                </div>
              </div>

              {/* Kolom Alamat */}
              <div className="flex items-start gap-4">
                <MapPin className="w-8 h-8 text-black flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 invisible">Alamat</h3>
                  <p className="text-sm text-gray-700 leading-relaxed -mt-6">
                    {pembimbing.address || 'Alamat tidak tersedia'}
                  </p>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}