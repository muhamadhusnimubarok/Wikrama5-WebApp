import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    members: 0,
    banners: 0,
    albums: 0,
    pembimbing: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, membersRes, bannersRes, albumsRes, pembimbingRes] = await Promise.all([
          api.get('/me'),
          api.get('/member-rayons'),
          api.get('/banner-heroes'),
          api.get('/gallery-albums'),
          api.get('/pembimbing-siswas'),
        ]);
        setUser(userRes.data.user);
        setStats({
          members: membersRes.data.data?.length || 0,
          banners: bannersRes.data.data?.length || 0,
          albums: albumsRes.data.data?.length || 0,
          pembimbing: pembimbingRes.data.data?.length || 0,
        });
      } catch (err) {
        console.error('Gagal fetch data');
      }
    };
    fetchData();
  }, []);

  const cards = [
    { label: 'Member Rayon', value: stats.members, color: 'bg-blue-500', icon: '👥' },
    { label: 'Banner Hero', value: stats.banners, color: 'bg-green-500', icon: '🖼️' },
    { label: 'Album Galeri', value: stats.albums, color: 'bg-yellow-500', icon: '📸' },
    { label: 'Pembimbing', value: stats.pembimbing, color: 'bg-red-500', icon: '👨‍🏫' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#3D5170]">
          Selamat Datang, {user?.name || 'Admin'}!
        </h1>
        <p className="text-gray-500 mt-1">Berikut adalah ringkasan data sekolah.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-[#3D5170] mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center text-2xl shadow-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity / Table Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#3D5170] mb-4">Aktivitas Terbaru</h3>
        <p className="text-gray-400 text-sm">Belum ada aktivitas terbaru.</p>
      </div>
    </div>
  );
}