import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import PembimbingSiswa from './pages/PembimbingSiswa';
import Piketku from './pages/Piketku';
import Album from './pages/Album';
import Kelas10 from './pages/kelas/Kelas10';
import Kelas11 from './pages/kelas/Kelas11';
import Kelas12 from './pages/kelas/Kelas12';
import Alumni from './pages/kelas/Alumni';
import Login from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminBanners from './pages/Admin/Banners';
import AdminMembers from './pages/Admin/Members';
import AdminPembimbing from './pages/Admin/Pembimbing';
import AdminSocialMedia from './pages/Admin/SocialMedia';
import AdminAlbums from './pages/Admin/Albums';
import AdminQuotes from './pages/Admin/Quotes';
import AlbumDetail from './pages/AlbumDetail';
import DetailSiswa from './pages/DetailSiswa';

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pembimbing-siswa" element={<PembimbingSiswa />} />
          <Route path="/piketku" element={<Piketku />} />
          <Route path="/album" element={<Album />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
          <Route path="/kelas/10" element={<Kelas10 />} />
          <Route path="/kelas/11" element={<Kelas11 />} />
          <Route path="/kelas/12" element={<Kelas12 />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/siswa/:id" element={<DetailSiswa />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
            <Route path="/admin/members" element={<AdminMembers />} />
            <Route path="/admin/pembimbing" element={<AdminPembimbing />} />
            <Route path="/admin/social-media" element={<AdminSocialMedia />} />
            <Route path="/admin/albums" element={<AdminAlbums />} />
            <Route path="/admin/quotes" element={<AdminQuotes />} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}