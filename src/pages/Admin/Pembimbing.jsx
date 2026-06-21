import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Award, Upload, Phone, MapPin } from 'lucide-react';
import api, { BASE_URL } from '../../api/client';

export default function AdminPembimbing() {
  const [pembimbingList, setPembimbingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    contack_wa: '',
    description: '',
    job_list: '',
    address: '',
    link_foto: null,
  });
  const [previewFoto, setPreviewFoto] = useState(null);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ========== FETCH ==========
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pembimbing-siswas');
      setPembimbingList(res.data.data || []);
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ========== HELPERS ==========
  const resetForm = () => {
    setFormData({
      name: '', position: '', contack_wa: '', description: '',
      job_list: '', address: '', link_foto: null,
    });
    setPreviewFoto(null);
    setEditingItem(null);
    setError('');
  };

  const handleCreate = () => { resetForm(); setShowModal(true); };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      position: item.position || '',
      contack_wa: item.contack_wa || '',
      description: item.description || '',
      job_list: typeof item.job_list === 'string' ? item.job_list : JSON.stringify(item.job_list || []),
      address: item.address || '',
      link_foto: null,
    });
    setPreviewFoto(item.foto_url ? `${BASE_URL}${item.foto_url}` : null);
    setShowModal(true);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, link_foto: file });
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'link_foto' && value) {
          payload.append('link_foto', value);
        } else if (key !== 'link_foto' && value !== '' && value !== null) {
          payload.append(key, value);
        }
      });

      if (editingItem) {
        payload.append('_method', 'PUT');
        await api.post(`/pembimbing-siswas/${editingItem.id}`, payload);
        setSuccess('Pembimbing berhasil diupdate!');
      } else {
        await api.post('/pembimbing-siswas', payload);
        setSuccess('Pembimbing berhasil ditambahkan!');
      }

      setShowModal(false);
      resetForm();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  // ========== DELETE ==========
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/pembimbing-siswas/${deleteId}`);
      setSuccess('Pembimbing berhasil dihapus!');
      setDeleteId(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-[#3D5170]">Pembimbing Siswa</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data pembimbing</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg font-medium text-sm hover:bg-[#e04f47] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-red-200"
        >
          <Plus className="w-4 h-4" /> Tambah Pembimbing
        </button>
      </div>

      {/* ALERT */}
      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm animate-slideDown">
          ✅ {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* GRID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-[#F25C54] border-t-transparent rounded-full mx-auto mb-3"></div>
            Memuat data...
          </div>
        ) : pembimbingList.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-400 animate-fadeIn">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            Belum ada pembimbing.
          </div>
        ) : (
          pembimbingList.map((item, i) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-300 animate-scaleIn group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Foto + Info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {item.foto_url ? (
                    <img
                      src={`${BASE_URL}${item.foto_url}`}
                      alt={item.name}
                      className="w-16 h-16 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <Award className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#3D5170] truncate">{item.name}</h3>
                  <p className="text-sm text-[#F25C54] font-medium">{item.position}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                {item.contack_wa && (
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {item.contack_wa}</p>
                )}
                {item.address && (
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.address}</p>
                )}
                {item.description && (
                  <p className="line-clamp-2">{item.description}</p>
                )}
                {item.job_list && (
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {typeof item.job_list === 'string' ? item.job_list : JSON.stringify(item.job_list)}
                  </p>
                )}
              </div>

              {/* Aksi */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                >
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========== MODAL FORM ========== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-[#3D5170]">
                {editingItem ? 'Edit Pembimbing' : 'Tambah Pembimbing'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg animate-shake">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Nama <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Jabatan <span className="text-red-500">*</span></label>
                <input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Kontak WA</label>
                <input type="text" value={formData.contack_wa} onChange={(e) => setFormData({ ...formData, contack_wa: e.target.value })} placeholder="08123456789" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Alamat</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none resize-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none resize-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">
                  Job List <span className="text-xs text-gray-400">(satu per baris)</span>
                </label>
                <textarea
                  value={formData.job_list}
                  onChange={(e) => setFormData({ ...formData, job_list: e.target.value })}
                  rows={4}
                  placeholder="Pembina Akhlak Mulia&#10;Pembimbing Rayon&#10;Guru Bahasa Inggris"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none resize-none transition font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Foto</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={handleFotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center group-hover:border-[#F25C54] transition cursor-pointer">
                    {previewFoto ? (
                      <img src={previewFoto} alt="Preview" className="h-20 mx-auto rounded-full" />
                    ) : (
                      <div className="space-y-1"><Upload className="w-6 h-6 mx-auto text-gray-300" /><p className="text-xs text-gray-400">Klik untuk upload foto</p></div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg text-sm hover:bg-[#e04f47] transition disabled:opacity-50 shadow-md shadow-red-200">
                  {submitting ? 'Menyimpan...' : editingItem ? 'Update' : 'Simpan'}
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
            <h3 className="text-lg font-bold text-[#3D5170] mb-2">Hapus Pembimbing?</h3>
            <p className="text-sm text-gray-500 mb-6">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition disabled:opacity-50">
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}