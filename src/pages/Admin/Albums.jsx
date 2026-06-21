import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, ImageIcon, Upload, Search, Eye, Images, Calendar, MapPin } from 'lucide-react';
import api, { BASE_URL } from '../../api/client';

export default function AdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    event_date: '',
    location: '',
    description: '',
    photos: [],
  });
  const [previews, setPreviews] = useState([]);
  const [deletePhotoIds, setDeletePhotoIds] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Detail
  const [detailAlbum, setDetailAlbum] = useState(null);

  // ========== FETCH ==========
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gallery-albums');
      setAlbums(res.data.data || []);
    } catch (err) {
      setError('Gagal memuat data album');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlbums(); }, []);

  // ========== HELPERS ==========
  const resetForm = () => {
    setFormData({ title: '', category: '', event_date: '', location: '', description: '', photos: [] });
    setPreviews([]);
    setDeletePhotoIds([]);
    setExistingPhotos([]);
    setEditingAlbum(null);
    setError('');
  };

  const handleCreate = () => { resetForm(); setShowModal(true); };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title || '',
      category: album.category || '',
      event_date: album.event_date || '',
      location: album.location || '',
      description: album.description || '',
      photos: [],
    });
    setExistingPhotos(album.photos || []);
    setPreviews([]);
    setDeletePhotoIds([]);
    setShowModal(true);
  };

  // Handle multiple photo upload
  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, photos: [...formData.photos, ...files] });
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeNewPhoto = (index) => {
    const newPhotos = [...formData.photos];
    const newPreviews = [...previews];
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    setFormData({ ...formData, photos: newPhotos });
    setPreviews(newPreviews);
  };

  const toggleDeleteExistingPhoto = (photoId) => {
    if (deletePhotoIds.includes(photoId)) {
      setDeletePhotoIds(deletePhotoIds.filter(id => id !== photoId));
    } else {
      setDeletePhotoIds([...deletePhotoIds, photoId]);
    }
  };

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (formData.photos.length === 0 && !editingAlbum) {
      setError('Minimal upload 1 foto');
      setSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('category', formData.category);
      if (formData.event_date) payload.append('event_date', formData.event_date);
      if (formData.location) payload.append('location', formData.location);
      if (formData.description) payload.append('description', formData.description);

      formData.photos.forEach((file) => {
        payload.append('photos[]', file);
      });

      if (deletePhotoIds.length > 0) {
        deletePhotoIds.forEach((id) => {
          payload.append('delete_photos[]', id);
        });
      }

      if (editingAlbum) {
        payload.append('_method', 'PUT');
        await api.post(`/gallery-albums/${editingAlbum.id}`, payload);
        setSuccess('Album berhasil diupdate!');
      } else {
        await api.post('/gallery-albums', payload);
        setSuccess('Album berhasil ditambahkan!');
      }

      setShowModal(false);
      resetForm();
      fetchAlbums();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal menyimpan album';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ========== DELETE ==========
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/gallery-albums/${deleteId}`);
      setSuccess('Album berhasil dihapus!');
      setDeleteId(null);
      fetchAlbums();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menghapus album');
    } finally {
      setDeleting(false);
    }
  };

  // ========== FILTER ==========
  const filteredAlbums = albums.filter((a) =>
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-[#3D5170]">Gallery Album</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola album & foto galeri</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg font-medium text-sm hover:bg-[#e04f47] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-red-200"
        >
          <Plus className="w-4 h-4" /> Tambah Album
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-4 relative animate-slideUp animation-delay-100">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Cari judul, kategori, atau lokasi..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition"
        />
      </div>

      {/* ALERT */}
      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm animate-slideDown">
          ✅ {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* GRID ALBUMS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-[#F25C54] border-t-transparent rounded-full mx-auto mb-3"></div>
            Memuat data...
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-400 animate-fadeIn">
            <Images className="w-12 h-12 mx-auto mb-3 opacity-30" />
            {searchTerm ? 'Tidak ada album yang cocok.' : 'Belum ada album.'}
          </div>
        ) : (
          filteredAlbums.map((album, i) => (
            <div
              key={album.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group animate-scaleIn"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Cover */}
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                {album.cover_url ? (
                  <img
                    src={`${BASE_URL}${album.cover_url}`}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                {album.photo_count > 0 && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
                    <Images className="w-3 h-3" /> {album.photo_count}
                  </span>
                )}
                <span className="absolute top-2 left-2 px-2 py-1 bg-white/90 text-[#F25C54] text-xs font-medium rounded-full">
                  {album.category}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-[#3D5170] text-sm line-clamp-1 mb-1">{album.title}</h3>
                {album.event_date && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> {new Date(album.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
                {album.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> {album.location}
                  </p>
                )}
                {album.description && (
                  <p className="text-xs text-gray-400 line-clamp-2">{album.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex items-center gap-2">
                <button onClick={() => setDetailAlbum(album)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition">
                  <Eye className="w-3 h-3" /> Detail
                </button>
                <button onClick={() => handleEdit(album)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => setDeleteId(album.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========== MODAL DETAIL ========== */}
      {detailAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailAlbum(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#3D5170]">{detailAlbum.title}</h3>
              <button onClick={() => setDetailAlbum(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-red-50 text-[#F25C54] text-xs rounded-full">{detailAlbum.category}</span>
              {detailAlbum.event_date && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(detailAlbum.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              {detailAlbum.location && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {detailAlbum.location}
                </span>
              )}
            </div>
            {detailAlbum.description && <p className="text-sm text-gray-600 mb-4">{detailAlbum.description}</p>}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {detailAlbum.photos?.map((photo) => (
                <a key={photo.id} href={`${BASE_URL}${photo.image_url}`} target="_blank" rel="noopener noreferrer" className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square group">
                  <img src={`${BASE_URL}${photo.image_url}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">{photo.caption}</div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL FORM ========== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-[#3D5170]">{editingAlbum ? 'Edit Album' : 'Tambah Album'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg animate-shake">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Judul Album <span className="text-red-500">*</span></label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D5170] mb-1">Kategori <span className="text-red-500">*</span></label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition">
                    <option value="">Pilih...</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Praktik">Praktik</option>
                    <option value="Pentas">Pentas</option>
                    <option value="Lomba">Lomba</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D5170] mb-1">Tanggal Kegiatan</label>
                  <input type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Lokasi</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="📍 Lokasi kegiatan" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none resize-none transition" />
              </div>

              {/* Existing Photos */}
              {editingAlbum && existingPhotos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#3D5170] mb-2">Foto Saat Ini</label>
                  <div className="grid grid-cols-3 gap-2">
                    {existingPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`relative rounded-lg overflow-hidden bg-gray-100 aspect-square cursor-pointer border-2 transition-all ${
                          deletePhotoIds.includes(photo.id) ? 'border-red-500 opacity-50' : 'border-transparent'
                        }`}
                        onClick={() => toggleDeleteExistingPhoto(photo.id)}
                      >
                        <img src={`${BASE_URL}${photo.image_url}`} alt="" className="w-full h-full object-cover" />
                        {deletePhotoIds.includes(photo.id) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20"><Trash2 className="w-6 h-6 text-white" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Klik foto untuk tandai hapus</p>
                </div>
              )}

              {/* Upload New Photos */}
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">
                  Upload Foto {!editingAlbum && <span className="text-red-500">*</span>}
                  <span className="text-xs text-gray-400 font-normal ml-2">(bisa pilih banyak)</span>
                </label>
                <div className="relative">
                  <input type="file" accept="image/*" multiple onChange={handlePhotosChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F25C54] transition cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Klik untuk upload foto</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (max 5MB per file)</p>
                  </div>
                </div>

                {previews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {previews.map((preview, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square group">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewPhoto(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg text-sm font-medium hover:bg-[#e04f47] transition disabled:opacity-50 shadow-md shadow-red-200">
                  {submitting ? 'Menyimpan...' : editingAlbum ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL DELETE ========== */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-scaleIn">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-lg font-bold text-[#3D5170] mb-2">Hapus Album?</h3>
            <p className="text-sm text-gray-500 mb-6">Album beserta semua foto akan dihapus permanen.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition disabled:opacity-50">{deleting ? 'Menghapus...' : 'Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}