// resources/js/Pages/Murid/HomeSiswa.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import BottomNavbar from '@/components/Murid/BottomNavbar';
import { Student} from '@/types';
import { Head } from '@inertiajs/react';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

interface User {
  id: number;
  name: string;
  email: string;
  kelas: { id: number; name: string };
  nis: string;
  avatar?: string;
}


const HomeSiswa = () => {
  /* ---------- STATE ---------- */
  const [time, setTime] = useState(new Date());
  const [user, setUser] = useState<User | null>(null);

  const [checkInStatus, setCheckInStatus] = useState('--');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

   useEffect(() => {
    axios.get("/api/student/me").then((res) => setUser(res.data));
  }, []);


  /* ---------- Sinkron BACKEND ---------- */
  useEffect(() => {
    if (!user) return;

    const fetchPresensi = async () => {
      try {
        const response = await axios.get(`/api/kehadiran`);

        const todayDate = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD

        const presensiUser = response.data.find((item: any) => {
          const itemDate = new Date(item.tanggal).toLocaleDateString('sv-SE');
          return item.murid_id === user.id && itemDate === todayDate;
        });

        if (presensiUser) {
          setIsCheckedIn(true);
          setCheckInTime(presensiUser.jam_masuk || null);
          setCheckInStatus(presensiUser.kehadiran || 'Hadir');

          if (presensiUser.jam_keluar) {
            setIsCheckedOut(true);
            setCheckOutTime(presensiUser.jam_keluar);
            setCheckInStatus('Pulang');
          }
          if (presensiUser.jam_terlambat) {
            setIsCheckedOut(true);
            setCheckOutTime(presensiUser.jam_terlambat);
            setCheckInStatus('Terlambat');
          }
        } else {
          setIsCheckedIn(false);
          setIsCheckedOut(false);
          setCheckInTime(null);
          setCheckOutTime(null);
          setCheckInStatus('--');
        }
      } catch (error) {
        console.error('Gagal fetch presensi:', error);
      }
    };

    fetchPresensi();
  }, [user]);



  /* ---------- FORMAT JAM & TGL ---------- */
  const today = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const currentTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  /* ---------- RENDER BUTTON ---------- */
  const renderButton = () => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const totalMinutes = hour * 60 + minute;

    const startCheckIn = 1 * 60 + 0; 
    const endCheckIn = 20 * 60 + 4;
    const startCheckOut = 1 * 60 + 0;
    const endCheckOut = 22 * 60 + 4;

    if (isCheckedIn && !isCheckedOut && totalMinutes >= endCheckOut) {
      setCheckInStatus('-');
    }

    

    if (totalMinutes < startCheckIn || totalMinutes >= endCheckOut) {
      return (
        <div className="mt-10 w-56 h-56 rounded-full bg-gray-200 flex items-center justify-center text-center text-gray-500 shadow-inner">
          Absensi Tutup
        </div>
      );
    }

    if (!isCheckedIn) {
      if (totalMinutes > endCheckIn) {
        return (
          <div className="mt-10 w-56 h-56 rounded-full bg-gray-300 flex items-center justify-center shadow-inner text-lg text-gray-600">
            Absensi ditutup
          </div>
        );
      }
      return (
        <button
          onClick={() => (window.location.href = '/murid/home/qr?mode=in')}
          className="mt-5 w-[160px] h-[160px] rounded-full bg-[#34A853] text-white flex items-center justify-center 
                     text-base font-normal leading-none 
                     shadow-[0px_0px_1px_20px_rgba(144,221,165,100),0px_0px_30px_35px_rgba(144,221,165,100)]"
        >
          Tap Check In
        </button>
      );
    }

    if (isCheckedIn && !isCheckedOut && totalMinutes < startCheckOut) {
      return (
        <div className="mt-10 w-56 h-56 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-600 text-center p-4 font-medium shadow-inner  ">
          Sudah Check In
          <br />Tunggu jam pulang
        </div>
      );
    }

    if (isCheckedIn && !isCheckedOut && totalMinutes >= startCheckOut && totalMinutes < endCheckOut) {
      return (
        <button
         onClick={() => (window.location.href = '/murid/home/qr?mode=out')}
          className="mt-10 w-[180px] h-[180px] rounded-full bg-[#A22C29] text-white flex items-center justify-center 
                      text-base font-normal leading-none 
                      shadow-[0px_0px_1px_20px_rgba(209,74,74,100),0px_0px_30px_35px_rgba(209,74,74,100)]"
        >
          Tap Check Out
        </button>
      );
    }

    if (isCheckedOut) {
      return (
        <div className="mt-10 w-56 h-56 rounded-full bg-green-200 flex items-center justify-center text-lg text-gray-700">
          Sesi sudah selesai
        </div>
      );
    }

    return null;
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex flex-col justify-between items-center pt-4 pb-30 px-4 bg-white">
      <Head title="Home" />
      {/* Avatar & Info */}
      <div className="flex items-center gap-4 w-full">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 shadow">
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt="Foto Profil"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-600">{user?.name || 'Nama Siswa'}</h2>
          <p className="text-gray-600">{user?.kelas?.name || 'Kelas'}</p>
        </div>
        
      </div>

      {/* Jam & Tanggal */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">{currentTime}</h1>
        <p className="text-lg text-gray-700 capitalize">{today}</p>
      </div>

      
      {renderButton()}

      {/* Ringkasan */}
      <div className="w-full mt-4 mb-10 text-center">
        <div className="flex justify-around">
          <div>
            <h4 className="text-gray-500">Status</h4>
            <p className="text-xl font-medium text-gray-600">{checkInStatus}</p>
          </div>
          <div>
            <h4 className="text-gray-500">Waktu</h4>
            <p className="text-xl font-medium text-gray-600">
              {isCheckedOut 
                ? checkOutTime || '-- : --' 
                : checkInTime || '-- : --'}
            </p>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default HomeSiswa;
