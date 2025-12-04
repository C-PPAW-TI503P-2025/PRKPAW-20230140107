import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// Fix default icon paths for leaflet (required when using webpack/create-react-app)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function getToken() {
  return localStorage.getItem('token');
}

function PresensiPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  // Fungsi untuk mendapatkan lokasi pengguna
  const getLocation = () => {
    setError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setError('Gagal mendapatkan lokasi: ' + error.message);
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setError('Geolocation tidak didukung oleh browser ini.');
    }
  };

  // Dapatkan lokasi saat komponen dimuat
  useEffect(() => {
    getLocation();
  }, []);

  // Fungsi untuk menggunakan koordinat manual
  const applyManualCoords = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setCoords({ lat, lng });
      setError('Koordinat manual digunakan.');
    } else {
      setError('Masukkan koordinat yang valid (desimal).');
    }
  };

  const handleCheckIn = async () => {
    setError('');
    setMessage('');
    try {
      if (!coords || !image) {
        setError('Lokasi dan Foto wajib ada!');
        return;
      }

      // Convert dataURL to blob
      const blob = await (await fetch(image)).blob();

      // Create FormData and append fields
      const formData = new FormData();
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      formData.append('image', blob, 'selfie.jpg');

      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          // Let browser set Content-Type for multipart/form-data with boundary
        },
      };

      const response = await axios.post('/api/presensi/check-in', formData, config);
      setMessage(response.data.message || 'Check-in berhasil');
    } catch (err) {
      setError(err.response ? (err.response.data.message || JSON.stringify(err.response.data)) : 'Check-in gagal');
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setMessage('');
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };
      const response = await axios.post('/api/presensi/check-out', {}, config);
      setMessage(response.data.message || 'Check-out berhasil');
    } catch (err) {
      setError(err.response ? (err.response.data.message || JSON.stringify(err.response.data)) : 'Check-out gagal');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {/* Visualisasi Peta */}
      {coords && (
        <div className="my-4 border rounded-lg overflow-hidden w-full max-w-md">
          <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: '300px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[coords.lat, coords.lng]}>
              <Popup>Lokasi Presensi Anda</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* Card Check-in & Check-out */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Lakukan Presensi</h2>

        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {coords && (
          <p className="text-sm text-gray-600 mb-4">
            Lokasi saat ini: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          </p>
        )}

        {!coords && (
          <p className="text-sm text-gray-500 mb-4">Sedang mengambil lokasi...</p>
        )}

        {/* Tombol untuk mengambil lokasi ulang */}
        <div className="mb-4">
          <button onClick={getLocation} className="text-sm text-blue-600 underline">
            Ambil lokasi ulang
          </button>
        </div>

        {/* Input Koordinat Manual (jika lokasi gagal) */}
        {!coords && (
          <div className="mb-4 text-left">
            <p className="text-xs text-gray-500 mb-2">Jika lokasi tidak tersedia, masukkan koordinat secara manual:</p>
            <div className="flex space-x-2 mb-2">
              <input
                placeholder="Latitude"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="w-1/2 px-2 py-1 border rounded"
              />
              <input
                placeholder="Longitude"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                className="w-1/2 px-2 py-1 border rounded"
              />
            </div>
            <button
              onClick={applyManualCoords}
              className="text-sm py-1 px-3 bg-gray-200 rounded hover:bg-gray-300"
            >
              Gunakan Koordinat Manual
            </button>
          </div>
        )}

        {/* Tampilan Kamera */}
        <div className="my-4 border rounded-lg overflow-hidden bg-black">
          {image ? (
            <img src={image} alt="Selfie" className="w-full" />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
            />
          )}
        </div>

        <div className="mb-4">
          {!image ? (
            <button onClick={capture} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Ambil Foto 📸
            </button>
          ) : (
            <button onClick={() => setImage(null)} className="bg-gray-500 text-white px-4 py-2 rounded w-full">
              Foto Ulang 🔄
            </button>
          )}
        </div>

        {/* Tombol Check-in & Check-out */}
        <div className="flex space-x-4">
          <button
            onClick={handleCheckIn}
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700"
          >
            Check-In
          </button>

          <button
            onClick={handleCheckOut}
            className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700"
          >
            Check-Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default PresensiPage;
