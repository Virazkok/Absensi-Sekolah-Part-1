import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Sidebar() {
  const [openScanMenu, setOpenScanMenu] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname.toLowerCase());
  }, []);

  const isActive = (path: string) => currentPath.startsWith(path.toLowerCase());

  useEffect(() => {
  if (
    currentPath.startsWith("/admin/scan/checkin") ||
    currentPath.startsWith("/admin/scan/checkout") ||
    currentPath.startsWith("/admin/scan/event")
  ) {
    setOpenScanMenu(true);
  }
}, [currentPath]);



  return (
    <div className="w-64 bg-white text-black min-h-screen p-4 flex flex-col space-y-2 shadow-md text-sm">
      <div
        onClick={() => (window.location.href = "/Admin/Dashboard")}
        className={`p-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${
          isActive("/admin/dashboard")
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200"
        }`}
      >
        <img
              src={
                isActive("/admin/dashboard")
                  ? "/icons/ri--dashboard-lineW.svg"
                  : "/icons/ri--dashboard-line.svg"
              }
              alt=""
            />
        Dashboard
      </div>

      {/* === Scan QR Expandable === */}
      <div>
        <button
          onClick={() => setOpenScanMenu(!openScanMenu)}
          className={`flex items-center justify-between w-full rounded-md transition-colors cursor-pointer p-2 ${
            isActive("/admin/scan")
          }`}
        >
          <div className="flex items-center gap-2">
           <img src={"/icons/ri--qr-scan-2-line.svg"} alt=""/>

            <span>Scan QR</span>
          </div>
          {openScanMenu ? (
            <ChevronDown size={18} className="text-gray-500" />
          ) : (
            <ChevronRight size={18} className="text-gray-500" />
          )}
        </button>

        {/* Submenu */}
        {openScanMenu && (
          <div className="ml-6 mt-1 flex flex-col space-y-1 text-sm">
            <Link
              href="/Admin/Scan/CheckIn"
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                isActive("/Admin/Scan/CheckIn")
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Scan Check In
            </Link>
            <Link
              href="/Admin/Scan/CheckOut"
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                isActive("/Admin/Scan/CheckOut")
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Scan Check Out
            </Link>
            <Link
              href="/Admin/Scan/Event"
              className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                isActive("/Admin/Scan/Event")
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Scan Event
            </Link>
          </div>
        )}
      </div>

      {/* === Menu Lain === */}
      <div
        onClick={() => (window.location.href = "/Admin/UserManagement")}
        className={`p-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${
          isActive("/admin/usermanagement")
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200"
        }`}
      >
       <img
              src={
                isActive("/admin/usermanagement")
                  ? "/icons/ri--user-settings-lineW.svg"
                  : "/icons/ri--user-settings-line.svg"
              }
              alt=""
            />
        User Manajemen
      </div>

      <div
        onClick={() => (window.location.href = "/admin/events")}
        className={`p-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${
          isActive("/admin/events")
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200"
        }`}
      >
         <img
              src={
                isActive("/admin/events")
                  ? "/icons/ri--list-settings-lineW.svg"
                  : "/icons/ri--list-settings-line.svg"
              }
              alt=""
            />
        Event Manajemen
      </div>

      <div
        onClick={() => (window.location.href = "/admin/eskul")}
        className={`p-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${
          isActive("/admin/eskul")
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200"
        }`}
      >
        <img
              src={
                isActive("/admin/eskul")
                  ? "/icons/ri--user-community-lineW.svg"
                  : "/icons/ri--user-community-line.svg"
              }
              alt=""
            />
        Ekstrakurikuler
      </div>

      <div
        onClick={() => (window.location.href = "/admin/riwayat-kehadiran")}
        className={`p-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${
          isActive("/admin/riwayat-kehadiran")
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200"
        }`}
      >
         <img
              src={
                isActive("/admin/riwayat-kehadiran")
                  ? "/icons/ri--history-lineW.svg"
                  : "/icons/ri--history-line.svg"
              }
              alt=""
            />
        Riwayat Kehadiran
      </div>

      <div
        onClick={() => (window.location.href = "/admin/statistik-kehadiran")}
        className={`p-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${
          isActive("/admin/statistik-kehadiran")
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200"
        }`}
      >
        <img
              src={
                isActive("/admin/statistik-kehadiran")
                  ? "/icons/ri--pie-chart-2-lineW.svg"
                  : "/icons/ri--pie-chart-2-line.svg"
              }
              alt=""
            />
        Statistik Kehadiran
      </div>

      <div
        onClick={() => (window.location.href = "/admin/laporan-kehadiran")}
        className={`p-2 rounded cursor-pointer flex items-center gap-2 transition-colors ${
          isActive("/admin/laporan-kehadiran")
            ? "bg-orange-500 text-white"
            : "hover:bg-gray-200"
        }`}
      >
        <img
              src={
                isActive("/admin/laporan-kehadiran")
                  ? "/icons/ri--file-text-lineW.svg"
                  : "/icons/ri--file-text-line.svg"
              }
              alt=""
            />
        Laporan
      </div>
    </div>
  );
}
