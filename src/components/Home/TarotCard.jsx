import React, { useState, useEffect, useRef } from 'react';
import { publicApi } from '../../api/client';

const StarIcon = ({ color, size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5 C50 5 54 35 70 50 C54 65 50 95 50 95 C50 95 46 65 30 50 C46 35 50 5 50 5Z" fill={color} />
  </svg>
);

function TarotCard({ card, index, phase, selectedId, onClick }) {
  const isSelected = selectedId === card.id;
  const isOtherSelected = selectedId !== null && !isSelected;

  const CARD_WIDTH = 260;
  const CARD_HEIGHT = 380;

  let x = "-150vw";
  let y = "-50%";
  let rotZ = -45;
  let scale = 0.55;
  let zIdx = 10 + index;
  let opacity = 0;
  let rotY = 0;

  const offset = index - 2;

  if (phase === 1) {
    x = "-50%";
    y = "-50%";
    rotZ = offset * 12;
    opacity = 1;
  } else if (phase === 2) {
    x = `calc(-50% + ${offset * 95}px)`;
    y = `calc(-50% + ${Math.abs(offset) * 15}px)`;
    rotZ = offset * 7;
    opacity = 1;
  }

  if (isSelected) {
    x = "-50%";
    y = "-55%";
    rotZ = 0;
    rotY = 180;
    scale = 1;
    zIdx = 50;
  } else if (isOtherSelected) {
    y = "100%";
    rotZ = offset * 20;
    opacity = 0;
    scale = 0.4;
  }

  return (
    <div
      onClick={() => phase === 2 && onClick()}
      className="absolute top-1/2 left-1/2 cursor-pointer transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.35,1)] group"
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        transform: `translate(${x}, ${y}) rotateZ(${rotZ}deg) scale(${scale})`,
        zIndex: zIdx,
        opacity: opacity,
        transitionDelay: phase === 1 ? `${index * 120}ms` : '0ms',
      }}
    >
      <div
        className={`w-full h-full relative transition-all duration-[900ms] ease-[cubic-bezier(0.25,1,0.35,1)] rounded-3xl ${phase === 2 && !selectedId ? 'group-hover:-translate-y-12 group-hover:scale-105' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotY}deg)`,
          boxShadow: isSelected
            ? '0 40px 80px rgba(0,0,0,0.4)'
            : '0 15px 30px rgba(0,0,0,0.15)',
        }}
      >
        {/* BAGIAN DEPAN */}
        <div
          className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-3"
          style={{
            backgroundColor: card.color,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="w-full h-full rounded-2xl border-[3px] border-white/30 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-white/40"></div>
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-white/40"></div>
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-white/40"></div>
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-white/40"></div>
            <div className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <StarIcon color={card.starColor} size={70} />
            </div>
            <span className="absolute bottom-8 font-black tracking-widest text-lg" style={{ color: card.starColor, opacity: 0.8 }}>
              {card.label}
            </span>
          </div>
        </div>

        {/* BAGIAN BELAKANG */}
        <div
          className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-3 shadow-inner"
          style={{
            backgroundColor: card.color,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="w-full h-full rounded-2xl border-[3px] border-white/30 flex flex-col items-center justify-between px-6 py-10 relative">
            <div
              className="flex flex-col items-center justify-between h-full transition-opacity duration-700 w-full"
              style={{ opacity: isSelected ? 1 : 0, transitionDelay: isSelected ? '400ms' : '0ms' }}
            >
              <div className="text-center w-full">
                <StarIcon color={card.starColor} size={32} />
                <p className="text-xl font-black tracking-[0.2em] uppercase mt-4 mb-2 border-b-2 pb-4 w-full border-white/20" style={{ color: card.starColor }}>
                  {card.label}
                </p>
              </div>
              <p className="text-lg font-medium leading-relaxed my-auto text-center italic" style={{ color: card.starColor, opacity: 0.9 }}>
                {card.desc}
              </p>
              <div className="w-full text-center pt-4 border-t-2 border-white/20">
                <p className="text-sm font-bold px-4 py-3 rounded-xl bg-black/10 backdrop-blur-sm shadow-inner" style={{ color: card.starColor }}>
                  {card.stat}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== HELPER ==========
const getKelasFromNIS = (nis) => {
  if (!nis) return null;
  const prefix = nis.toString().trim().substring(0, 3);
  switch (prefix) {
    case '123': return '12';
    case '124': return '11';
    case '125': return '10';
    case '126': return '10';
    default:
      if (parseInt(prefix) < 123) return 'alumni';
      return null;
  }
};

// ========== KOMPONEN UTAMA ==========
export default function TarotCards() {
  const [selectedId, setSelectedId] = useState(null);
  const [phase, setPhase] = useState(0);
  const [cards, setCards] = useState([]);
  const sectionRef = useRef(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, pembimbingRes] = await Promise.all([
          publicApi.get('/member-rayons'),
          publicApi.get('/pembimbing-siswas'),
        ]);

        const members = membersRes.data.data || [];
        const pembimbing = pembimbingRes.data.data?.[0] || null;

        const counts = {
          '10': members.filter(m => getKelasFromNIS(m.nis) === '10').length,
          '11': members.filter(m => getKelasFromNIS(m.nis) === '11').length,
          '12': members.filter(m => getKelasFromNIS(m.nis) === '12').length,
        };

        const totalSiswa = counts['10'] + counts['11'] + counts['12'];

        setCards([
          { id: 4, color: '#E8A8B4', starColor: '#2E3D2A', label: 'Pembimbing Siswa', desc: '"guide who always got our back."', stat: pembimbing?.name || 'Belum ada data' },
          { id: 1, color: '#E8837A', starColor: '#F5ECD7', label: 'KELAS 10', desc: `"${counts['10']} fresh faces kicking off their journey."`, stat: `${counts['10']} Siswa` },
          { id: 2, color: '#A8C896', starColor: '#3B2A1A', label: 'KELAS 11', desc: `"${counts['11']} Learners Leveling Up"`, stat: `${counts['11']} Siswa` },
          { id: 3, color: '#A8D4DC', starColor: '#2A2D6E', label: 'KELAS 12', desc: '"seniors, eyes on the future"', stat: `${counts['12']} Siswa` },
          { id: 5, color: '#E8A060', starColor: '#F5F0E8', label: 'Jumlah Siswa', desc: `"More than ${totalSiswa} bright souls growing, learning, and vibing together."`, stat: `${totalSiswa} Siswa` },
        ]);
      } catch (err) {
        console.error('Gagal fetch:', err);
        // Fallback
        setCards([
          { id: 4, color: '#E8A8B4', starColor: '#2E3D2A', label: 'Pembimbing', desc: '"guide"', stat: '...' },
          { id: 1, color: '#E8837A', starColor: '#F5ECD7', label: 'KELAS 10', desc: '"fresh"', stat: '...' },
          { id: 2, color: '#A8C896', starColor: '#3B2A1A', label: 'KELAS 11', desc: '"leveling"', stat: '...' },
          { id: 3, color: '#A8D4DC', starColor: '#2A2D6E', label: 'KELAS 12', desc: '"seniors"', stat: '...' },
          { id: 5, color: '#E8A060', starColor: '#F5F0E8', label: 'Jumlah Siswa', desc: '"growing"', stat: '...' },
        ]);
      }
    };
    fetchData();
  }, []);

  // Auto start animation setelah cards ready
  useEffect(() => {
    if (cards.length > 0 && phase === 0) {
      const timer = setTimeout(() => {
        setPhase(1);
        setTimeout(() => setPhase(2), 800);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cards, phase]);

  const handleClick = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-20 overflow-hidden bg-gray-50/50"
    >
      {/* Title */}
      <div
        className="absolute top-16 sm:top-24 flex flex-col items-center gap-2 z-10 transition-all duration-700"
        style={{
          opacity: selectedId ? 0 : 1,
          transform: selectedId ? 'translateY(-20px)' : 'translateY(0)'
        }}
      >
        <h2 className="text-4xl sm:text-5xl font-black text-gray-800 tracking-tight drop-shadow-sm">
          Inside Wikrama 5
        </h2>
        <p className="text-gray-500 font-medium tracking-wide mt-2">
          Pilih salah satu kartu untuk mengungkap cerita
        </p>
      </div>

      {/* Cards Container */}
      <div className="relative w-full max-w-5xl h-[500px] mt-10" style={{ perspective: '1000px' }}>
        {cards.map((card, index) => (
          <TarotCard
            key={card.id}
            card={card}
            index={index}
            phase={phase}
            selectedId={selectedId}
            onClick={() => handleClick(card.id)}
          />
        ))}
      </div>

      {/* Close Button */}
      <div
        className="absolute bottom-10 transition-all duration-700 z-10"
        style={{
          opacity: selectedId ? 1 : 0,
          transform: selectedId ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
          pointerEvents: selectedId ? 'auto' : 'none'
        }}
      >
        <button
          onClick={() => setSelectedId(null)}
          className="px-8 py-3 bg-gray-900/90 backdrop-blur-md border border-white/20 text-white font-bold tracking-wide rounded-full shadow-2xl hover:bg-gray-800 hover:scale-105 transition-all duration-300"
        >
          Tutup Kartu
        </button>
      </div>
    </section>
  );
}