import React, { useEffect, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import BottomNavbar from "@/components/Murid/BottomNavbar";
import { Filter, Settings } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  kelas: { id: number; name: string };
  nis: string;
  avatar?: string;
}

interface Eskul {
  id: number;
  nama: string;
}

const PageProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState("bulan_ini");
  const [type, setType] = useState("sekolah");
  const [eskuls, setEskuls] = useState<Eskul[]>([]);
  const [eskulId, setEskulId] = useState<number | null>(null);

  useEffect(() => {
    axios.get("/api/student/me").then((res) => setUser(res.data));

    // ambil daftar eskul yang diikuti murid
    axios.get("/api/student/eskuls").then((res) => setEskuls(res.data));
  }, []);

  useEffect(() => {
    let endpoint = `/api/student/overview?type=${type}&filter=${filter}`;
    if (type === "eskul" && eskulId) {
      endpoint += `&eskul_id=${eskulId}`;
    }

    axios.get(endpoint).then((res) => setStats(res.data));
  }, [filter, type, eskulId]);

  if (!user || !stats) return <p className="p-4">Loading...</p>;

  const handleLogout = () => {
  router.post('/logout');
};

  return (
    <>
      <div className="min-h-screen bg-white ">
        {/* Header Profile */}
        <div className="bg-purple-900 text-white p-6 flex items-center gap-4 ">
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="Foto Profil"
            className="w-18 h-18 rounded-full object-cover"
          />
          <div>
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="text-sm">{user.kelas?.name}</p>
            <button
              onClick={() => router.visit("/murid/edit-profile")}
              className="text-sm underline flex items-center mt-1 hover:text-purple-200"
            >
              <Settings className="w-4 h-4 mr-1" />
              <span>Ubah Profil</span>
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {/* Filter Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-700" />
            <span className="font-semibold text-gray-800">Filter</span>
          </div>

          <div className="flex gap-4 mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-white text-black border border-orange-400 rounded-md text-sm font-medium"
            >
              <option value="bulan_ini">Bulan ini</option>
              <option value="bulan_lalu">Bulan lalu</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 bg-white text-black border border-orange-400 rounded-md text-sm font-medium"
            >
              <option value="sekolah">Kehadiran Sekolah</option>
              <option value="eskul">Kehadiran Eskul</option>
            </select>

            
          </div>

          {/* Overview Kehadiran */}
          <div className="bg-purple-400 rounded-xl p-4 text-white shadow-md">
            <h3 className="text-sm mb-3">Overview Kehadiran</h3>
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36 mb-2">
                <svg className="w-full h-full">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#ddd"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#4ade80"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="377"
                    strokeDashoffset={377 - (377 * stats.percentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                  {stats.percentage}%
                </span>
              </div>
              {type === "eskul" && (
              <select
                value={eskulId ?? ""}
                onChange={(e) => setEskulId(Number(e.target.value))}
                className="px-3 py-2 bg-white text-black  border-orange-400 rounded-md text-sm font-medium mb-2"
              >
                <option value="">Pilih Eskul</option>
                {eskuls.map((eskul) => (
                  <option key={eskul.id} value={eskul.id}>
                    {eskul.nama}
                  </option>
                ))}
              </select>
            )}

              <p className="text-white text-base mb-3">Detail</p>
              <div className="flex justify-center items-center w-full text-sm">
                <div className="flex flex-col gap-1 text-gray-200 text-xs pr-4">
                  <div className="flex justify-between w-28">
                    <span>Kehadiran</span>
                    <span className="text-white">{stats.hadir}</span>
                  </div>
                  <div className="flex justify-between w-28">
                    <span>Tidak Hadir</span>
                    <span className="text-white">{stats.tidak_hadir}</span>
                  </div>
                  <div className="flex justify-between w-28">
                    <span>Terlambat</span>
                    <span className="text-white">{stats.terlambat}</span>
                  </div>
                </div>

                <div className="h-10 w-[1.5px] bg-purple-900 mx-4"></div>

                <div className="flex flex-col items-start pl-4">
                  <span className="text-gray-200 text-xs">Predikat</span>
                  <span className="text-white text-lg">{stats.predikat}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </>
  );
};

export default PageProfile;
