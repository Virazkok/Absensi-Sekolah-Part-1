// resources/js/Pages/Dashboard.tsx
import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QrScannerComponent from "@/components/absensi/QRScanner";
import BottomNavbarOrtu from "@/components/OrangTuGuru/BottomNavbarOrtu"; // Navbar bawah
import { Camera } from "lucide-react";
import Sidebar from "@/components/sidebar";



interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
}

interface DashboardProps {
  auth: {
    user: User;
  };
}

type Props = any;

const Dashboard: React.FC<DashboardProps> = ({ auth }) => {
  const [scanMode, setScanMode] = useState(false);
  const { props } = usePage<Props>();
  const { user } = props;
  const [openEditAccount, setOpenEditAccount] = useState(false);

  const handleScan = async (qrData: string) => {
    try {
      const parsedData = JSON.parse(qrData);

      const response = await fetch("http://127.0.0.1:8000/api/scan-qr/check-in", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") || "",
        },
        body: JSON.stringify({ qr_data: parsedData }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Absensi berhasil dicatat!");
      } else {
        toast.error(data.message || "Gagal mencatat absensi");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  };

  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }

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
            <h1 className="text-2xl font-bold">Check In Scanner</h1>
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
      </div>  
  );
}


export default Dashboard;
