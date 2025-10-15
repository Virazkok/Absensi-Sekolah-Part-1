import React from "react";

const BottomNavbarOrtu = () => {
  const currentPath = window.location.pathname;

  const menus = [
    { label: "Beranda", icon: "/icons/home-6-line.svg", path: "/parent-teacher/dashboard" },
    { label: "Scan QR", icon: "/icons/ri--qr-scan-2-line.svg", path: "/parent-teacher/scan-qr" },
    { label: "Riwayat", icon: "/icons/history-line.svg", path: "/parent-teacher/attendance-history?type=sekolah" },
    { label: "Profil", icon: "/icons/user-line.svg", path: "/parent-teacher/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#4B0082] px-2 py-1 flex justify-around text-white z-40 rounded-t-xl">
      {menus.map((item) => {
        const isActive = currentPath === new URL(item.path, window.location.origin).pathname;
        return (
          <a
            key={item.label}
            href={item.path}
            className={`flex flex-col items-center justify-center transition-colors duration-200 ${
              isActive ? "bg-[#E86D1F] rounded-t-full w-12 py-2" : "py-2"
            }`}
          >
            <div className="flex items-center justify-center w-6 h-6">
              <img
                src={item.icon}
                alt={item.label}
                className="w-6 h-6 filter invert brightness-0"
              />
            </div>
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        );
      })}
    </div>
  );
};

export default BottomNavbarOrtu;
