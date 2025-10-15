import React, { useEffect, useState } from 'react';



const HomeSiswa = () => {
  
  const [time, setTime] = useState(new Date());
  const [user, setUser] = useState({ nama: '', kelas: '', avatar: '', email: '' });

  const [checkInStatus, setCheckInStatus] = useState('--');
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);

  const jamPulang = 16;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



  const today = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const currentTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  

  return (
    <div className="min-h-screen flex flex-col justify-between items-center pt-10 pb-24 px-4 bg-gray-50">

      <div className="flex items-center gap-4 w-full">
        <img
          src={user.avatar || '/profile.png'}
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user.nama || 'Nama Siswa'}</h2>
          <p className="text-gray-500">{user.kelas || 'Kelas'}</p>
        </div>
      </div>

      <div className="text-center mt-8">
        <h1 className="text-6xl font-extrabold text-gray-900">{currentTime}</h1>
        <p className="text-lg text-gray-500 capitalize">{today}</p>
      </div>

      {!isCheckedIn ? (
        <button
          
          className="mt-10 w-[214px] h-[214px] rounded-full bg-[#34A853] text-white flex items-center justify-center 
                     text-base font-normal leading-none 
                     shadow-[5px_5px_30px_2px_rgba(52,168,83,0.5),-5px_-5px_30px_2px_rgba(52,168,83,0.5)]"
        >
          Tap Check In
        </button>
      ) : !isCheckedOut ? (
        time.getHours() >= jamPulang ? (
          <button 
            
            className="mt-10 w-[214px] h-[214px] rounded-full bg-[#A22C29] text-white flex items-center justify-center 
                      text-base font-normal leading-none 
                      shadow-[5px_5px_30px_2px_rgba(162,44,41,0.5),-5px_-5px_30px_2px_rgba(162,44,41,0.5)]"
          >
            Tap Check Out
          </button>
        ) : (
          <div className="mt-10 w-56 h-56 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-600 text-center p-4 font-medium shadow-inner">
            ✅ Sudah Check In<br />Tunggu jam pulang
          </div>
        )
      ) : (
        <div className="mt-10 w-56 h-56 rounded-full bg-blue-100 flex items-center justify-center text-lg text-blue-700 font-semibold shadow-md">
          ✅ Sudah Pulang
        </div>
      )}

      <div className="w-full mt-8">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex justify-around">
            <div className="text-center">
              <h4 className="text-gray-500 text-sm">Status</h4>
              <p className="text-lg font-bold text-gray-800">
                {!isCheckedIn ? '--' : !isCheckedOut ? 'Hadir' : 'Pulang'}
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-gray-500 text-sm">Waktu</h4>
              <p className="text-lg font-bold text-gray-800">
                {!isCheckedIn ? '-- : --' : !isCheckedOut ? checkInTime : checkOutTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default HomeSiswa;
