import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Quote, Search } from 'lucide-react';
import api from '../../api/client';

const YEARS = ['all', '2030', '2029', '2028', '2027', '2026', '2025', '2024', '2023'];

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ quote: '', author: '', position: '', year: '' });

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch
  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quotes');
      setQuotes(res.data.data || []);
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuotes(); }, []);

  // Helpers
  const resetForm = () => {
    setFormData({ quote: '', author: '', position: '', year: '' });
    setEditingItem(null);
    setError('');
  };

  const handleCreate = () => { resetForm(); setShowModal(true); };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      quote: item.quote || '',
      author: item.author || '',
      position: item.position || '',
      year: item.year?.toString() || '',
    });
    setShowModal(true);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = { ...formData, year: formData.year ? parseInt(formData.year) : null };

      if (editingItem) {
        await api.put(`/quotes/${editingItem.id}`, payload);
        setSuccess('Quote berhasil diupdate!');
      } else {
        await api.post('/quotes', payload);
        setSuccess('Quote berhasil ditambahkan!');
      }

      setShowModal(false);
      resetForm();
      fetchQuotes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/quotes/${deleteId}`);
      setSuccess('Quote berhasil dihapus!');
      setDeleteId(null);
      fetchQuotes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  // Filter
  const filtered = quotes.filter(q => {
    const matchSearch = !searchTerm ||
      q.quote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchYear = filterYear === 'all' || q.year?.toString() === filterYear;
    return matchSearch && matchYear;
  });

  return (
    <div className="animate-fadeIn">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3D5170]">Quotes Pembimbing</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola kata-kata motivasi per tahun</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#F25C54] text-white rounded-lg font-medium text-sm hover:bg-[#e04f47] hover:scale-105 active:scale-95 transition-all shadow-md shadow-red-200">
          <Plus className="w-4 h-4" /> Tambah Quote
        </button>
      </div>

      {/* FILTER + SEARCH */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Cari quote atau author..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {YEARS.map(y => (
            <button key={y} onClick={() => setFilterYear(y)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterYear === y ? 'bg-[#F25C54] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              {y === 'all' ? 'Semua' : y}
            </button>
          ))}
        </div>
      </div>

      {/* ALERT */}
      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm animate-slideDown">
          ✅ {success} <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400"><div className="animate-spin w-8 h-8 border-2 border-[#F25C54] border-t-transparent rounded-full mx-auto mb-3"></div>Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400"><Quote className="w-12 h-12 mx-auto mb-3 opacity-30" />Belum ada quote.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Quote</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Author</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Posisi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tahun</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700 italic line-clamp-2 max-w-md">"{item.quote}"</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#3D5170]">{item.author}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.position || '-'}</td>
                  <td className="px-4 py-3">
                    {item.year ? (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">{item.year}</span>
                    ) : <span className="text-xs text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3">
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
              <h3 className="text-lg font-bold text-[#3D5170]">{editingItem ? 'Edit' : 'Tambah'} Quote</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Quote <span className="text-red-500">*</span></label>
                <textarea value={formData.quote} onChange={(e) => setFormData({ ...formData, quote: e.target.value })} required rows={3}
                  placeholder="Tulis kata-kata motivasi..." className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none resize-none transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#3D5170] mb-1">Author <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} required
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D5170] mb-1">Posisi</label>
                  <input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Pembimbing" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D5170] mb-1">Tahun</label>
                <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-[#F25C54] outline-none transition">
                  <option value="">Semua Tahun</option>
                  {[2030, 2029,2028,2027,2026, 2025, 2024, 2023,].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
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

      {/* MODAL DELETE */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-scaleIn">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-lg font-bold text-[#3D5170] mb-2">Hapus Quote?</h3>
            <p className="text-sm text-gray-500 mb-6">Quote yang dihapus tidak dapat dikembalikan.</p>
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