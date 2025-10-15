"use client";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import BottomNavbar from "@/components/Murid/BottomNavbar";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://192.168.1.105:8000";

interface Student {
  id: number;
  name: string;
  avatar?: string;
  kelas?: { name: string };
}

// Format tanggal hanya tanggal dan bulan (contoh: 1 Juli)
const formatShortDate = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return '-';
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long"
    });
  } catch {
    return dateString;
  }
};

// Format jam dari string waktu
const formatTime = (timeString?: string) => {
  if (!timeString || timeString === '-') return "-";
  return timeString.includes(':') ? timeString.split(':').slice(0, 2).join(':') : timeString;
};

export default function RiwayatPage() {
  const [type, setType] = useState<"sekolah" | "eskul" | "event">("sekolah");
  const [mode, setMode] = useState<"weekly" | "monthly" | "range">("weekly");
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<Student | null>(null);
  const [searchEvent, setSearchEvent] = useState("");

  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser && storedUser.id) setUser(storedUser);
  }, []);

  useEffect(() => {
    setData([]);
    setSummary({});
    setSearchEvent("");
    setMode(type === "event" ? "range" : "weekly");
    setCurrentWeek(0);
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [type, mode, currentWeek, selectedMonth, selectedYear, user]);

  async function fetchData() {
    if (!user) return;
    try {
      setLoading(true);
      let url = `/api/riwayat?type=${type}`;
      
      if (type !== "event") {
        url += mode === "weekly" 
          ? `&mode=weekly&week=${currentWeek}`
          : `&mode=monthly&month=${selectedMonth + 1}&year=${selectedYear}`;
      }

      const res = await axios.get(url);
      setData(Array.isArray(res.data.data) ? res.data.data : []);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  const getWeekDateRange = (weekOffset: number) => {
    const now = new Date();
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() + weekOffset * 7);
    
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { start: startOfWeek, end: endOfWeek };
  };

  const formatDate = (date: Date) => date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const filteredData = type === "event" && searchEvent
    ? data.filter(item => item.event_name?.toLowerCase().includes(searchEvent.toLowerCase()))
    : data;

  const renderTableHeaders = () => {
    const headers = {
      sekolah: ["Tanggal", "Check In", "Check Out", "Keterangan"],
      eskul: ["Tanggal", "Keterangan", "Nama Eskul"],
      event: ["Tanggal", "Nama Event", "Keterangan"]
    };
    
    return headers[type].map((header, index) => (
      <th key={index} className="py-2 px-2">{header}</th>
    ));
  };

  const renderTableRow = (row: any) => {
    if (type === "sekolah") {
      return (
        <>
          <td className="py-2 px-2">{formatShortDate(row.tanggal)}</td>
          <td className="py-2 px-2">{formatTime(row.jam_masuk)}</td>
          <td className="py-2 px-2">{formatTime(row.jam_keluar)}</td>
          <td className="py-2 px-2 capitalize">
            {row.kehadiran === 'hadir' ? 'Hadir' : 
             row.kehadiran === 'absen' ? 'Tidak Hadir' : 
             row.kehadiran === 'terlambat' ? 'Terlambat' : row.kehadiran}
          </td>
        </>
      );
    }
    
    if (type === "eskul") {
      return (
        <>
          <td className="py-2 px-2">{formatShortDate(row.tanggal)}</td>
          <td className="py-2 px-2 capitalize">
            {row.status === 'hadir' ? 'Hadir' : 
             row.status === 'absen' ? 'Tidak Hadir' : row.status}
          </td>
          <td className="py-2 px-2">{row.eskul_name}</td>
        </>
      );
    }
    
    // Untuk event, selalu tampilkan "Mengikuti" karena data sudah ada di database
    return (
      <>
        <td className="py-2 px-2">{formatShortDate(row.tanggal)}</td>
        <td className="py-2 px-2">{row.event_name}</td>
        <td className="py-2 px-2 capitalize text-gray-600 font-medium">
          Mengikuti
        </td>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white p-4 text-gray-900 pb-20">
      {/* Header Profil */}
      <div className="flex items-center gap-3 mb-4 ">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 shadow">
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="Foto Profil"
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-avatar.png";
            }}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{user?.name || "Nama Siswa"}</h2>
          <p className="text-sm text-gray-600">{user?.kelas?.name || "Kelas"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-10 mb-3">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          <span className="text-sm">Filter </span>
        </div>

      {/* Tab Riwayat */}
      <div className="flex overflow-x-auto gap-2 mb-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ">
        {(["sekolah", "eskul", "event"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setType(tab)}
            className={` px-4 py-2 rounded-xl text-sm shadow-[7px_7px_10px_-2px_rgba(0,_0,_0,_0.25)] w-28.25 text-[12px] ${
              type === tab 
                ? "bg-orange-500 text-white" 
                : "border border-orange-500"
            }`}
          >
            Riwayat {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      

      {/* Ringkasan */}
      {(type === "sekolah" || type === "eskul") && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-purple-300 rounded-xl shadow text-center py-3 shadow-[7px_7px_10px_-2px_rgba(0,_0,_0,_0.25)] ">
            <p className="font-semibold">{summary.hadir ?? 0}</p>
            <p className="text-sm ">Hadir</p>
          </div>
          <div className="flex-1 bg-purple-300 rounded-xl shadow text-center py-3 shadow-[7px_7px_10px_-2px_rgba(0,_0,_0,_0.25)]">
            <p className="font-semibold">{summary.absen ?? 0}</p>
            <p className="text-sm">{type === "sekolah" ? "Absen" : "Absen"}</p>
          </div>
          <div className="flex-1 bg-purple-300 rounded-xl shadow text-center py-3 shadow-[7px_7px_10px_-2px_rgba(0,_0,_0,_0.25)]">
            <p className="font-semibold">
              {type === "sekolah" ? summary.terlambat ?? 0 : summary.total ?? 0}
            </p>
            <p className="text-sm">{type === "sekolah" ? "Terlambat" : "Total"}</p>
          </div>
        </div>
      )}

      {type === "event" && (
        <div className="bg-purple-300 rounded-xl shadow text-center py-3 mb-4 shadow-[7px_7px_10px_-2px_rgba(0,_0,_0,_0.25)]">
          <p className="text-sm">Keikutsertaan Event</p>
          <p className="font-semibold">{data.length} Event</p>
        </div>
      )}

      {/* Filter / Search */}
      
       <div className="flex justify-between items-center mt-15 mb-2">
        <h2 className="text-lg font-semibold text-[28px]">
          {type === "sekolah"
            ? "Rekap Kehadiran Siswa"
            : type === "eskul"
            ? "Rekap Ekstrakurikuler"
            : "Rekap Event"}
        </h2>
        
      </div>
      <div className="flex items-center justify-between mb-3 ">
        
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          <span className="text-sm">{type === "event" ? "Cari Event" : "Filter"}</span>
        </div>
        <div className="flex gap-2">
          {type === "event" ? (
            <input
              type="text"
              placeholder="Cari Event..."
              className="flex  px-3 py-1 border border-orange-500 rounded-full text-sm mb-10"
              value={searchEvent}
              onChange={(e) => setSearchEvent(e.target.value)} 
            />
          ) : (
            <>
              <button
                onClick={() => setMode("weekly")}
                className={`px-3 py-1 rounded-full text-sm ${mode === "weekly" ? "bg-orange-500 text-white" : "border border-orange-500"}`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setMode("monthly")}
                className={`px-3 py-1 rounded-full text-sm ${mode === "monthly" ? "bg-orange-500 text-white" : "border border-orange-500"}`}
              >
                Bulanan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Periode */}
      {type !== "event" && (
        <div className="mb-3">
          {mode === "weekly" ? (
            <div className="flex justify-center items-center gap-3">
              <button onClick={() => setCurrentWeek(currentWeek - 1)} className="p-1 rounded-full bg-gray-100">
                <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
              </button>
              
              <div className="text-center">
                <span className="text-sm">
                  {formatDate(getWeekDateRange(currentWeek).start)} - {formatDate(getWeekDateRange(currentWeek).end)}
                </span>
               
              </div>
              
              <button onClick={() => setCurrentWeek(currentWeek + 1)} className="p-1 rounded-full bg-gray-100">
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-3">
              <button onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }} className="p-1 rounded-full bg-gray-100">
                <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
              </button>
              
              <div className="text-center">
                <span className="text-sm font-medium">
                  {monthNames[selectedMonth]} {selectedYear}
                </span>
              </div>
              
              <button onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }} className="p-1 rounded-full bg-gray-100">
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabel */}
      {loading ? (
        <p className="text-center text-gray-500">Sedang memuat...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-[12px]">
            <thead className="text-left bg-gray-50">
              <tr>{renderTableHeaders()}</tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={type === "sekolah" ? 4 : 3} className="text-center py-4 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {renderTableRow(row)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <BottomNavbar />
    </div>
  );
}