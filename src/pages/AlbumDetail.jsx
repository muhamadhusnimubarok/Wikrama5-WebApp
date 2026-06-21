import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Images, X } from 'lucide-react';
import { publicApi, BASE_URL } from '../api/client';

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);
  const autoRotateRef = useRef(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await publicApi.get(`/gallery-albums/${id}`);
        const data = res.data.data;
        setAlbum({
          ...data,
          photos: (data.photos || []).map(p => ({
            id: p.id,
            src: `${BASE_URL}${p.image_url}`,
            caption: p.caption || data.title,
          })),
        });
      } catch (err) {
        console.error('Gagal fetch album:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  // Auto rotate
  useEffect(() => {
    const animate = () => {
      rotationRef.current.y += 0.15;
      if (containerRef.current) {
        containerRef.current.style.setProperty('--rot-y', `${rotationRef.current.y}deg`);
        containerRef.current.style.setProperty('--rot-x', `${rotationRef.current.x}deg`);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Mouse drag
  const handleMouseMove = (e) => {
    if (!isHovering || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 15;
    rotationRef.current.y += (x - rotationRef.current.y) * 0.1;
    rotationRef.current.x += (y - rotationRef.current.x) * 0.1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-[#F25C54] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!album) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Album tidak ditemukan</div>;
  }

  const photos = album.photos;
  const count = photos.length;

  // Generate positions on sphere
  const getSpherePosition = (index, total) => {
    const phi = Math.acos(-1 + (2 * index) / total); // Vertical angle
    const theta = Math.sqrt(total * Math.PI) * phi; // Horizontal angle
    return {
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.cos(phi),
      z: Math.sin(theta) * Math.sin(phi),
    };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/album')} className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-sm transition">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800">{album.title}</h1>
          </div>
          <span className="text-sm text-gray-400"><Images className="w-4 h-4 inline mr-1" />{count}</span>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap justify-center gap-2 text-xs text-gray-500">
          {album.event_date && (
            <span className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded-full">
              <Calendar className="w-3 h-3 text-[#F25C54]" />
              {new Date(album.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          {album.location && (
            <span className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded-full">
              <MapPin className="w-3 h-3 text-[#F25C54]" /> {album.location}
            </span>
          )}
        </div>
      </div>

      {/* Sphere Container */}
      <div
        ref={containerRef}
        className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gray-100"
        style={{
          perspective: '800px',
          ['--rot-y']: '0deg',
          ['--rot-x']: '0deg',
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-gray-400 bg-white/90 px-4 py-1.5 rounded-full shadow-sm z-10">
          🖱 Gerakkan mouse untuk memutar
        </div>

        {/* Sphere */}
        <div
          className="relative"
          style={{
            width: '500px',
            height: '500px',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(var(--rot-x)) rotateY(var(--rot-y))',
            transition: 'transform 0.1s linear',
          }}
        >
          {count === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Tidak ada foto
            </div>
          ) : (
            photos.map((photo, i) => {
              const pos = getSpherePosition(i, count);
              const radius = 250;
              const scale = 0.8 + (pos.z + 1) * 0.3;

              return (
                <div
                  key={photo.id || i}
                  className="absolute top-1/2 left-1/2 cursor-pointer"
                  style={{
                    width: '100px',
                    height: '130px',
                    transform: `
                      translate(-50%, -50%)
                      translate3d(${pos.x * radius}px, ${pos.y * radius}px, ${pos.z * radius}px)
                      scale(${scale})
                    `,
                    zIndex: Math.round(pos.z * 100 + 200),
                    opacity: pos.z < -0.3 ? 0.5 : 1,
                  }}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border-2 border-white bg-gray-300 hover:scale-110 transition-transform">
                    <img
                      src={photo.src}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="eager"
                      draggable={false}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setSelectedPhoto(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full z-10" onClick={() => setSelectedPhoto(null)}>
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedPhoto.src}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}