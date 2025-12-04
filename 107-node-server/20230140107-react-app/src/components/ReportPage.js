import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const getPhotoUrl = (buktiFoto) => {
    if (!buktiFoto) return null;
    if (buktiFoto.startsWith('http')) return buktiFoto;
    return buktiFoto.startsWith('/') ? buktiFoto : `/${buktiFoto}`;
  };

  const fetchReports = async (queryName = '') => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {},
      };

      if (queryName) config.params.nama = queryName;
      if (tanggalMulai) config.params.tanggalMulai = tanggalMulai;
      if (tanggalSelesai) config.params.tanggalSelesai = tanggalSelesai;

      setError(null);
      const res = await axios.get('/api/reports/daily', config);
      setReports(res.data.data || []);
    } catch (err) {
      setError(err.response ? (err.response.data.message || JSON.stringify(err.response.data)) : 'Gagal mengambil laporan');
    }
  };

  useEffect(() => {
    fetchReports('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchTerm);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchTerm);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Laporan Presensi Harian</h1>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex space-x-2">
        <input
          type="text"
          placeholder="Cari berdasarkan nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded">Cari</button>
      </form>

      <form onSubmit={handleFilterSubmit} className="mb-6 flex items-center space-x-2">
        <label className="text-sm">Dari:</label>
        <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="px-2 py-1 border rounded" />
        <label className="text-sm">Sampai:</label>
        <input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} className="px-2 py-1 border rounded" />
        <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded">Terapkan</button>
      </form>

      {error && <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

      {!error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti Foto</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length > 0 ? (
                reports.map((presensi) => (
                  <tr key={presensi.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{presensi.user ? presensi.user.nama : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(presensi.checkIn).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{presensi.checkOut ? new Date(presensi.checkOut).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'Belum Check-Out'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presensi.buktiFoto ? (
                        (() => {
                          const src = getPhotoUrl(presensi.buktiFoto);
                          return (
                            <img
                              src={src}
                              alt={`Bukti ${presensi.id}`}
                              className="w-16 h-16 object-cover rounded cursor-pointer border"
                              onClick={() => { setModalImage(src); setModalOpen(true); }}
                            />
                          );
                        })()
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Tidak ada data yang ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Image modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded shadow-lg max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-2 text-right">
              <button onClick={() => setModalOpen(false)} className="px-3 py-1 bg-red-600 text-white rounded">Tutup</button>
            </div>
            <div className="p-4">
              <img src={modalImage} alt="Full size" className="max-w-full max-h-[80vh] mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPage;
