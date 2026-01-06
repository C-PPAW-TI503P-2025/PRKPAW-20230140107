import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const user = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (e) {
      return null;
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-semibold text-indigo-600">MyClass</Link>
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-800">Dashboard</Link>
            <Link to="/monitoring" className="text-sm text-gray-600 hover:text-gray-800">Monitoring Suhu</Link>
            <Link to="/presensi" className="text-sm text-gray-600 hover:text-gray-800">Presensi</Link>
            {user && user.role === 'admin' && (
              <Link to="/reports" className="text-sm text-gray-600 hover:text-gray-800">Laporan Admin</Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">{user.nama || user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="py-1 px-3 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">Login</Link>
                <Link to="/register" className="text-sm text-gray-600 hover:text-gray-800">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
