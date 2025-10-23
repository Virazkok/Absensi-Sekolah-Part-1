import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QrScannerComponent from '@/components/absensi/QRScanner';
import { LastScanned, User } from '@/types';

export default function EventScanner() {
  const [scanMode, setScanMode] = useState(false);
  const [lastScanned, setLastScanned] = useState<LastScanned | null>(null);

  const handleScan = async (qrData: string) => {
  let data: { token: string; user_id: number; event_id: number };
  try {
    data = JSON.parse(qrData);
    if (!data.token || !data.user_id || !data.event_id) {
      toast.error('Token / user_id / event_id tidak lengkap di QR');
      return;
    }
  } catch {
    toast.error('Format QR bukan JSON');
    return;
  }

  try {
    const getCookie = (name: string) =>
      document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))?.[2] || '';

    const res = await fetch('http://127.0.0.1:8000/api/events/scan-qr', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(getCookie('XSRF-TOKEN')),
      },
      body: JSON.stringify(data),   // <-- no extra wrapper
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || res.statusText);

    toast.success(json.message || 'Sukses');
    setLastScanned(json.registration);
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || 'Terjadi kesalahan');
  }
};

  return (
    <div className="p-6 bg-white rounded shadow text-gray-900">
      <ToastContainer position="top-right" autoClose={5000} />

      {!scanMode ? (
        <button
          onClick={() => setScanMode(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded "
        >
          Mode Scan QR (Event)
        </button>
      ) : (
        <QrScannerComponent onScan={handleScan} onClose={() => setScanMode(false)} />
      )}

      {lastScanned && (
        <div className="mt-6 p-4 border rounded text-gray-900">
          <h3 className="text-lg font-semibold mb-2 ">Data Kehadiran Terakhir</h3>
          <p>Peserta: {lastScanned?.user?.name ?? '-'}</p>
          <p>Kategori: {lastScanned?.registration?.sport_category ?? '-'}</p>
          <p>Waktu: {new Date().toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
}