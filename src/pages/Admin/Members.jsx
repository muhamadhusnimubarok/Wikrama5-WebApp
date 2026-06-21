import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Users, Upload, Search, Eye, Download } from 'lucide-react';
import api, { BASE_URL } from '../../api/client';

// ============================================================
// ⚠️ KONFIGURASI TAHUN AJARAN - UBAH SETIAP TAHUN (JULI)
// ============================================================
// Format: prefix 3 digit NIS → kelas
// Contoh Juni 2026 (sebelum Juli):
//   123 = masuk 2023 → kelas 12
//   124 = masuk 2024 → kelas 11
//   125 = masuk 2025 → kelas 10
//   126 = masuk 2026 → kelas 10 (baru masuk Juli nanti)
//
// Setelah Juli 2026, ubah jadi:
//   123 = alumni, 124 = kelas 12, 125 = kelas 11, 126 = kelas 10, 127 = kelas 10
// ============================================================
const getKelas = (tahunMasuk) => {
  if (!tahunMasuk) return null;

  const now = new Date();
  const tahunSekarang = now.getFullYear();
  const bulanSekarang = now.getMonth(); // 0-11 (Juni = 5)

  let selisih = tahunSekarang - parseInt(tahunMasuk);

  // Sebelum Juli (bulan < 6), belum naik kelas
  if (bulanSekarang < 6) selisih -= 1;

  const kelas = selisih + 10;

  if (kelas > 12) return 'alumni';
  if (kelas >= 10 && kelas <= 12) return kelas.toString();
  return '10';
};

const getKelasBadge = (tahunMasuk) => {
  const kelas = getKelas(tahunMasuk);
  if (!kelas) return <span className="text-xs text-gray-300">-</span>;

  const badges = {
    '10': { bg: 'bg-green-50', text: 'text-green-700', label: 'Kelas 10' },
    '11': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Kelas 11' },
    '12': { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Kelas 12' },
    'alumni': { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Alumni' },
  };

  const badge = badges[kelas];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
};

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [filterKelas, setFilterKelas] = useState('semua');

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', nama_panggilan: '', tempat_tanggal_lahir: '', jenis_kelamin: '',
    hobi_minat: '', nis: '', rombel: '', tahun_masuk: '', alamat: '', kontak_wa: '',
    instagram: '', linkedin: '', deskripsi_profil: '',
    foto_path: null, sertifikat_data: [],
  });
  const [previewFoto, setPreviewFoto] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detailMember, setDetailMember] = useState(null);

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const isAdmin = userRole === 'admin';

  // ========== STATS ==========
  const stats = {
    semua: members.length,
    '10': members.filter(m => getKelas(m.tahun_masuk) === '10').length,
    '11': members.filter(m => getKelas(m.tahun_masuk) === '11').length,
    '12': members.filter(m => getKelas(m.tahun_masuk) === '12').length,
    alumni: members.filter(m => getKelas(m.tahun_masuk) === 'alumni').length,
  };

  // ========== FETCH ==========
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/member-rayons');
      setMembers(res.data.data || []);
    } catch (err) {
      setError('Gagal memuat data member');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get('/me');
        const user = res.data.user;
        setUserRole(user?.role || '');
      } catch (err) {
        console.log('Gagal fetch user');
      }
    };
    fetchUserData();
    fetchMembers();
  }, []);

  // ========== HELPERS ==========
  const resetForm = () => {
    setFormData({
      name: '', nama_panggilan: '', tempat_tanggal_lahir: '', jenis_kelamin: '',
      hobi_minat: '', nis: '', rombel: '', tahun_masuk: '', alamat: '', kontak_wa: '',
      instagram: '', linkedin: '', deskripsi_profil: '',
      foto_path: null, sertifikat_data: [],
    });
    setPreviewFoto(null);
    setEditingMember(null);
    setError('');
  };

  const handleCreate = () => { resetForm(); setShowModal(true); };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '', nama_panggilan: member.nama_panggilan || '',
      tempat_tanggal_lahir: member.tempat_tanggal_lahir || '',
      jenis_kelamin: member.jenis_kelamin || '', hobi_minat: member.hobi_minat || '',
      nis: member.nis || '', rombel: member.rombel || '', tahun_masuk: member.tahun_masuk || '',
      alamat: member.alamat || '',
      kontak_wa: member.kontak_wa || '', instagram: member.instagram || '',
      linkedin: member.linkedin || '', deskripsi_profil: member.deskripsi_profil || '',
      foto_path: null, sertifikat_data: [],
    });
    setPreviewFoto(member.foto_url ? `${BASE_URL}${member.foto_url}` : null);
    setShowModal(true);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, foto_path: file });
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleSertifikatChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, sertifikat_data: files });
  };

  // ========== IMPORT ==========
  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
    setImportError('');
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) { setImportError('Pilih file terlebih dahulu'); return; }
    setImporting(true); setImportError('');
    try {
      const payload = new FormData();
      payload.append('file', importFile);
      const res = await api.post('/member-rayons/import', payload);
      setSuccess(res.data.message || 'Import berhasil!');
      setShowImportModal(false); setImportFile(null); fetchMembers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      const errMsg = err.response?.data?.errors
        ? err.response.data.errors.join(', ')
        : err.response?.data?.message || 'Gagal import';
      setImportError(errMsg);
    } finally { setImporting(false); }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "nis,nama_lengkap,nama_panggilan,ttl,jenis_kelamin,rombel,tahun_masuk,alamat,kontak_wa,instagram,hobi_minat,deskripsi\n12345,John Doe,John,\"Jakarta, 1 Januari 2005\",L,\"X RPL 1\",2023,\"Jl. Contoh No.1\",08123456789,@john,membaca,\"Siswa berprestasi\"\n12446,Jane Doe,Jane,\"Bandung, 2 Februari 2005\",P,\"X RPL 2\",2024,\"Jl. Contoh No.2\",08123456790,@jane,menulis,\"Aktif di OSIS\"";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-import-member.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    if (!formData.nis && isAdmin) { setError('NIS wajib diisi'); setSubmitting(false); return; }
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'sertifikat_data') { value.forEach((file) => payload.append('sertifikat_data[]', file)); }
        else if (key === 'foto_path' && value) { payload.append('foto_path', value); }
        else if (key !== 'foto_path' && key !== 'sertifikat_data' && value !== '' && value !== null) { payload.append(key, value); }
      });
      if (!isAdmin) payload.delete('nis');
      if (editingMember) {
        payload.append('_method', 'PUT');
        await api.post(`/member-rayons/${editingMember.id}`, payload);
        setSuccess('Data berhasil diupdate!');
      } else {
        await api.post('/member-rayons', payload);
        setSuccess('Member berhasil ditambahkan!');
      }
      setShowModal(false); resetForm(); fetchMembers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      const errMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Gagal menyimpan';
      setError(errMsg);
    } finally { setSubmitting(false); }
  };

  // ========== DELETE ==========
  const handleDelete = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      await api.delete(`/member-rayons/${deleteId}`);
      setSuccess('Member berhasil dihapus!'); setDeleteId(null); fetchMembers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Gagal menghapus member'); }
    finally { setDeleting(false); }
  };

  // ========== FILTER ==========
  const filteredMembers = (isAdmin ? members : members).filter((m) => {
    const matchSearch = !searchTerm ||
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.rombel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterKelas === 'semua') return matchSearch;
    return matchSearch && getKelas(m.tahun_masuk) === filterKelas;
  });

  // ========== RENDER ==========
  return (
    <div className="animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-[#3D5170]">
            {isAdmin ? 'Member Rayon' : 'Profil Saya'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'Kelola data member rayon • User otomatis dibuat' : 'Lihat dan edit profil Anda'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-blue-200">
              <Download className="w-4 h-4" /> Template
            </button>
            <button onClick={() => { setShowImportModal(true); setImportFile(null); setImportError(''); }} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-green-200">
              <Upload className="w-4 h-4" /> Import Excel
            </button>
            <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg font-medium text-sm hover:bg-[#e04f47] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-red-200">
              <Plus className="w-4 h-4" /> Tambah Member
            </button>
          </div>
        )}
      </div>

      {/* STATS CARDS (Admin only) */}
      {isAdmin && !loading && (
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-5 gap-2 animate-slideUp animation-delay-100">
          {[
            { key: 'semua', label: 'Semua', count: stats.semua, icon: '👥', bg: 'bg-white border-gray-200' },
            { key: '10', label: 'Kelas 10', count: stats['10'], icon: '🟢', bg: 'bg-green-50 border-green-200' },
            { key: '11', label: 'Kelas 11', count: stats['11'], icon: '🔵', bg: 'bg-blue-50 border-blue-200' },
            { key: '12', label: 'Kelas 12', count: stats['12'], icon: '🟠', bg: 'bg-orange-50 border-orange-200' },
            { key: 'alumni', label: 'Alumni', count: stats.alumni, icon: '🟣', bg: 'bg-purple-50 border-purple-200' },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilterKelas(stat.key)}
              className={`${stat.bg} border rounded-lg p-3 text-left hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 ${filterKelas === stat.key ? 'ring-2 ring-[#F25C54] shadow-md scale-105' : ''
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#3D5170]">{stat.count}</span>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* SEARCH + FILTER */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-3 mb-4 animate-slideUp animation-delay-150">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Cari nama, NIS, rombel, atau email..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition-all duration-300 hover:shadow-sm"
            />
          </div>
        </div>
      )}

      {/* ALERT SUCCESS */}
      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-2 text-sm animate-slideDown">
          ✅ <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TABLE (Admin) */}
      {isAdmin ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-scaleIn">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-[#F25C54] border-t-transparent rounded-full mx-auto mb-3"></div>
              Memuat data...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 animate-fadeIn">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              {searchTerm || filterKelas !== 'semua' ? 'Tidak ada member yang cocok.' : 'Belum ada member.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Foto</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama/NIS</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rombel</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kontak</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sertifikat</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMembers.map((member, i) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-all duration-200 animate-fadeIn" style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="px-4 py-3">
                        {member.foto_url ? (
                          <img src={`${BASE_URL}${member.foto_url}`} alt="" className="w-10 h-10 rounded-full object-cover hover:scale-110 transition-transform duration-300 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><Users className="w-5 h-5 text-gray-400" /></div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-[#3D5170]">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.nis || '-'}</p>
                      </td>
                      <td className="px-4 py-3">{getKelasBadge(member.tahun_masuk)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.rombel || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{member.kontak_wa || '-'}</td>
                      <td className="px-4 py-3">
                        {member.sertifikat_urls?.length > 0 ? (
                          <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-full">{member.sertifikat_urls.length} file</span>
                        ) : <span className="text-xs text-gray-300">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setDetailMember(member)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-90"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleEdit(member)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-90"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(member.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-90"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* SISWA VIEW */
        <div>
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-[#F25C54] border-t-transparent rounded-full mx-auto mb-3"></div>
              Memuat data...
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center text-gray-400 animate-fadeIn">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              Data profil tidak ditemukan.
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="space-y-4 sm:space-y-6 animate-slideUp">

                {/* CARD PROFIL */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">

                  {/* Header Foto + Nama - Stack di mobile, row di tablet */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:px-6 sm:py-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    {/* Foto */}
                    <div className="flex-shrink-0">
                      {member.foto_url ? (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white shadow-xl overflow-hidden">
                          <img
                            src={`${BASE_URL}${member.foto_url}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <Users className="w-12 h-12 sm:w-14 sm:h-14 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Nama & Badge */}
                    <div className="text-center sm:text-left flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-[#3D5170]">{member.name}</h2>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                        {member.nis && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            NIS: {member.nis}
                          </span>
                        )}
                        {getKelasBadge(member.tahun_masuk)}
                        {member.rombel && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {member.rombel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-500 mt-1.5">{member.user?.email || '-'}</p>
                    </div>
                  </div>

                  {/* Info Grid - 1 kolom di HP, 2 di tablet */}
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                      {[
                        ['Nama Panggilan', member.nama_panggilan],
                        ['Rayon', member.rayon_role?.name],
                        ['Rombel', member.rombel],
                        ['TTL', member.tempat_tanggal_lahir],
                        ['Jenis Kelamin', member.jenis_kelamin === 'L' ? 'Laki-laki' : member.jenis_kelamin === 'P' ? 'Perempuan' : '-'],
                        ['Hobi & Minat', member.hobi_minat],
                        ['WhatsApp', member.kontak_wa],
                        ['Instagram', member.instagram],
                        ['LinkedIn', member.linkedin],
                      ].filter(([, value]) => value)
                        .map(([label, value], i) => (
                          <ProfileRow key={i} label={label} value={value} delay={i * 30} />
                        ))}
                    </div>

                    {member.alamat && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-gray-500 font-medium text-sm mb-1">🏠 Alamat</p>
                        <p className="text-[#3D5170] text-sm leading-relaxed">{member.alamat}</p>
                      </div>
                    )}

                    {member.deskripsi_profil && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-gray-500 font-medium text-sm mb-1">📝 Deskripsi</p>
                        <p className="text-[#3D5170] text-sm italic leading-relaxed">"{member.deskripsi_profil}"</p>
                      </div>
                    )}

                    {/* Tombol Edit */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => handleEdit(member)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#F25C54] text-white rounded-xl text-sm font-semibold hover:bg-[#e04f47] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-red-200"
                      >
                        <Pencil className="w-4 h-4" /> Edit Profil
                      </button>
                    </div>
                  </div>
                </div>

                {/* SERTIFIKAT */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300 animate-slideUp animation-delay-200">
                  <h3 className="text-lg font-bold text-[#3D5170] mb-4 flex items-center gap-2">
                    <span className="text-xl">📄</span> Sertifikat
                    {member.sertifikat_urls?.length > 0 && (
                      <span className="text-xs font-normal text-gray-400 ml-auto">
                        {member.sertifikat_urls.length} file
                      </span>
                    )}
                  </h3>

                  {member.sertifikat_urls?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {member.sertifikat_urls.map((url, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-scaleIn bg-white"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          {url.toLowerCase().endsWith('.pdf') ? (
                            <a
                              href={`${BASE_URL}${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-4 bg-red-50 hover:bg-red-100 transition text-center"
                            >
                              <span className="text-3xl">📕</span>
                              <p className="text-xs text-red-600 truncate mt-2">{url.split('/').pop()}</p>
                              <p className="text-[10px] text-red-400 mt-0.5">PDF Document</p>
                            </a>
                          ) : (
                            <a
                              href={`${BASE_URL}${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block group relative"
                            >
                              <img
                                src={`${BASE_URL}${url}`}
                                alt=""
                                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end p-2">
                                <span className="text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                  {url.split('/').pop()}
                                </span>
                              </div>
                            </a>
                          )}
                          <div className="px-3 py-2 bg-gray-50 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400">#{index + 1}</span>
                            <a
                              href={`${BASE_URL}${url}`}
                              download
                              className="text-[10px] text-[#F25C54] hover:underline font-medium"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-4xl mb-2">📭</p>
                      <p className="text-sm">Belum ada sertifikat</p>
                      <p className="text-xs mt-1">Upload sertifikat melalui menu Edit Profil</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL IMPORT */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowImportModal(false); setImportFile(null); setImportError(''); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#3D5170]">Import Member Rayon</h3>
              <button onClick={() => { setShowImportModal(false); setImportFile(null); setImportError(''); }} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-600">
              💡 <strong>Format Excel/CSV:</strong> Kolom wajib: <code className="bg-blue-100 px-1 rounded">nis</code>, <code className="bg-blue-100 px-1 rounded">nama_lengkap</code>.<br />Kolom opsional: <code className="bg-blue-100 px-1 rounded">nama_panggilan</code>, <code className="bg-blue-100 px-1 rounded">ttl</code>, <code className="bg-blue-100 px-1 rounded">jenis_kelamin</code> (L/P), <code className="bg-blue-100 px-1 rounded">rombel</code>, dll.
            </div>
            {importError && <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg animate-shake">{importError}</div>}
            <form onSubmit={handleImport}>
              <div className="relative mb-4">
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-all duration-300 cursor-pointer bg-gray-50/50">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-600">Klik untuk pilih file</p>
                  <p className="text-xs text-gray-400 mt-1">.xlsx, .xls, .csv (max 5MB)</p>
                  {importFile && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg">
                      ✓ {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setShowImportModal(false); setImportFile(null); }} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">Batal</button>
                <button type="submit" disabled={importing || !importFile} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 shadow-md shadow-green-200">
                  {importing ? <span className="flex items-center gap-2"><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>Mengimport...</span> : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {detailMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailMember(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#3D5170]">Detail Member</h3>
              <button onClick={() => setDetailMember(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-4 mb-4">
                {detailMember.foto_url ? <img src={`${BASE_URL}${detailMember.foto_url}`} alt="" className="w-20 h-20 rounded-full object-cover" /> : <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center"><Users className="w-8 h-8 text-gray-400" /></div>}
                <div><p className="font-bold text-lg text-[#3D5170]">{detailMember.name}</p><p className="text-gray-500">{detailMember.nama_panggilan && `(${detailMember.nama_panggilan})`}</p></div>
              </div>
              {[['NIS', detailMember.nis], ['Email', detailMember.user?.email], ['Rayon', detailMember.rayon_role?.name], ['Kelas', getKelas(detailMember.tahun_masuk) ? `Kelas ${getKelas(detailMember.tahun_masuk)}` : '-'], ['Rombel', detailMember.rombel], ['TTL', detailMember.tempat_tanggal_lahir], ['Jenis Kelamin', detailMember.jenis_kelamin === 'L' ? 'Laki-laki' : detailMember.jenis_kelamin === 'P' ? 'Perempuan' : '-'], ['Hobi & Minat', detailMember.hobi_minat], ['Alamat', detailMember.alamat], ['WhatsApp', detailMember.kontak_wa], ['Instagram', detailMember.instagram], ['LinkedIn', detailMember.linkedin], ['Deskripsi', detailMember.deskripsi_profil]].map(([label, value], i) => (
                <DetailRow key={i} label={label} value={value} delay={i * 20} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-[#3D5170]">{editingMember ? 'Edit ' + (isAdmin ? 'Member' : 'Profil') : 'Tambah Member'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg animate-shake">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Nama Lengkap <span className="text-red-500">*</span></label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition-all duration-300" /></div>
                <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Nama Panggilan</label><input type="text" value={formData.nama_panggilan} onChange={(e) => setFormData({ ...formData, nama_panggilan: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition-all duration-300" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {isAdmin && <div><label className="block text-sm font-medium text-[#3D5170] mb-1">NIS <span className="text-red-500">*</span></label><input type="text" value={formData.nis} onChange={(e) => setFormData({ ...formData, nis: e.target.value })} required placeholder="Akan jadi email & password" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition-all duration-300" /></div>}
                <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Rombel</label><input type="text" value={formData.rombel} onChange={(e) => setFormData({ ...formData, rombel: e.target.value })} placeholder="X RPL 1" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition-all duration-300" /></div>
                <div>
                  <label className="block text-sm font-medium text-[#3D5170] mb-1">Tahun Masuk</label>
                  <select
                    value={formData.tahun_masuk}
                    onChange={(e) => setFormData({ ...formData, tahun_masuk: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition"
                  >
                    <option value="">Pilih tahun...</option>

                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Tempat, Tanggal Lahir</label><input type="text" value={formData.tempat_tanggal_lahir} onChange={(e) => setFormData({ ...formData, tempat_tanggal_lahir: e.target.value })} placeholder="Jakarta, 1 Januari 2005" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition-all duration-300" /></div>
                <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Jenis Kelamin</label><select value={formData.jenis_kelamin} onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition-all duration-300"><option value="">Pilih...</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Alamat</label><textarea value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none resize-none transition-all duration-300" /></div>
              <div className="grid grid-cols-3 gap-4">
                {[['Kontak WA', 'kontak_wa'], ['Instagram', 'instagram'], ['LinkedIn', 'linkedin']].map(([label, key]) => (
                  <div key={key}><label className="block text-sm font-medium text-[#3D5170] mb-1">{label}</label><input type="text" value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition-all duration-300" /></div>
                ))}
              </div>
              <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Hobi & Minat</label><input type="text" value={formData.hobi_minat} onChange={(e) => setFormData({ ...formData, hobi_minat: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition-all duration-300" /></div>
              <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Deskripsi Profil</label><textarea value={formData.deskripsi_profil} onChange={(e) => setFormData({ ...formData, deskripsi_profil: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none resize-none transition-all duration-300" /></div>
              <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Foto Profil</label><div className="relative group"><input type="file" accept="image/*" onChange={handleFotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center group-hover:border-[#F25C54] transition-all duration-300 cursor-pointer">{previewFoto ? <img src={previewFoto} alt="Preview" className="h-20 mx-auto rounded-full animate-scaleIn" /> : <div className="space-y-1"><Upload className="w-6 h-6 mx-auto text-gray-300 group-hover:text-[#F25C54] transition-colors" /><p className="text-xs text-gray-400">Klik untuk upload foto (max 5MB)</p></div>}</div></div></div>
              {/* SERTIFIKAT */}
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">
                  Sertifikat <span className="text-xs text-gray-400 font-normal">(bisa pilih banyak file)</span>
                </label>
                <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-600">
                  💡 Format: JPG, PNG, atau PDF. Maks 5MB per file. Klik tombol + untuk tambah file.
                </div>

                {/* Grid preview sertifikat */}
                {formData.sertifikat_data.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                    {Array.from(formData.sertifikat_data).map((file, i) => (
                      <div key={i} className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square">
                        {/* Preview gambar */}
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-red-50">
                            <span className="text-2xl">📕</span>
                            <p className="text-xs text-red-600 text-center truncate w-full mt-1">{file.name}</p>
                          </div>
                        )}
                        {/* Tombol hapus */}
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = Array.from(formData.sertifikat_data);
                            newFiles.splice(i, 1);
                            setFormData({ ...formData, sertifikat_data: newFiles });
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {/* Nama file */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tombol Upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    multiple
                    onChange={handleSertifikatChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#F25C54] transition-all duration-300 cursor-pointer bg-gray-50/50 group">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-1 group-hover:text-[#F25C54] transition-colors" />
                    <p className="text-sm font-medium text-gray-600">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F25C54] text-white text-xs mr-1">+</span>
                      Klik untuk tambah file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, atau PDF</p>
                  </div>
                </div>
              </div>              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg text-sm font-medium hover:bg-[#e04f47] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 shadow-md shadow-red-200">{submitting ? (<span className="flex items-center justify-center gap-2"><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>Menyimpan...</span>) : editingMember ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteId && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-scaleIn">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-lg font-bold text-[#3D5170] mb-2">Hapus Member?</h3>
            <p className="text-sm text-gray-500 mb-6">Member dan akun user akan dihapus permanen.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50">{deleting ? 'Menghapus...' : 'Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== KOMPONEN KECIL ==========
function DetailRow({ label, value, delay = 0 }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2 animate-fadeIn" style={{ animationDelay: `${delay}ms` }}>
      <span className="text-gray-500">{label}</span>
      <span className="text-[#3D5170] font-medium text-right max-w-[60%]">{value || '-'}</span>
    </div>
  );
}

function ProfileRow({ label, value, delay = 0 }) {
  return (
    <div className="animate-fadeIn hover:scale-[1.02] transition-transform duration-200" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-gray-500">{label}</p>
      <p className="text-[#3D5170] font-medium">{value || '-'}</p>
    </div>
  );
}