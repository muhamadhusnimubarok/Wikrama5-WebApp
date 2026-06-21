import { useTheme } from "../context/ThemeContext";
import Navbar from "./Navbar";
import ParticleCanvas from "../components/Background/ParticleCanvas";
import { Outlet } from "react-router-dom";

function MainLayout() {
  const { theme } = useTheme();
  const isDarkBg = theme.background === '#0f172a';

  return (
    <div
      className={`relative min-h-screen w-full transition-all duration-700 ${isDarkBg ? 'text-white' : 'text-slate-800'}`}
      style={{ fontFamily: theme.fontFamily, background: theme.background }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');`}
      </style>

      <ParticleCanvas />

      <Navbar />

      <div className={`relative z-10 min-h-screen w-full flex flex-col ${isDarkBg ? 'bg-black/20 backdrop-blur-3xl' : 'bg-white/30 backdrop-blur-[16px]'}`}>
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 mt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;