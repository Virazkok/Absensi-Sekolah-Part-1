import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import BottomNavbarOrtu from "@/components/OrangTuGuru/BottomNavbarOrtu";
import { Download, SlidersHorizontal } from "lucide-react";

interface Kelas {
  id: number;
  name: string;
}

interface Eskul {
  id: number;
  nama: string;
}

export default function RiwayatOrangTuaGuru() {
  const page = usePage();
  const kelasList = (page.props as any).kelas as Kelas[];
  const eskulList = (page.props as any).eskul as Eskul[];

  const urlParams = new URLSearchParams(window.location.search);
  const initialType = (urlParams.get("type") || "sekolah") as
    | "sekolah"
    | "eskul"
    | "event";

  const [type, setType] = useState<"sekolah" | "eskul" | "event">(initialType);
  const [kelasId, setKelasId] = useState<string>(urlParams.get("kelas_id") || "");
  const [eskulId, setEskulId] = useState<string>(urlParams.get("eskul_id") || "");
  const [mode, setMode] = useState<"weekly" | "monthly" | "semester">("weekly");
  const [search, setSearch] = useState<string>(urlParams.get("search") || "");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // periode filter
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState<1 | 2 | null>(null);

  useEffect(() => {
    fetchData();
  }, [type, kelasId, eskulId, mode, currentWeek, selectedMonth, selectedYear, semester, search]);

  async function fetchData() {
    setLoading(true);
    try {
      let params: any = {
        type,
        kelas_id: kelasId || undefined,
        search: search || undefined,
      };
      if (type === "eskul" && eskulId) params.eskul_id = eskulId;
      params.mode = mode;
      if (mode === "weekly") params.week = currentWeek;
      if (mode === "monthly") {
        params.month = selectedMonth + 1;
        params.year = selectedYear;
      }
      if (mode === "semester" && semester) {
        params.semester = semester;
        params.year = selectedYear;
      }

      const res = await axios.get("/api/riwayat-kehadiran", { params });
      setData(res.data.success ? res.data.data || [] : []);
    } catch (err) {
      console.error("Fetch error", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  // 📅 Range tanggal mingguan
  function getWeekRange(offset: number) {
    const now = new Date();
    const current = new Date(now);
    current.setDate(current.getDate() + offset * 7);

    const start = new Date(current);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.getDate()} ${start.toLocaleString("id-ID", { month: "long" })} ${start.getFullYear()} - ${end.getDate()} ${end.toLocaleString("id-ID", { month: "long" })} ${end.getFullYear()}`;
  }

  const monthNames = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember",
  ];

  return (
    <div className="min-h-screen bg-white p-4 text-gray-900 pb-20 text-[12px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-15">
        <h2 className="text-lg font-semibold text-[28px]">
          {type === "sekolah"
            ? "Rekap Kehadiran"
            : type === "eskul"
            ? "Rekap Ekstrakurikuler"
            : "Rekap Event"}
        </h2>
        
      </div>
       <div className="flex flex-row-reverse justify-between items-center mb-4">
      <button className="flex items-center gap-2 text-sm   px-3 py-1 rounded-lg hover:bg-gray-50">
          <Download size={16} /> download file
      </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-4">
        {type === "eskul" && (
          <select
            value={eskulId}
            onChange={(e) => setEskulId(e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 w-44"
          >
            <option value="">Pilih Ekstrakurikuler</option>
            {eskulList.map((e) => (
              <option key={e.id} value={e.id}>{e.nama}</option>
            ))}
          </select>
        )}

        <select
          value={kelasId}
          onChange={(e) => setKelasId(e.target.value)}
          className="px-3 py-2 border border-orange-500 rounded-lg shadow-sm max-w-44 h-11 flex-1"
        >
          <option value="">Pilih Kelas</option>
          {kelasList.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="cari"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-orange-500 rounded-lg shadow-sm max-w-44 flex-1"
        />
      </div>

      

      {/* Filter Buttons */}

      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-2 mr-[60px]">
                  <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Filter </span>
        </div>
        {["weekly", "monthly", "semester"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m as any)}
            className={` py-1 rounded-lg text-sm shadow-sm w-18  ${
              mode === m ? "bg-orange-500 text-white" : "border border-orange-500 text-orange-500"
            }`}
          >
            {m === "weekly" ? "Mingguan" : m === "monthly" ? "Bulanan" : "Semester"}
          </button>
        ))}
      </div>

      {/* Periode Picker */}
      {mode === "weekly" && (
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => setCurrentWeek(currentWeek - 1)}>←</button>
          <span className="font-semibold">{getWeekRange(currentWeek)}</span>
          <button onClick={() => setCurrentWeek(currentWeek + 1)}>→</button>
        </div>
      )}
      {mode === "monthly" && (
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11); setSelectedYear(selectedYear - 1);
            } else setSelectedMonth(selectedMonth - 1);
          }}>←</button>
          <span className="font-semibold">{monthNames[selectedMonth]} {selectedYear}</span>
          <button onClick={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0); setSelectedYear(selectedYear + 1);
            } else setSelectedMonth(selectedMonth + 1);
          }}>→</button>
        </div>
      )}

      {/* Table */}
<div className="bg-white rounded-xl shadow overflow-x-auto">
  <table className="w-full text-sm">
    <thead className="bg-gray-50">
      <tr>
        <th className="p-2 text-center whitespace-nowrap">Nama</th>
        <th className="p-2 text-center whitespace-nowrap">NIS</th>
        <th className="p-2 text-center whitespace-nowrap">Kelas</th>
        {type === "eskul" && <th className="p-2 text-center whitespace-nowrap">Nama Eskul</th>}
        {type === "event" && <th className="p-2 text-center whitespace-nowrap">Nama Event</th>}
        <th className="p-2 text-center ">Total Hadir</th>
        {type !== "event" && <th className="p-2 text-center ">Total Absen</th>}
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr><td colSpan={6} className="p-4 text-center">Memuat...</td></tr>
      ) : data.length === 0 ? (
        <tr><td colSpan={6} className="p-4 text-center">Tidak ada data</td></tr>
      ) : (
        data.map((row, idx) => (
          <tr key={idx} className="border-t">
            <td className="p-2 whitespace-nowrap">{row.student_name || row.nama}</td>
            <td className="p-2 whitespace-nowrap">{row.nis}</td>
            <td className="p-2 whitespace-nowrap">{row.kelas}</td>
            {type === "eskul" && (
              <td className="p-2 whitespace-nowrap">{row.nama || row.nama_eskul}</td>
            )}
            {type === "event" && (
              <td className="p-2 whitespace-nowrap">{row.nama_event}</td>
            )}
            <td className="p-2 whitespace-nowrap">{row.total_hadir}</td>
            {type !== "event" && (
              <td className="p-2 whitespace-nowrap">{row.absen}</td>
            )}
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>


      <BottomNavbarOrtu />
    </div>
  );
}
