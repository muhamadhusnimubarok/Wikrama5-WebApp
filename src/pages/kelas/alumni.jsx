import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, ArrowRight, Search, X } from 'lucide-react';
import { publicApi, BASE_URL } from '../../api/client';

export default function Alumni() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await publicApi.get('/member-rayons');
        const data = res.data.data || [];

        // Filter siswa kelas 10 (NIS prefix 125 atau 126)
        const getKelas = (tahunMasuk) => {
          if (!tahunMasuk) return null;
          const now = new Date();
          const tahunSekarang = now.getFullYear();
          const bulanSekarang = now.getMonth();
          let selisih = tahunSekarang - parseInt(tahunMasuk);
          if (bulanSekarang < 6) selisih -= 1;
          const kelas = selisih + 10;
          if (kelas > 12) return 'alumni';
          if (kelas >= 10 && kelas <= 12) return kelas.toString();
          return '10';
        };

        // Filter siswa kelas 10
        const alumni = data.filter(m => getKelas(m.tahun_masuk) === 'alumni');
        const formatted = alumni.map(m => ({
          id: m.id,
          name: m.name || 'Tanpa Nama',
          isVerified: true,
          quote: m.tempat_tanggal_lahir || 'Tempat, Tanggal Lahir',
          image: m.foto_url ? `${BASE_URL}${m.foto_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || '?')}&background=random&size=200`,
          socials: {
            instagram: m.instagram ? `https://instagram.com/${m.instagram.replace('@', '')}` : '#',
            linkedin: m.linkedin || '#',
            whatsapp: m.kontak_wa ? `https://wa.me/${m.kontak_wa.replace(/[^0-9]/g, '')}` : '#',
          },
          rombel: m.rombel || '-',
          nis: m.nis,
        }));

        setStudents(formatted);
        setFiltered(formatted);
      } catch (err) {
        console.error('Gagal fetch siswa:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(students);
    } else {
      const term = searchTerm.toLowerCase();
      setFiltered(students.filter(s =>
        s.name?.toLowerCase().includes(term) ||
        s.nis?.toLowerCase().includes(term) ||
        s.rombel?.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, students]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-[#F25C54] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="text-center mb-8 w-full max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Profil Alumni</h1>
        <p className="text-gray-500 text-base">Kenali lebih dekat teman-teman seperjuangan.</p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md mb-8 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama, NIS, atau rombel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hasil info */}
      {searchTerm && (
        <p className="text-sm text-gray-500 mb-6 -mt-4">
          {filtered.length} siswa ditemukan
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg">Tidak ada siswa ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="group relative w-full h-[420px] sm:h-[450px] rounded-[2rem] shadow-md hover:shadow-xl transition-all duration-500 bg-white border-4 border-white overflow-hidden"
            >
              {/* Foto */}
              <img
                src={student.image}
                alt={student.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                // loading="lazy"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&size=200`;
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-[60%] flex flex-col justify-end">
                <div
                  className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-white/10 backdrop-blur-md"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                    maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                  }}
                ></div>

                <div className="relative z-10 p-5 pt-10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h2 className="text-xl font-bold text-gray-900 drop-shadow-sm truncate">{student.name}</h2>
                    {student.isVerified && (
                      <BadgeCheck className="text-blue-500 w-5 h-5 fill-blue-100 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{student.rombel} • {student.nis}</p>
                  <p className="text-sm text-gray-700 italic font-medium leading-relaxed mb-4 line-clamp-2">
                    {student.quote}
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Sosial Media */}
                    <div className="flex gap-2">
                      <a href={student.socials.instagram} target="_blank" rel="noreferrer"
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                        </svg>
                      </a>
                      <a href={student.socials.linkedin} target="_blank" rel="noreferrer"
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                      </a>
                      <a href={student.socials.whatsapp} target="_blank" rel="noreferrer"
                        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                      </a>
                    </div>

                    {/* Tombol More */}
                    <button
                      onClick={() => navigate(`/siswa/${student.id}`)}
                      className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-black transition-all hover:scale-105 active:scale-95"
                    >
                      More <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}