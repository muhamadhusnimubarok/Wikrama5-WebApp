import { useState } from 'react';
import FloatingSetting from '../components/Button/FloatingSetting';
import ThemeSettingModal from '../components/Modal/ThemeSettingModal';
import { useTheme } from '../context/ThemeContext';
import HeroSection from '../components/Home/Hero';
import CircularGallery from '../components/Home/CircularGallery';
import StrukturButton from '../components/Button/StrukturButton';
import TarotCards from '../components/Home/TarotCard';
import SocialRibbons from '../components/Home/SocialRibbons';
import ImagePreviewModal from '../components/Modal/ImagePreviewModal';
import Lokasi from '../components/Home/Lokasi';
import Footer from '../components/Home/Footer';
import ScrollReveal from '../components/ScrollReveal';

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const { theme } = useTheme();



  const handleImageClick = (imageSrc, imageTitle) => {
    setPreviewImage(imageSrc);
    setPreviewTitle(imageTitle || '');
    setIsPreviewOpen(true);
  };

  return (
    <>
      {/* Hero - Tanpa scroll reveal (langsung muncul) */}
      <HeroSection />

      {/* Struktur Button */}
      <ScrollReveal>
        <StrukturButton />
      </ScrollReveal>

      {/* Circular Gallery */}
      <ScrollReveal threshold={0.08}>
        <div style={{ height: '600px', position: 'relative' }}>
          <CircularGallery
            onImageClick={handleImageClick}
            autoScrollSpeed={4000}
          />
        </div>
      </ScrollReveal>

      {/* Tarot Cards */}
      <ScrollReveal threshold={0.05}>
        <TarotCards />
      </ScrollReveal>

      {/* Social Ribbons */}
      <ScrollReveal>
        <SocialRibbons />
      </ScrollReveal>

      {/* Lokasi */}
      <ScrollReveal threshold={0.1}>
        <Lokasi />
      </ScrollReveal>

      {/* Footer */}
      <Footer />

      {/* Floating & Modal */}
      <FloatingSetting onClick={() => setIsModalOpen(true)} />
      <ThemeSettingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageSrc={previewImage}
        imageTitle={previewTitle}
      />
    </>
  );
}

export default Dashboard;