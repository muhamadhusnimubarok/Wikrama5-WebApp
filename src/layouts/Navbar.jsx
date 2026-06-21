import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

function Navbar() {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isKelasDropdownOpen, setIsKelasDropdownOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className="sticky top-4 z-50 w-[96%] max-w-7xl mx-auto bg-white/60 backdrop-blur-lg border border-white shadow-md rounded-full px-4 py-3 md:px-6 lg:px-8 md:py-4 flex items-center justify-between transition-all duration-500">
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <img
          src="/logo1.png"
          alt="Logo Wikrama 5"
          className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain transition-transform duration-500 hover:scale-105"
        />
        <span className="font-extrabold text-lg md:text-2xl lg:text-3xl text-slate-800 tracking-tight hidden sm:block transition-colors duration-500">
          Wikrama{" "}<span style={{ color: theme.primaryColor }}>5</span>
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm xl:text-base font-bold">
        <Link
          to="/"
          className="px-4 xl:px-6 py-2 xl:py-2.5 rounded-full border border-transparent hover:bg-white hover:border-red-500 hover:text-slate-900 transition-all duration-500 ease-out hover:-translate-y-0.5 whitespace-nowrap"
          style={{ color: theme.primaryColor }}
        >
          DASHBOARD
        </Link>
        <Link
          to="/pembimbing-siswa"
          className="px-4 xl:px-6 py-2 xl:py-2.5 rounded-full border border-transparent hover:bg-white hover:border-red-500 hover:text-slate-900 transition-all duration-500 ease-out hover:-translate-y-0.5 whitespace-nowrap"
          style={{ color: theme.primaryColor }}
        >
          PEMBIMBING SISWA
        </Link>

        <Link
          to="/piketku"
          className="px-4 xl:px-6 py-2 xl:py-2.5 rounded-full border border-transparent hover:bg-white hover:border-red-500 hover:text-slate-900 transition-all duration-500 ease-out hover:-translate-y-0.5 whitespace-nowrap"
          style={{ color: theme.primaryColor }}
        >
          PIKETKU
        </Link>

        <Link
          to="/album"
          className="px-4 xl:px-6 py-2 xl:py-2.5 rounded-full border border-transparent hover:bg-white hover:border-red-500 hover:text-slate-900 transition-all duration-500 ease-out hover:-translate-y-0.5 whitespace-nowrap"
          style={{ color: theme.primaryColor }}
        >
          ALBUM
        </Link>

        <div
          className="relative"
          onMouseEnter={() => setIsKelasDropdownOpen(true)}
          onMouseLeave={() => setIsKelasDropdownOpen(false)}
        >
          <button
            className="px-4 xl:px-6 py-2 xl:py-2.5 rounded-full border border-transparent hover:bg-white hover:border-red-500 hover:text-slate-900 transition-all duration-500 ease-out hover:-translate-y-0.5 flex items-center gap-1 whitespace-nowrap"
            style={{ color: theme.primaryColor }}
          >
            KELAS
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 xl:h-4 xl:w-4 transition-transform duration-300 ${isKelasDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.primaryColor }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isKelasDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-lg border border-white rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2">
              <Link to="/kelas/10" className="block px-5 py-3 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl mx-1" style={{ color: theme.primaryColor }}>
                Kelas 10
              </Link>
              <Link to="/kelas/11" className="block px-5 py-3 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl mx-1" style={{ color: theme.primaryColor }}>
                Kelas 11
              </Link>
              <Link to="/kelas/12" className="block px-5 py-3 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl mx-1" style={{ color: theme.primaryColor }}>
                Kelas 12
              </Link>
              <Link to="/alumni" className="block px-5 py-3 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-xl mx-1 border-t border-slate-100 pt-3" style={{ color: theme.primaryColor }}>
                Alumni
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <Link
          to="/admin/login"
          className="hidden md:block px-6 lg:px-8 py-2.5 lg:py-3 text-white font-extrabold rounded-full border-2 border-black shadow-md transition-all duration-500 ease-out hover:-translate-y-0.5 active:scale-95 text-sm lg:text-base whitespace-nowrap"
          style={{ backgroundColor: '#F25C54' }}
        >
          Login
        </Link>

        <button
          className="lg:hidden p-2 text-slate-800 hover:bg-white rounded-full transition-all duration-500 focus:outline-none border border-transparent hover:border-red-500"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-500">
            <path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-lg border border-white rounded-2xl p-4 shadow-xl flex flex-col gap-2 lg:hidden transition-all duration-500 origin-top animate-in fade-in slide-in-from-top-4 max-h-[80vh] overflow-y-auto">
          <Link to="/" className="px-5 py-3 rounded-xl bg-white shadow-sm border border-red-500 transition-all duration-500" style={{ color: theme.primaryColor, fontWeight: 'bold' }}>
            DASHBOARD
          </Link>
          <Link to="/pembimbing-siswa" className="px-5 py-3 rounded-xl border border-transparent hover:bg-white hover:border-red-500 hover:text-slate-900 transition-all duration-500" style={{ color: theme.primaryColor, fontWeight: 'bold' }}>
            PEMBIMBING SISWA
          </Link>
          <Link to="/piketku" className="px-5 py-3 rounded-xl border border-transparent hover:bg-white hover:border-red-500 hover:text-slate-900 transition-all duration-500" style={{ color: theme.primaryColor, fontWeight: 'bold' }}>
            PIKETKU
          </Link>
          <Link to="/album" className="px-5 py-3 rounded-xl border border-transparent hover:bg-white hover:border-red-500 hover:text-slate-900 transition-all duration-500" style={{ color: theme.primaryColor, fontWeight: 'bold' }}>
            ALBUM
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setIsKelasDropdownOpen(true)}
            onMouseLeave={() => setIsKelasDropdownOpen(false)}
          >
            <button
              className="px-4 xl:px-6 py-2 xl:py-2.5 rounded-full border border-transparent hover:bg-white hover:border-red-500 hover:text-slate-900 transition-all duration-500 ease-out hover:-translate-y-0.5 flex items-center gap-1 whitespace-nowrap font-bold"
              style={{ color: theme.primaryColor }}
            >
              KELAS
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 xl:h-4 xl:w-4 transition-transform duration-300 ${isKelasDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.primaryColor }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isKelasDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white/95 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 z-50">
                <Link to="/kelas/10" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl mx-1 transition-all duration-300 group">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">10</span>
                  <span className="font-semibold text-gray-700 group-hover:text-red-600 text-sm">Kelas 10</span>
                </Link>
                <Link to="/kelas/11" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl mx-1 transition-all duration-300 group">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">11</span>
                  <span className="font-semibold text-gray-700 group-hover:text-red-600 text-sm">Kelas 11</span>
                </Link>
                <Link to="/kelas/12" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl mx-1 transition-all duration-300 group">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">12</span>
                  <span className="font-semibold text-gray-700 group-hover:text-red-600 text-sm">Kelas 12</span>
                </Link>
                <div className="border-t border-gray-100 mt-1 pt-1 mx-2">
                  <Link to="/alumni" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl mx-1 transition-all duration-300 group">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">🎓</span>
                    <span className="font-semibold text-gray-700 group-hover:text-red-600 text-sm">Alumni</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/admin/login"
            className="mt-2 w-full block text-center px-5 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all duration-500"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;