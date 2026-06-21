import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Settings, X, Palette, Type, Layers } from 'lucide-react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState({
    primaryColor: '#E14434',
    fontFamily: "'Inter', sans-serif",
    background: '#ffffff',
    elementType: 'none', 
  });

  const updateTheme = (newSettings) => {
    setTheme((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);