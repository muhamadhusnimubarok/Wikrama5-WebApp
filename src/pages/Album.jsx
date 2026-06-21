import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, Search, MapPin, Calendar, Images, Camera, Quote } from 'lucide-react';
import { publicApi, BASE_URL } from '../api/client';

export default function Album() {
  const [albums, setAlbums] = useState([]);
  const [quotes, setQuotes] = useState([]); // Quotes per tahun
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearStates, setYearStates] = useState({});
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState({}); // per tahun
  const autoSwipeRef = useRef(null);
  const quoteIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumsRes, quotesRes] = await Promise.all([
          publicApi.get('/gallery-albums'),
          publicApi.get('/quotes'),
        ]);

        const data = albumsRes.data.data || [];
        const quotesData = quotesRes.data.data || [];

        // Group quotes by year
        const quotesByYear = {};
        quotesData.forEach(q => {
          const y = q.year || 'all';
          if (!quotesByYear[y]) quotesByYear[y] = [];
          quotesByYear[y].push(q);
        });
        setQuotes(quotesByYear);

        // Transform albums
        const transformed = data.map((album, index) => ({
          id: album.id,
          title: album.title || 'Album Kenangan',
          date: album.event_date
            ? new Date(album.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : '',
          year: album.event_date
            ? new Date(album.event_date).getFullYear()
            : album.created_at ? new Date(album.created_at).getFullYear() : new Date().getFullYear(),
          eventDate: album.event_date || album.created_at,
          location: album.location || '',
          description: album.description || '',
          category: album.category || 'Kegiatan',
          photoCount: album.photo_count || 0,
          photos: (album.photos || []).map(p => ({
            id: p.id,
            url: `${BASE_URL}${p.image_url}`,
            caption: p.caption || '',
          })),
          bgColor: [
            'from-blue-50 via-sky-100 to-blue-50',
            'from-pink-50 via-rose-100 to-pink-50',
            'from-amber-50 via-yellow-100 to-amber-50',
            'from-green-50 via-emerald-100 to-green-50',
            'from-purple-50 via-violet-100 to-purple-50',
          ][index % 5],
        }));

        transformed.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        setAlbums(transformed);

        const initStates = {};
        transformed.forEach(a => {
          if (!initStates[a.year]) initStates[a.year] = { currentIndex: 0, currentPhotoIndex: 0 };
        });
        setYearStates(initStates);
      } catch (err) {
        console.error('Gagal fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-swipe kartu per tahun
  useEffect(() => {
    if (Object.keys(yearStates).length === 0) return;

    autoSwipeRef.current = setInterval(() => {
      setYearStates(prev => {
        const newStates = { ...prev };
        Object.keys(newStates).forEach(year => {
          const yearAlbums = groupedByYear[year];
          if (yearAlbums && yearAlbums.length > 1) {
            newStates[year] = {
              ...newStates[year],
              currentIndex: (newStates[year].currentIndex + 1) % yearAlbums.length,
              currentPhotoIndex: 0,
            };
          }
        });
        return newStates;
      });
    }, 4500);

    return () => clearInterval(autoSwipeRef.current);
  }, [yearStates]);

  // Auto-swipe quotes per tahun
  useEffect(() => {
    quoteIntervalRef.current = setInterval(() => {
      setCurrentQuoteIndex(prev => {
        const newIdx = { ...prev };
        Object.keys(groupedByYear).forEach(year => {
          const yearQuotes = quotes[year] || quotes['all'] || [];
          if (yearQuotes.length > 1) {
            newIdx[year] = ((prev[year] || 0) + 1) % yearQuotes.length;
          }
        });
        return newIdx;
      });
    }, 6000);

    return () => clearInterval(quoteIntervalRef.current);
  }, [quotes]);

  // Filter & Group
  const filtered = albums.filter(a =>
    !searchTerm ||
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByYear = {};
  filtered.forEach(a => {
    const y = a.year || 'Lainnya';
    if (!groupedByYear[y]) groupedByYear[y] = [];
    groupedByYear[y].push(a);
  });

  const years = Object.keys(groupedByYear).sort((a, b) => b - a);

  // Stats
  const totalPhotos = filtered.reduce((sum, a) => sum + a.photoCount, 0);
  const totalAlbums = filtered.length;
  const totalYears = years.length;

  // Handlers
  const handleDragEnd = (year, info) => {
    const yearAlbums = groupedByYear[year];
    if (!yearAlbums || yearAlbums.length <= 1) return;
    const threshold = 60;
    const current = yearStates[year]?.currentIndex || 0;

    if (info.offset.x > threshold) {
      setYearStates(prev => ({
        ...prev,
        [year]: { ...prev[year], currentIndex: (current + 1) % yearAlbums.length, currentPhotoIndex: 0 }
      }));
    } else if (info.offset.x < -threshold) {
      setYearStates(prev => ({
        ...prev,
        [year]: { ...prev[year], currentIndex: (current - 1 + yearAlbums.length) % yearAlbums.length, currentPhotoIndex: 0 }
      }));
    }
  };

  const nextPhoto = (e, year, total) => {
    e.stopPropagation();
    setYearStates(prev => ({ ...prev, [year]: { ...prev[year], currentPhotoIndex: (prev[year].currentPhotoIndex + 1) % total } }));
  };

  const prevPhoto = (e, year, total) => {
    e.stopPropagation();
    setYearStates(prev => ({ ...prev, [year]: { ...prev[year], currentPhotoIndex: (prev[year].currentPhotoIndex - 1 + total) % total } }));
  };

  const goToDetail = (albumId) => navigate(`/album/${albumId}`);

  const getQuoteForYear = (year) => {
    const yearQuotes = quotes[year] || quotes['all'] || [];
    if (yearQuotes.length === 0) return null;
    const idx = currentQuoteIndex[year] || 0;
    return yearQuotes[idx % yearQuotes.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-[#F25C54] border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Memuat album kenangan...</p>
        </div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-gray-400"><p className="text-6xl mb-4">📸</p><p className="text-lg">Belum ada album kenangan</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-teal-100/50 to-transparent z-0"></div>
      <div className="absolute top-20 -left-20 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-40 z-0"></div>
      <div className="absolute top-40 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 z-0"></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-30 z-0"></div>

      <div className="relative z-10 p-6 sm:p-10 font-sans max-w-6xl mx-auto">
        {/* Pengantar */}
        <div className="text-center mt-6 sm:mt-10 mb-6 px-4 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-3">Album Kenangan</h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Kumpulan momen penuh cerita, tawa, dan perjuangan.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 animate-slideUp">
          {[
            { icon: Images, label: 'Album', value: totalAlbums, color: 'bg-red-50 text-red-600' },
            { icon: Camera, label: 'Foto', value: totalPhotos, color: 'bg-blue-50 text-blue-600' },
            { icon: Calendar, label: 'Tahun', value: totalYears, color: 'bg-green-50 text-green-600' },
          ].map((stat, i) => (
            <div key={i} className={`flex items-center gap-3 px-5 py-3 ${stat.color} rounded-2xl shadow-sm`}>
              <stat.icon className="w-5 h-5" />
              <div><p className="text-2xl font-black">{stat.value}</p><p className="text-xs font-medium">{stat.label}</p></div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex justify-center mb-10 animate-fadeIn">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari judul album..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-white rounded-full text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition shadow-sm" />
          </div>
        </div>

        {/* Section per Tahun */}
        {years.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Tidak ada album ditemukan</div>
        ) : (
          years.map((year) => {
            const yearAlbums = groupedByYear[year];
            const state = yearStates[year] || { currentIndex: 0, currentPhotoIndex: 0 };
            const quote = getQuoteForYear(year);

            return (
              <div key={year} className="mb-20 sm:mb-24">
                {/* Header Tahun */}
                <div className="flex items-center gap-4 mb-6 px-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{yearAlbums.length} Album</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-800">{year}</h2>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>

                {/* Quotes Ribbon Berjalan */}
                {quote && (
                  <div className="relative w-full overflow-hidden mb-8 py-3">
                    {/* Gradient fade kiri & kanan */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

                    <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                      {/* Duplicate 3x biar mulus */}
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-8 px-6">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${year}-quote-${currentQuoteIndex[year] || 0}-${i}`}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.5 }}
                              className="flex items-center gap-6"
                            >
                              {/* Quote + Author dalam 1 block */}
                              <div className="flex flex-col items-start gap-2 bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-sm border border-gray-100">
                                <div className="flex items-start gap-3">
                                  <Quote className="w-5 h-5 text-[#F25C54] opacity-60 flex-shrink-0 mt-0.5" />
                                  <p
                                    className="text-sm sm:text-base text-gray-600 italic leading-relaxed"
                                    style={{
                                      display: '-webkit-box',
                                      WebkitBoxOrient: 'vertical',
                                      WebkitLineClamp: 3,
                                      overflow: 'hidden',
                                      maxWidth: '800px',
                                    }}
                                  >
                                    "{quote.quote}"
                                  </p>
                                </div>

                                {/* Author di bawah */}
                                <div className="flex items-center gap-2 self-end pr-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#F25C54]"></div>
                                  <span className="text-xs font-semibold text-[#F25C54]">{quote.author}</span>
                                  {quote.position && (
                                    <>
                                      <span className="text-gray-300 text-xs">•</span>
                                      <span className="text-xs text-gray-400">{quote.position}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Separator */}
                              <span className="text-2xl text-gray-300 flex-shrink-0">✦</span>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>

                    {/* CSS Marquee */}
                    <style>{`
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
      }
      .animate-marquee {
        animation: marquee 40s linear infinite;
      }
    `}</style>
                  </div>
                )}
                {/* Stack Kartu - LEBIH BESAR */}
                <div className="relative h-[620px] sm:h-[720px] w-full flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    {yearAlbums.map((memory, index) => {
                      const offset = (index - state.currentIndex + yearAlbums.length) % yearAlbums.length;
                      const isFront = offset === 0;
                      const totalPhotos = memory.photos.length || 1;
                      const currentPhoto = memory.photos[state.currentPhotoIndex % totalPhotos];

                      return (
                        <motion.div
                          key={memory.id}
                          drag={isFront ? "x" : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.8}
                          onDragEnd={isFront ? (e, info) => handleDragEnd(year, info) : undefined}
                          animate={{
                            scale: 1 - offset * 0.06,
                            y: offset * -25,
                            x: offset * 8,
                            zIndex: yearAlbums.length - offset,
                            opacity: 1 - offset * 0.25,
                          }}
                          transition={{ type: "spring", stiffness: 250, damping: 20 }}
                          style={{
                            position: 'absolute',
                            width: 'min(500px, 92vw)', // ⬅️ LEBIH BESAR
                            cursor: isFront ? 'grab' : 'auto',
                          }}
                          whileDrag={{
                            cursor: 'grabbing',
                            scale: 1.03,
                            rotate: (info) => (info.offset.x > 0 ? 3 : -3),
                          }}
                          className={`bg-white rounded-3xl shadow-xl p-5 sm:p-6 border border-white/80 bg-gradient-to-br ${memory.bgColor} backdrop-blur-sm`}
                        >
                          {/* SLIDER FOTO - LEBIH BESAR */}
                          <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-4 shadow-inner border-4 border-white group">
                            <AnimatePresence mode="wait">
                              <motion.img
                                key={`${memory.id}-photo-${state.currentPhotoIndex}`}
                                src={currentPhoto?.url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop'}
                                alt=""
                                className="w-full h-full object-cover"
                                draggable="false"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.25 }}
                              />
                            </AnimatePresence>

                            <div className="absolute top-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full">{memory.category}</div>
                            <div className="absolute top-3 right-3 px-3 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full">{state.currentPhotoIndex + 1}/{totalPhotos}</div>

                            {currentPhoto?.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent text-white text-sm p-3">{currentPhoto.caption}</div>
                            )}

                            {totalPhotos > 1 && isFront && (
                              <>
                                <button onClick={(e) => prevPhoto(e, year, totalPhotos)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                                </button>
                                <button onClick={(e) => nextPhoto(e, year, totalPhotos)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                                  <ChevronRight className="w-5 h-5 text-gray-700" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* Dots */}
                          {totalPhotos > 1 && (
                            <div className="flex items-center justify-center gap-2 mb-4">
                              {memory.photos.map((_, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); setYearStates(prev => ({ ...prev, [year]: { ...prev[year], currentPhotoIndex: i } })); }}
                                  className={`transition-all rounded-full ${i === (state.currentPhotoIndex % totalPhotos) ? 'w-6 h-2 bg-[#F25C54]' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
                              ))}
                            </div>
                          )}

                          {/* Info */}
                          <div className="space-y-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight line-clamp-1">{memory.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                              {memory.date && (
                                <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg">
                                  <Calendar className="w-4 h-4" /> {memory.date}
                                </span>
                              )}
                              {(memory.location || memory.category) && (
                                <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg">
                                  <MapPin className="w-4 h-4" /> {memory.location || memory.category}
                                </span>
                              )}
                            </div>
                            {memory.description && (
                              <p className="text-sm sm:text-base text-gray-600 italic line-clamp-2 leading-relaxed">"{memory.description}"</p>
                            )}

                            {isFront && (
                              <div className="flex justify-end pt-3">
                                <button onClick={(e) => { e.stopPropagation(); goToDetail(memory.id); }}
                                  className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm sm:text-base font-semibold transition-all shadow-md hover:shadow-lg active:scale-95">
                                  <Eye className="w-5 h-5" /> Lihat Kenangan
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                  💡 Geser kartu atau tunggu auto-swipe • {yearAlbums.length} album di tahun {year}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}