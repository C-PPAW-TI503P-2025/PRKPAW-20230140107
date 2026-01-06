import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SensorPage() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);

  // Fungsi ambil data
  const fetchData = async () => {
    try {
      // Panggil API Backend kita
      const response = await axios.get('http://localhost:3001/api/iot/history');
      const dataSensor = response.data.data;

      // Siapkan sumbu X (Waktu) dan sumbu Y (Nilai)
      // Ambil jam:menit dari createdAt
      const labels = dataSensor.map(item => 
        new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second:'2-digit' })
      );
      
      const dataSuhu = dataSensor.map(item => item.suhu);
      const dataLembab = dataSensor.map(item => item.kelembaban);
      // const dataCahaya = dataSensor.map(item => item.cahaya); // Opsional LDR

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Suhu (°C)',
            data: dataSuhu,
            borderColor: 'rgb(255, 99, 132)', // Merah
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            tension: 0.2, // Garis agak melengkung
          },
          {
            label: 'Kelembaban (%)',
            data: dataLembab,
            borderColor: 'rgb(53, 162, 235)', // Biru
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.2,
          },
        ],
      });
      setLoading(false);
    } catch (err) {
      console.error("Gagal ambil data sensor:", err);
      setLoading(false);
    }
  };

  // Panggil data pertama kali & set Auto Refresh tiap 5 detik
  useEffect(() => {
    fetchData(); // Load awal
    
    const interval = setInterval(() => {
      fetchData(); // Refresh otomatis
    }, 5000);

    return () => clearInterval(interval); // Bersihkan interval saat pindah halaman
  }, []);

  // Opsi tampilan grafik
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monitoring Suhu & Kelembaban Real-time' },
    },
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard IoT</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {loading ? (
          <p className="text-center">Memuat data...</p>
        ) : (
          <Line options={options} data={chartData} />
        )}
      </div>
      
      {/* Tambahan: Kartu Data Terkini */}
      {/* Kamu bisa menambahkan kartu Suhu/Lembab terakhir di sini */}
    </div>
  );
}

export default SensorPage;
