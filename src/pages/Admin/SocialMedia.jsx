import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Link2 } from 'lucide-react';
import api from '../../api/client';

export default function AdminSocialMedia() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', link: '', description: '' });

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/social-media');
      setItems(res.data.data || []);
    } catch (err) { setError('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormData({ name: '', link: '', description: '' });
    setEditingItem(null); setError('');
  };

  const handleCreate = () => { resetForm(); setShowModal(true); };
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name || '', link: item.link || '', description: item.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/social-media/${editingItem.id}`, formData);
        setSuccess('Berhasil diupdate!');
      } else {
        await api.post('/social-media', formData);
        setSuccess('Berhasil ditambahkan!');
      }
      setShowModal(false); resetForm(); fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return; setDeleting(true);
    try {
      await api.delete(`/social-media/${deleteId}`);
      setSuccess('Berhasil dihapus!'); setDeleteId(null); fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Gagal menghapus'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D5170]">Social Media</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola link social media</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg font-medium text-sm hover:bg-[#e04f47] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md shadow-red-200">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
          ✅ {success} <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400"><div className="animate-spin w-8 h-8 border-2 border-[#F25C54] border-t-transparent rounded-full mx-auto mb-3"></div>Memuat...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><Link2 className="w-12 h-12 mx-auto mb-3 opacity-30" />Belum ada social media.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Link</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Deskripsi</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#3D5170]">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-blue-500">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.link}</a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.description || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#3D5170]">{editingItem ? 'Edit' : 'Tambah'} Social Media</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}
              <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Nama <span className="text-red-500">*</span></label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none" /></div>
              <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Link <span className="text-red-500">*</span></label><input type="url" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none" /></div>
              <div><label className="block text-sm font-medium text-[#3D5170] mb-1">Deskripsi</label><input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none" /></div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg text-sm hover:bg-[#e04f47] transition disabled:opacity-50">{submitting ? 'Menyimpan...' : editingItem ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-scaleIn">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-lg font-bold text-[#3D5170] mb-2">Hapus?</h3>
            <p className="text-sm text-gray-500 mb-6">Data tidak dapat dikembalikan.</p>
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