// resources/js/Pages/Dashboard.tsx
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QrScannerComponent from "@/components/absensi/QRScanner";
import BottomNavbarOrtu from "@/components/OrangTuGuru/BottomNavbarOrtu"; // Navbar bawah
import { Camera } from "lucide-react";


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

const Dashboard: React.FC<DashboardProps> = ({ auth }) => {
  const [scanMode, setScanMode] = useState(false);

  const handleScan = async (qrData: string) => {
    try {
      const parsedData = JSON.parse(qrData);

      const response = await fetch("http://192.168.1.105:8000/api/scan-qr/check-in", {
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 pb-20">
      <Head title="Dashboard" />
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <div className="bg-purple-700 p-4 flex items-center gap-4">
        <div className="relative w-20 flex-shrink-0">
          <img
            src={auth.user.avatar || "/default-avatar.png"}
            alt="Foto Profil"
            className="w-20 h-20 rounded-full object-cover"
          />
          <button
            type="button"
            className="absolute bottom-1 right-1 bg-orange-500 text-white p-1.5 rounded-full shadow-md"
          >
            <Camera size={16} />
          </button>
        </div>
        <div className="flex flex-col">
          <h1 className="font-semibold text-lg text-white">{auth.user.name}</h1>
          <p className="text-sm text-gray-200">{auth.user.role || "Guru"}</p>
        </div>
      </div>

      {/* Body */}
<div className="flex-1 flex flex-col items-center justify-center h-full">
  {!scanMode ? (
    <>
      {/* Placeholder kamera */}
      <div className="w-full h-50 flex items-center justify-center bg-white border-b">
        <img src='/icons/mdi--camera-off-outline.svg' 
        className="w-16 h-16 text-gray-400 pb-[20px] mb-[120px]" />
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

      {/* Bottom Navbar */}
      <BottomNavbarOrtu />
    </div>
  );
};

export default Dashboard;
