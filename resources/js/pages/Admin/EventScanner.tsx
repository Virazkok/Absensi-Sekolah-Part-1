import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QrScannerComponent from '@/components/absensi/QRScanner';
import { LastScanned, User } from '@/types';
import Sidebar from '@/components/sidebar';
import { Head, router, usePage } from '@inertiajs/react';

type Props = any;

export default function EventScanner() {
  const [scanMode, setScanMode] = useState(false);
  const [lastScanned, setLastScanned] = useState<LastScanned | null>(null);
  const { props } = usePage<Props>();
  const { user } = props;
  const [openEditAccount, setOpenEditAccount] = useState(false);

  const handleScan = async (qrData: string) => {
  let data: {
    qr_token: string; token: string; user_id: number; event_id: number 
};
  try {
    data = JSON.parse(qrData);
    if (!data.qr_token || !data.user_id || !data.event_id) {
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
      body: JSON.stringify(data), 
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

const handleLogout = () => {
  router.post('/logout', {}, {
    onFinish: () => router.visit('/login'),
  });
};



  return (
   <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
          <Head title="Dashboard" />
          <div className="flex flex-1">
            {/* Sidebar */}
            <Sidebar />
    
            {/* Main content */}
            <main className="flex-1 overflow-x-auto p-4">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                <h1 className="text-2xl font-bold">Event Scanner</h1>
                <div className="flex items-center bg-white p-2 gap-10 rounded-xl shadow border">
                  <div className="flex items-center gap-2 p-2">
                    <img src={props.auth?.user?.avatar ?? '/images/avatar-placeholder.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    <div className="text-[16px]">{props.auth?.user?.name ?? 'Admin'}</div>
                  </div>
                  <div>
                  <button onClick={() => setOpenEditAccount(true)} className="p-2 rounded bg-white">⚙️</button>
                  <button onClick={handleLogout} className="p-2 rounded bg-white">🔓</button>
                  </div>
                  
                </div>
              </div>
            <div className="flex-1 flex flex-col items-center justify-center mt-15">
                {!scanMode ? (
                  <>
                    {/* Placeholder kamera */}
                    <div className="w-full h-100 flex items-center justify-center bg-white border-b">
                      <img src='/icons/mdi--camera-off-outline.svg' 
                      className="w-20 h-20 text-gray-400 pb-[20px]" />
                    </div>
              
                    <div className="mt-6">
                      <button
                        onClick={() => setScanMode(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-1 rounded-lg font-medium w-60"
                      >
                        Scan QR Code
                      </button>
                    </div>
                  </>
                ) : (
                  <QrScannerComponent onScan={handleScan} onClose={() => setScanMode(false)} />
                )}
              </div>
              </main>
            </div>

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