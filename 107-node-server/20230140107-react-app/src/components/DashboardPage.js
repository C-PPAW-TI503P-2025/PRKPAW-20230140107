import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function DashboardPage() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [name, setName] = useState('Pengguna');

  useEffect(() => {
    // update clock every second
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // try to decode token to show user's name (if present)
    try {
      const token = localStorage.getItem('token');
      if (token && typeof jwtDecode === 'function') {
        const decoded = jwtDecode(token);
        // try common claim names
        setName(decoded.nama || decoded.name || decoded.username || decoded.email || 'Pengguna');
      }
    } catch (e) {
      // ignore decode errors
    }
  }, []);

  const handleLogout = () => {
    // 1) remove token
    localStorage.removeItem('token');
    // 2) navigate back to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-green-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Halo, {name} 👋</h2>
            <p className="text-sm text-gray-600">Selamat datang di dashboard Anda</p>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-sm">Waktu saat ini</div>
            <div className="text-lg font-mono text-gray-800">{now.toLocaleString()}</div>
          </div>
        </header>

        <main>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-5 rounded-lg shadow flex flex-col">
              <div className="text-sm text-gray-500">Total Check-ins</div>
              <div className="mt-2 text-3xl font-bold text-indigo-600">—</div>
              <div className="mt-3 text-xs text-gray-400">Data real-time akan ditampilkan di sini</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow flex flex-col">
              <div className="text-sm text-gray-500">Total Check-outs</div>
              <div className="mt-2 text-3xl font-bold text-green-600">—</div>
              <div className="mt-3 text-xs text-gray-400">Filter laporan untuk melihat riwayat</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow flex flex-col">
              <div className="text-sm text-gray-500">Active Today</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600">—</div>
              <div className="mt-3 text-xs text-gray-400">Jumlah pengguna yang aktif hari ini</div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Ringkasan Presensi</h3>
              <p className="text-sm text-gray-600">Gunakan menu Reports pada API untuk mengambil laporan harian dan rentang tanggal.</p>
              <div className="mt-4">
                <div className="w-full h-40 bg-gradient-to-r from-indigo-100 to-green-100 rounded"></div>
              </div>
            </div>

            <aside className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-indigo-600">{(name||'U').charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-center">
                <div className="font-semibold">{name}</div>
                <div className="text-xs text-gray-500">Member sejak: —</div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                </svg>
                Logout
              </button>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;

