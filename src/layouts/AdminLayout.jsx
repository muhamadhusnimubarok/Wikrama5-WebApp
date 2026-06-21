import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import {
  LayoutDashboard,
  Image,
  Users,
  UserCheck,
  Calendar,
  Album,
  Share2,
  LogOut,
  Bell,
  User,
  Quote,
} from 'lucide-react';

const adminMenuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/banners', label: 'Banner Hero', icon: Image },
  { path: '/admin/members', label: 'Member Rayon', icon: Users },
  { path: '/admin/pembimbing', label: 'Pembimbing', icon: UserCheck },
  { path: '/admin/pickets', label: 'Picket Schedule', icon: Calendar },
  { path: '/admin/albums', label: 'Gallery Album', icon: Album },
  { path: '/admin/social-media', label: 'Social Media', icon: Share2 },
  { path: '/admin/quotes', label: 'Quotes', icon: Quote },

];

const siswaMenuItems = [
  { path: '/admin/members', label: 'Profil Saya', icon: User },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userInitial, setUserInitial] = useState('U');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me');
        const user = res.data.user;
        const name = user?.name || 'User';
        setUserName(name);
        setUserInitial(name.charAt(0).toUpperCase());

        // ⬇️ Ambil role langsung dari user.role
        const role = user?.role || '';
        setUserRole(role);

        // Jika Siswa dan bukan di /admin/members, redirect ke profil
        if (role && role !== 'admin' && !location.pathname.includes('/admin/members')) {
          navigate('/admin/members', { replace: true });
        }
      } catch (err) {
        console.error('Gagal fetch user:', err);
        localStorage.removeItem('auth_token');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('auth_token');
      navigate('/admin/login');
    }
  };

  const isAdmin = userRole === 'admin';
  const menuItems = isAdmin ? adminMenuItems : siswaMenuItems;

  // Ambil judul halaman dari path
  const getTitle = () => {
    const path = location.pathname;
    for (const item of menuItems) {
      if (item.exact ? path === item.path : path.startsWith(item.path)) {
        return item.label;
      }
    }
    return 'Dashboard';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]">
        <div className="animate-spin w-8 h-8 border-2 border-[#F25C54] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6F8]">
      {/* ========== SIDEBAR ========== */}
      <aside className={`bg-white shadow-md flex flex-col transition-all duration-300 ${isAdmin ? 'w-64' : 'w-56'}`}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#3D5170]">
            Wikrama <span className="text-[#F25C54]">5</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isAdmin ? 'Admin Panel' : 'Panel Siswa'}
          </p>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F25C54] flex items-center justify-center text-white font-bold text-sm">
              {userInitial}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3D5170] line-clamp-1">{userName}</p>
              <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : 'Siswa'}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-[#F25C54] text-white shadow-md shadow-red-200'
                  : 'text-[#3D5170] hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Info untuk Siswa */}
        {!isAdmin && (
          <div className="px-4 py-3 mx-3 mb-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-600">
              💡 Anda login sebagai <strong>Siswa</strong>. Hanya dapat melihat & mengedit profil sendiri.
            </p>
          </div>
        )}

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#3D5170]">{getTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${isAdmin ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
              {isAdmin ? 'Admin' : 'Siswa'}
            </span>

            {/* Notifikasi */}
            <button className="relative p-2 text-gray-500 hover:text-[#3D5170] transition rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#F25C54] flex items-center justify-center text-white font-bold text-xs">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}