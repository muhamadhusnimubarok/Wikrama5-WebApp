import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Mail, MessageCircle,
  Heart, BookOpen, Hash, Award, FileText, Download, User, Phone
} from 'lucide-react';
import { publicApi, BASE_URL } from '../api/client';

// SVG Icons (yang tidak ada di Lucide)
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const getKelas = (tahunMasuk) => {
  if (!tahunMasuk) return null;
  const now = new Date();
  const tahunSekarang = now.getFullYear();
  const bulanSekarang = now.getMonth();
  let selisih = tahunSekarang - parseInt(tahunMasuk);
  if (bulanSekarang < 6) selisih -= 1;
  const kelas = selisih + 10;
  if (kelas > 12) return 'alumni';
  if (kelas >= 10 && kelas <= 12) return kelas.toString();
  return '10';
};

export default function DetailSiswa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await publicApi.get(`/member-rayons/${id}`);
        const data = res.data.data;
        setStudent(data);
      } catch (err) {
        console.error('Gagal fetch siswa:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-[#F25C54] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-400">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-lg">Siswa tidak ditemukan</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#F25C54] hover:underline text-sm">← Kembali</button>
      </div>
    );
  }

  const kelas = getKelas(student.tahun_masuk);
  const kelasLabel = kelas === 'alumni' ? 'Alumni' : kelas ? `Kelas ${kelas}` : '-';
  const kelasColor = {
    '10': 'bg-green-50 text-green-700 border-green-200',
    '11': 'bg-blue-50 text-blue-700 border-blue-200',
    '12': 'bg-orange-50 text-orange-700 border-orange-200',
    'alumni': 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </div>

      {/* Tambahan margin-top (mt-20 sm:mt-24) agar ada ruang untuk foto yang menjulur ke atas */}
      <div className="max-w-4xl mx-auto px-4 py-6 mt-20 sm:mt-24">
        
        {/* HAPUS 'overflow-hidden' dari baris di bawah ini */}
        <div className="bg-white rounded-[2rem] shadow-md border border-gray-100">

          {/* Foto Section - DI ATAS TENGAH */}
          <div className="relative pb-4 px-6 flex flex-col items-center">
            {/* Foto Container - setengah di luar card */}
            <div className="relative z-10 -mt-20 sm:-mt-24 mb-4">
              {student.foto_url ? (
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden ring-[6px] ring-white shadow-xl bg-white">
                  <img
                    src={`${BASE_URL}${student.foto_url}`}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full ring-[6px] ring-white shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <User className="w-18 h-18 text-gray-400" />
                </div>
              )}
            </div>

            {/* Name & Badge */}
            <div className="text-center mt-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {student.name}
              </h1>
              {student.nama_panggilan && (
                <p className="text-gray-500 text-sm mb-3">"{student.nama_panggilan}"</p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {kelas && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${kelasColor[kelas] || 'bg-gray-100 text-gray-600'}`}>
                    {kelasLabel}
                  </span>
                )}
                {student.nis && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {student.nis}
                  </span>
                )}
                {student.rombel && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {student.rombel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detail Info Grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kolom Kiri */}
            <div className="space-y-3">
              {student.tempat_tanggal_lahir && (
                <InfoRow icon={Calendar} label="Tempat, Tanggal Lahir" value={student.tempat_tanggal_lahir} />
              )}
              {student.jenis_kelamin && (
                <InfoRow icon={User} label="Jenis Kelamin" value={student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
              )}
              {student.alamat && (
                <InfoRow icon={MapPin} label="Alamat" value={student.alamat} />
              )}
              {student.hobi_minat && (
                <InfoRow icon={Heart} label="Hobi & Minat" value={student.hobi_minat} />
              )}
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-3">
              {student.user?.email && (
                <InfoRow icon={Mail} label="Email" value={student.user.email} />
              )}
              {student.kontak_wa && (
                <InfoRow icon={MessageCircle} label="WhatsApp" value={student.kontak_wa} isLink href={`https://wa.me/${student.kontak_wa.replace(/[^0-9]/g, '')}`} />
              )}
              {student.instagram && (
                <InfoRow icon={InstagramIcon} label="Instagram" value={`@${student.instagram.replace('@', '')}`} isLink href={`https://instagram.com/${student.instagram.replace('@', '')}`} />
              )}
              {student.linkedin && (
                <InfoRow icon={LinkedinIcon} label="LinkedIn" value={student.linkedin} isLink href={student.linkedin} />
              )}
            </div>
          </div>

          {/* Deskripsi */}
          {student.deskripsi_profil && (
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm text-gray-600 italic leading-relaxed">
                  "{student.deskripsi_profil}"
                </p>
              </div>
            </div>
          )}

          {/* Sertifikat */}
          {student.sertifikat_urls && student.sertifikat_urls.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#F25C54]" /> Sertifikat
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {student.sertifikat_urls.map((url, i) => {
                  const fullUrl = `${BASE_URL}${url}`;
                  const isPDF = url.toLowerCase().endsWith('.pdf');

                  return (
                    <a
                      key={i}
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square border border-gray-200 hover:shadow-md transition-all"
                    >
                      {isPDF ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-red-50 group-hover:bg-red-100 transition">
                          <FileText className="w-8 h-8 text-red-500 mb-1" />
                          <p className="text-xs text-red-600 text-center truncate w-full">{url.split('/').pop()}</p>
                        </div>
                      ) : (
                        <img src={fullUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <Download className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen InfoRow
function InfoRow({ icon: Icon, label, value, isLink, href }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        {isLink && href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#F25C54] hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-gray-700 break-all">{value}</p>
        )}
      </div>
    </div>
  );
}