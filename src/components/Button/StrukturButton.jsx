import { useTheme } from '../../context/ThemeContext';

function StrukturButton() {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center mt-6 sm:mt-8">
      <a
        href="#struktur"
        className="group inline-flex items-center gap-2 sm:gap-3 md:gap-4 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 
                   bg-yellow-400 text-slate-950 font-extrabold text-base sm:text-lg md:text-xl tracking-wider sm:tracking-widest
                   rounded-full border-2 border-slate-900 shadow-lg
                   transition-all duration-300 ease-out 
                   hover:bg-slate-900 hover:text-white hover:border-yellow-400
                   hover:shadow-2xl hover:-translate-y-1 active:scale-[0.97]"
        style={{ fontFamily: theme?.fontFamily }}
      >
        STRUKTUR RAYON
        
        {/* Icon Arrow */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-all duration-500 ease-out 
                     rotate-[-45deg] group-hover:rotate-0" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={3.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h14" />
        </svg>
      </a>

      <p className="text-slate-500 text-xs sm:text-sm mt-2 sm:mt-3 font-medium">Click here!</p>
    </div>
  );
}

export default StrukturButton;