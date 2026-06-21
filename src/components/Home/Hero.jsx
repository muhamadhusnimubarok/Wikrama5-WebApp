import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { publicApi, BASE_URL } from '../../api/client';

function HeroSection() {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);
  const introRef = useRef(false);

  const accentColor = theme?.primaryColor || '#F59E0B';

  // Fetch data dari API
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const res = await publicApi.get('/banner-heroes');
        const data = res.data.data;
        if (data && data.length > 0) {
          // Simpan semua data banner
          const banners = data.map(item => ({
            id: item.id,
            judul_utama: item.judul_utama || 'WIKRAMA 5',
            deskripsi: item.deskripsi || '',
            tagline_kuning: item.tagline_kuning || 'Menjadi Tauladan!',
            banner_url: item.banner_url ? `${BASE_URL}${item.banner_url}` : null,
          }));

          setHeroData(banners);
        }
      } catch (err) {
        console.error('Gagal fetch banner:', err);
        setHeroData([
          {
            id: 1,
            judul_utama: "WIKRAMA 5",
            deskripsi: "Kami adalah rayon dengan ciri khas unik. Meski jarak menuju SMK Wikrama terbilang jauh, semangat dan dedikasi kami selalu dekat. Bersama, kami tumbuh, belajar, dan berjuang meraih masa depan yang lebih gemilang.",
            tagline_kuning: "Menjadi Tauladan!",
            banner_url: "/images/banner1.jpeg",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  // Intro Slider
  useEffect(() => {
    if (loading || !heroData || introRef.current) return;
    introRef.current = true;

    const total = heroData.length;
    if (total <= 1) return;

    let index = 0;
    const introInterval = setInterval(() => {
      index++;
      if (index < total) {
        setCurrentSlide(index);
      } else {
        clearInterval(introInterval);
        setTimeout(() => setCurrentSlide(0), 400);
      }
    }, 320);

    return () => clearInterval(introInterval);
  }, [loading, heroData]);

  // Auto Play
  useEffect(() => {
    if (!heroData) return;
    const total = heroData.length;
    if (total <= 1) return;

    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 4200);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [heroData]);

  if (loading) {
    return (
      <section className="min-h-[80vh] sm:min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#F25C54] border-t-transparent rounded-full"></div>
      </section>
    );
  }

  if (!heroData || heroData.length === 0) return null;

  const total = heroData.length;
  const currentBanner = heroData?.[currentSlide] ?? heroData?.[0];

  if (!currentBanner) return null;
  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const nextSlide = () => {
    if (isTransitioning || total <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % total);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const prevSlide = () => {
    if (isTransitioning || total <= 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + total) % total);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  return (
    <section
      className="min-h-[80vh] sm:min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 bg-transparent"
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* TEXT CONTENT - Berubah sesuai slide aktif */}
      <div className="text-center max-w-2xl mt-2 sm:mt-4 mb-6 sm:mb-8 z-10 transition-all duration-500">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-2px] sm:tracking-[-2.5px] leading-none mb-3 sm:mb-5 text-slate-900 transition-all duration-500 animate-fadeIn"
          style={{ fontFamily: theme.fontFamily }}
          key={currentBanner.id + '-title'}
        >
          Wikrama{" "}
          <span style={{ color: accentColor }}>5</span>
        </h1>

        <p
          className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto font-medium px-2 sm:px-0 transition-all duration-500 animate-fadeIn"
          style={{ fontFamily: theme.fontFamily }}
          key={currentBanner.id + '-desc'}
        >
          {currentBanner.deskripsi}
        </p>
      </div>

      {/* SLIDER */}
      <div className="w-[95%] sm:w-[96%] max-w-7xl flex flex-col items-center gap-4 sm:gap-5 relative z-10">
        <div className="relative w-full" style={{ paddingBottom: '50%' }}>
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-black/30">
            <div
              ref={sliderRef}
              className="relative w-full h-full flex transition-transform duration-800 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroData.map((banner, index) => (
                <div key={banner.id} className="min-w-full h-full relative flex-shrink-0">
                  <img
                    src={banner.banner_url}
                    alt={banner.judul_utama}
                    className="w-full h-full object-cover"
                    loading={index === 0 }
                  />
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            {total > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 backdrop-blur-md border border-white shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 backdrop-blur-md border border-white shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Tagline - Berubah sesuai slide aktif */}
          <div
            className="absolute z-30 transition-all duration-500 ease-out"
            style={{
              bottom: '-16px',
              right: '-10px',
              transform: 'rotate(-6deg)',
              transformOrigin: 'bottom right',
              fontFamily: theme.fontFamily
            }}
            key={currentBanner.id + '-tagline'}
          >
            <span
              className="inline-block text-sm sm:text-base md:text-lg font-extrabold px-7 py-3.5 rounded-2xl whitespace-nowrap text-slate-900 shadow-xl border border-white/70 animate-scaleIn"
              style={{ backgroundColor: accentColor }}
            >
              "{currentBanner.tagline_kuning}"
            </span>
          </div>
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
            {heroData.map((banner, i) => (
              <button
                key={banner.id}
                onClick={() => goToSlide(i)}
                className="transition-all duration-300 hover:scale-110"
                style={{
                  width: i === currentSlide ? '24px' : '7px',
                  height: '7px',
                  borderRadius: i === currentSlide ? '9999px' : '50%',
                  backgroundColor: i === currentSlide ? accentColor : '#e5e7eb',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;