import { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Settings } from 'lucide-react';

function FloatingSetting({ onClick }) {
  const { theme } = useTheme();
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 p-4 rounded-full text-white shadow-2xl hover:scale-110 transition-transform duration-300"
      style={{ backgroundColor: theme.primaryColor }}
    >
      <Settings className="w-6 h-6 animate-[spin_5s_linear_infinite]" />
    </button>
  );
}

export default FloatingSetting; 
