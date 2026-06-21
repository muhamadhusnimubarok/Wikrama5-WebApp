import { useEffect, useRef, useState } from 'react';
import { publicApi, BASE_URL } from '../../api/client';

export default function CircularGallery({
  items: propItems, // Bisa dari props (fallback)
  onImageClick,
  autoScrollSpeed = 3000
}) {
  const containerRef = useRef(null);
  const [items, setItems] = useState(propItems || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const autoScrollRef = useRef(null);

  // Fetch random photos dari API
  useEffect(() => {
    const fetchRandomPhotos = async () => {
      try {
        const res = await publicApi.get('/gallery-albums');
        const albums = res.data.data || [];

        // Kumpulkan semua foto dari semua album
        const allPhotos = [];
        albums.forEach(album => {
          (album.photos || []).forEach(photo => {
            allPhotos.push({
              image: `${BASE_URL}${photo.image_url}`,
              text: album.title,
            });
          });
        });

        // Acak dan ambil maks 15 foto
        const shuffled = allPhotos.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 15);

        if (selected.length > 0) {
          setItems(selected);
        }
        // Kalau kosong, tetap pakai items dari props
      } catch (err) {
        console.error('Gagal fetch random photos:', err);
        // Tetap pakai items dari props sebagai fallback
      }
    };

    // Hanya fetch kalau tidak ada props items
    if (!propItems || propItems.length === 0) {
      fetchRandomPhotos();
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    if (!items.length) return;

    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        if (!isDragging && containerRef.current) {
          const container = containerRef.current;
          const cardWidth = container.children[0]?.offsetWidth || 280;
          const gap = 16;
          const scrollAmount = cardWidth + gap;
          const nextIndex = (currentIndex + 1) % items.length;
          setCurrentIndex(nextIndex);
          container.scrollTo({
            left: nextIndex * scrollAmount,
            behavior: 'smooth'
          });
        }
      }, autoScrollSpeed);
    };

    startAutoScroll();
    return () => { if (autoScrollRef.current) clearInterval(autoScrollRef.current); };
  }, [items.length, isDragging, currentIndex, autoScrollSpeed]);

  const resetAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      if (!isDragging && containerRef.current) {
        const container = containerRef.current;
        const cardWidth = container.children[0]?.offsetWidth || 280;
        const gap = 16;
        const scrollAmount = cardWidth + gap;
        const nextIndex = (currentIndex + 1) % items.length;
        setCurrentIndex(nextIndex);
        container.scrollTo({ left: nextIndex * scrollAmount, behavior: 'smooth' });
      }
    }, autoScrollSpeed);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;

    const container = containerRef.current;
    const cardWidth = container.children[0]?.offsetWidth || 280;
    const gap = 16;
    const scrollAmount = cardWidth + gap;
    const newIndex = Math.round(container.scrollLeft / scrollAmount);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(resetAutoScroll, 3000);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(resetAutoScroll, 3000);
  };

  const scrollToIndex = (index) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const cardWidth = container.children[0]?.offsetWidth || 280;
    const gap = 16;
    const scrollAmount = cardWidth + gap;
    setCurrentIndex(index);
    container.scrollTo({ left: index * scrollAmount, behavior: 'smooth' });
    resetAutoScroll();
  };

  if (!items || items.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex overflow-x-scroll scroll-smooth snap-x snap-mandatory gap-4 p-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <style>{`.flex::-webkit-scrollbar { display: none; }`}</style>

        {items.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 snap-center w-[280px] sm:w-[320px] md:w-[400px]"
            onClick={() => onImageClick?.(item.image, item.text)}
          >
            <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 ease-out bg-gray-200 group">
              {/* Overlay gelap saat hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 z-10 transition-all duration-500 ease-out pointer-events-none" />

              <img
                src={item.image}
                alt={item.text || `Image ${index + 1}`}
                className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover group-hover:scale-110 transition-transform duration-700 ease-out cursor-pointer"
                loading="eager"
              />

              {/* Label - muncul dari bawah saat hover */}
              <div className="absolute bottom-0 left-0 right-0 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
                <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-8">
                  <p className="text-white font-semibold text-sm sm:text-base">{item.text}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={() => scrollToIndex(currentIndex > 0 ? currentIndex - 1 : items.length - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2.5 z-10 transition-all hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollToIndex((currentIndex + 1) % items.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2.5 z-10 transition-all hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              className={`rounded-full transition-all duration-300 ${index === currentIndex ? 'w-7 h-2 bg-[#F25C54]' : 'w-2 h-2 bg-gray-300'
                }`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}