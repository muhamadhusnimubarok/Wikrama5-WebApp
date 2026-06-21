import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, ImageIcon, Upload } from 'lucide-react';
import api, { BASE_URL } from '../../api/client';


export default function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        judul_utama: '',
        deskripsi: '',
        tagline_kuning: '',
        banner_path: null,
    });
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Delete confirmation
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch banners
    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await api.get('/banner-heroes');
            setBanners(res.data.data || []);
        } catch (err) {
            setError('Gagal memuat data banner');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // Reset form
    const resetForm = () => {
        setFormData({ judul_utama: '', deskripsi: '', tagline_kuning: '', banner_path: null });
        setPreview(null);
        setEditingBanner(null);
        setError('');
    };

    // Open modal create
    const handleCreate = () => {
        resetForm();
        setShowModal(true);
    };

    // Open modal edit
    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            judul_utama: banner.judul_utama || '',
            deskripsi: banner.deskripsi || '',
            tagline_kuning: banner.tagline_kuning || '',
            banner_path: null,
        });
        setPreview(banner.banner_url ? `${BASE_URL}${banner.banner_url}` : null); // ⬅️ UBAH INI
        setShowModal(true);
    };

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, banner_path: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const payload = new FormData();
            payload.append('judul_utama', formData.judul_utama);
            payload.append('deskripsi', formData.deskripsi);
            if (formData.tagline_kuning) payload.append('tagline_kuning', formData.tagline_kuning);
            if (formData.banner_path) payload.append('banner_path', formData.banner_path);

            if (editingBanner) {
                payload.append('_method', 'PUT');
                await api.post(`/banner-heroes/${editingBanner.id}`, payload);
                setSuccess('Banner berhasil diupdate!');
            } else {
                await api.post('/banner-heroes', payload);
                setSuccess('Banner berhasil ditambahkan!');
            }

            setShowModal(false);
            resetForm();
            fetchBanners();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan banner');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete banner
    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/banner-heroes/${deleteId}`);
            setSuccess('Banner berhasil dihapus!');
            setDeleteId(null);
            fetchBanners();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Gagal menghapus banner');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            {/* ========== HEADER ========== */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#3D5170]">Banner Hero</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola banner hero halaman utama</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg font-medium text-sm hover:bg-[#e04f47] transition-all shadow-md shadow-red-200 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Banner
                </button>
            </div>

            {/* ========== ALERT SUCCESS ========== */}
            {success && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                    ✅ {success}
                    <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* ========== TABLE ========== */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="animate-spin w-8 h-8 border-2 border-[#F25C54] border-t-transparent rounded-full mx-auto mb-3"></div>
                        Memuat data...
                    </div>
                ) : banners.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        Belum ada banner. Klik "Tambah Banner" untuk membuat.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Banner</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Utama</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tagline</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {banners.map((banner) => (
                                    <tr key={banner.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            {banner.banner_url ? (
                                                <img
                                                    src={`${BASE_URL}${banner.banner_url}`}  // ⬅️ UBAH INI
                                                    alt={banner.judul_utama}
                                                    className="w-20 h-14 object-cover rounded-lg shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-[#3D5170] line-clamp-2">{banner.judul_utama}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500 line-clamp-2 max-w-xs">{banner.deskripsi}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {banner.tagline_kuning ? (
                                                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                                    {banner.tagline_kuning}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(banner)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(banner.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ========== MODAL CREATE/EDIT ========== */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-[#3D5170]">
                                {editingBanner ? 'Edit Banner' : 'Tambah Banner'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                            {/* Error */}
                            {error && (
                                <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Judul Utama */}
                            <div>
                                <label className="block text-sm font-medium text-[#3D5170] mb-1">
                                    Judul Utama <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.judul_utama}
                                    onChange={(e) => setFormData({ ...formData, judul_utama: e.target.value })}
                                    placeholder="Masukkan judul utama"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition"
                                />
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="block text-sm font-medium text-[#3D5170] mb-1">
                                    Deskripsi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    placeholder="Masukkan deskripsi"
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition resize-none"
                                />
                            </div>

                            {/* Tagline Kuning */}
                            <div>
                                <label className="block text-sm font-medium text-[#3D5170] mb-1">
                                    Tagline Kuning
                                </label>
                                <input
                                    type="text"
                                    value={formData.tagline_kuning}
                                    onChange={(e) => setFormData({ ...formData, tagline_kuning: e.target.value })}
                                    placeholder="Masukkan tagline (opsional)"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition"
                                />
                            </div>

                            {/* Upload Banner */}
                            <div>
                                <label className="block text-sm font-medium text-[#3D5170] mb-1">
                                    Banner {!editingBanner && <span className="text-red-500">*</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F25C54] transition cursor-pointer">
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-sm" />
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="w-8 h-8 mx-auto text-gray-300" />
                                                <p className="text-sm text-gray-400">
                                                    Klik untuk upload banner
                                                </p>
                                                <p className="text-xs text-gray-300">JPG, PNG, GIF (max 2MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg text-sm font-medium hover:bg-[#e04f47] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Menyimpan...
                                        </span>
                                    ) : editingBanner ? (
                                        'Update Banner'
                                    ) : (
                                        'Simpan Banner'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== MODAL DELETE CONFIRMATION ========== */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-[#3D5170] mb-2">Hapus Banner?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Banner yang dihapus tidak dapat dikembalikan.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                            >
                                {deleting ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}