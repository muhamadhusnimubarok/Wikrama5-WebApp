import { useState, useEffect, useRef } from 'react';
import { X, ChevronUp, FileText, Globe } from 'lucide-react';

// SVG Icons
const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const developers = [
  {
    name: 'Muhamad Husni Mubarok',
    role: 'Full Stack Developer',
    photo: '/images/dev/image/12309787.JPG',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    ringColor: 'ring-blue-400',
    socials: [
      {
        label: 'Instagram',
        url: 'https://www.instagram.com/mhusniim__/',
        icon: InstagramIcon,
        hoverColor: 'hover:text-pink-500',
      },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/',
        icon: LinkedinIcon,
        hoverColor: 'hover:text-blue-600',
      },
      {
        label: 'Website',
        url: 'https://porto2-0.vercel.app/',
        icon: Globe,
        hoverColor: 'hover:text-green-600',
      },
    ],
  },
  {
    name: 'Dyah Primi Paramitha',
    role: 'UI/UX Designer',
    photo: '/images/dev/image/12309613.JPG',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    ringColor: 'ring-purple-400',
    socials: [
      {
        label: 'Instagram',
        url: 'https://www.instagram.com/malborobluee/',
        icon: InstagramIcon,
        hoverColor: 'hover:text-pink-500',
      },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/dyahparamitha',
        icon: LinkedinIcon,
        hoverColor: 'hover:text-blue-600',
      },
      {
        label: 'Portfolio',
        url: '/images/dev/image/1000162701.jpg',
        icon: FileText,
        hoverColor: 'hover:text-red-500',
      },
    ],
  },
];
export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 }
    );

    if (footerRef.current) bottomObserver.observe(footerRef.current);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollTop + windowHeight >= documentHeight * 0.85) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      bottomObserver.disconnect();
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <div ref={footerRef} className="h-1" />

      <footer
        className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.35,1)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
      >
        {/* Developer Cards */}
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.25,1,0.35,1)] overflow-hidden ${isExpanded ? 'max-h-[600px] opacity-100 mb-0' : 'max-h-0 opacity-0 mb-0'
            }`}
        >
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Dibuat oleh
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {developers.map((dev, i) => (
                  <div
                    key={i}
                    className={`${dev.bgLight} border ${dev.borderColor} rounded-2xl p-5 animate-fadeIn`}
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    {/* Foto + Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={dev.photo}
                        alt={dev.name}
                        className={`w-14 h-14 rounded-full object-cover ring-2 ${dev.ringColor} ring-offset-2 shadow-md`}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="%23ddd"><rect width="56" height="56" rx="28"/><text x="28" y="36" text-anchor="middle" fill="%23999" font-size="24">?</text></svg>';
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{dev.name}</h4>
                        <p className={`text-xs font-medium ${dev.textColor}`}>{dev.role}</p>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {dev.socials.map((social, j) => {
                        const IconComponent = social.icon;
                        return (
                          <a
                            key={j}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs text-gray-600 ${social.hoverColor} hover:shadow-sm transition-all duration-200`}
                          >
                            {typeof IconComponent === 'function' ? (
                              <IconComponent />
                            ) : (
                              <Globe className="w-3.5 h-3.5" />
                            )}
                            {social.label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              © {currentYear} <span className="font-semibold text-gray-500">Wikrama 5</span>. All rights reserved.
            </p>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${isExpanded
                  ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  : 'bg-gradient-to-r from-[#F25C54] to-[#e04f47] text-white hover:shadow-lg hover:shadow-red-200 hover:-translate-y-0.5'
                }`}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Tutup
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  Lihat Developer
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* Spacer */}
      <div className={`transition-all duration-700 ${isVisible ? 'h-[100px]' : 'h-0'}`} />
    </>
  );
}