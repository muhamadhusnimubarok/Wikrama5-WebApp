import { useState, useEffect } from 'react';
import { publicApi } from '../../api/client';

// Icon mapping berdasarkan nama sosial media
const getIcon = (name) => {
  const lower = name.toLowerCase();
  
  if (lower.includes('instagram') || lower.includes('ig')) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    );
  }
  if (lower.includes('spotify')) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 11.5c3.5-1.5 8-1.5 10-.5"></path>
        <path d="M8 14.5c3-1 7-1 9-.5"></path>
        <path d="M9 17.5c2.5-.5 5-.5 7 0"></path>
      </svg>
    );
  }
  if (lower.includes('youtube') || lower.includes('yt')) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z"></path>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
      </svg>
    );
  }
  if (lower.includes('tiktok')) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
      </svg>
    );
  }
  // Default icon (globe/link)
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
};

export default function SocialRibbons() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialMedia = async () => {
      try {
        const res = await publicApi.get('/social-media');
        const data = res.data.data || [];
        
        const links = data.map(item => ({
          id: item.id,
          name: item.name?.toUpperCase() || 'SOCIAL',
          url: item.link || '#',
          icon: getIcon(item.name || ''),
        }));
        
        setSocialLinks(links.length > 0 ? links : [
          { id: 'instagram', name: 'INSTAGRAM', url: 'https://instagram.com', icon: getIcon('instagram') },
          { id: 'spotify', name: 'SPOTIFY', url: 'https://spotify.com', icon: getIcon('spotify') },
        ]);
      } catch (err) {
        console.error('Gagal fetch social media:', err);
        setSocialLinks([
          { id: 'instagram', name: 'INSTAGRAM', url: 'https://instagram.com', icon: getIcon('instagram') },
          { id: 'spotify', name: 'SPOTIFY', url: 'https://spotify.com', icon: getIcon('spotify') },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSocialMedia();
  }, []);

  if (loading) {
    return (
      <section className="relative w-full h-[30vh] min-h-[200px] overflow-hidden bg-transparent flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full"></div>
      </section>
    );
  }

  if (socialLinks.length === 0) return null;

  const ribbonItems = Array(8).fill(socialLinks).flat();

  const RibbonContent = ({ textColor, starColor }) => (
    <div className="flex items-center py-4">
      {ribbonItems.map((social, idx) => (
        <a
          key={idx}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-4 px-8 ${textColor} hover:scale-110 transition-transform duration-300`}
        >
          {social.icon}
          <span className="text-3xl font-black tracking-widest uppercase mt-1">
            {social.name}
          </span>
          <span className={`text-4xl mx-6 opacity-60 ${starColor}`}>
            ✦
          </span>
        </a>
      ))}
    </div>
  );

  return (
    <section className="relative w-full h-[50vh] min-h-[450px] overflow-hidden bg-transparent flex items-center justify-center py-20">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left 35s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 35s linear infinite;
        }
      `}</style>

      {/* RIBBON 1 - Tanpa shadow */}
      <div className="absolute w-[120vw] -left-[10vw] -rotate-3 bg-gray-900 border-y-4 border-gray-800 z-10">
        <div className="flex w-max animate-marquee-left hover:[animation-play-state:paused] cursor-pointer">
          <RibbonContent textColor="text-white" starColor="text-gray-500" />
          <RibbonContent textColor="text-white" starColor="text-gray-500" />
        </div>
      </div>

      {/* RIBBON 2 - Tanpa shadow */}
      <div className="absolute w-[120vw] -left-[10vw] rotate-6 bg-[#E8837A] border-y-4 border-[#d16c64] z-20">
        <div className="flex w-max animate-marquee-right hover:[animation-play-state:paused] cursor-pointer">
          <RibbonContent textColor="text-gray-900" starColor="text-white" />
          <RibbonContent textColor="text-gray-900" starColor="text-white" />
        </div>
      </div>
    </section>
  );
}