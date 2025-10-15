import React from 'react';

const BottomNavbar = () => {
  const url = window.location.pathname;

  const menus = [
    { label: 'Beranda', icon: '/icons/home-6-line.svg', paths: ['/murid/home'] },
    { label: 'Eskul', icon: '/icons/team-line.svg', paths: ['/murid/eskul'] },
    { label: 'Event', icon: '/icons/calendar-event-line.svg', paths: ['/murid/events'] },
    { label: 'Riwayat', icon: '/icons/history-line.svg', paths: ['/murid/riwayat'] },
    { label: 'Profil', icon: '/icons/user-line.svg', paths: ['/murid/profil'] },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#4B0082] px-2 py-1 flex justify-around text-white z-40 rounded-t-xl">
      {menus.map((item) => {
        // Cek apakah path sekarang cocok dengan salah satu path dalam array
        const isActive = item.paths.some((p) => url.startsWith(p));

        return (
          <a
            key={item.label}
            href={item.paths[0]}
            className={`flex flex-col items-center justify-center transition-all duration-200 ${
              isActive ? 'bg-[#E86D1F] rounded-t-full w-12 py-2' : 'py-2'
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

export default BottomNavbar;
