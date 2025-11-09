import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import Sidebar from "@/Components/sidebar";

interface RekapRow {
  nama: string;
  kelas: string;
  keahlian?: string;
  total: string;
  persentase: string;
}

const bulanList = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const RiwayatKehadiran: React.FC = () => {
  const [filter, setFilter] = useState<"bulan" | "semester">("bulan");
  const [bulan, setBulan] = useState(dayjs().month() + 1);
  const [tahun, setTahun] = useState(dayjs().year());
  const [semester, setSemester] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [rekap, setRekap] = useState<RekapRow[]>([]);
  const [page, setPage] = useState(1);
  const [type, setType] = useState<"sekolah" | "eskul">("sekolah");
  const [eskulId, setEskulId] = useState<number | null>(null);
  const [eskulList, setEskulList] = useState<any[]>([]);
  const rowsPerPage = 10;

  const fetchData = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/riwayat-kehadiran", {
        params: { filter, bulan, tahun, semester, type, eskul_id: eskulId },
      });
      setRekap(res.data.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, bulan, semester, type, eskulId, tahun]);

  useEffect(() => {
    if (type === "eskul") {
      axios.get("http://127.0.0.1:8000/api/eskul/list").then((res) => {
        setEskulList(res.data);
        if (res.data.length > 0 && !eskulId) {
          setEskulId(res.data[0].id);
        }
      });
    }
  }, [type]);

  // Navigasi semester dengan rollover tahun
  const handleSemesterNavigation = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (semester === 1) {
        setSemester(2);
        setTahun(tahun - 1);
      } else {
        setSemester(1);
      }
    } else {
      if (semester === 2) {
        setSemester(1);
        setTahun(tahun + 1);
      } else {
        setSemester(2);
      }
    }
  };

  const filtered = rekap.filter((r) =>
    (r.nama || "").toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-gray-900 flex">
      {/* Sidebar */}
       <Sidebar />


      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">Riwayat Kehadiran</h1>

        <div className="bg-white rounded-2xl shadow border border-[#C9A2FF] p-6">
          <h2 className="text-lg font-semibold mb-3">Rekap Kehadiran Siswa</h2>
            <span className="flex items-center gap-2 mb-3">
                <Filter size={16} /> Filter
            </span>

          {/* Filter section */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            {/* Tombol filter kiri */}
            <div className="flex items-center gap-3">
              

              {/* Tombol Bulanan */}
              <button
                onClick={() => setFilter("bulan")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === "bulan"
                    ? "bg-[#8B23ED] text-white border-2 border-[#8B23ED]"
                    : "bg-white text-[#8B23ED] border-2 border-[#8B23ED]"
                }`}
              >
                Bulanan
              </button>

              {/* Tombol Semester */}
              <button
                onClick={() => setFilter("semester")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === "semester"
                    ? "bg-[#8B23ED] text-white border-2 border-[#8B23ED]"
                    : "bg-white text-[#8B23ED] border-2 border-[#8B23ED] "
                }`}
              >
                Semester
              </button>
            </div>

            {/* Dropdown Rekapan + Search */}
            <div className="flex items-center gap-3">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "sekolah" | "eskul")}
                className="border-2 border-[#8B23ED] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#8B23ED]"
              >
                <option value="sekolah">Rekapan Sekolah</option>
                <option value="eskul">Rekapan Eskul</option>
              </select>

              <div className="flex items-center border border-[#8B23ED] rounded-lg px-3 py-2">
                <Search size={16} className="text-gray-900" />
                <input
                  type="text"
                  placeholder="Cari siswa"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-2 outline-none text-sm w-40 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Navigasi Bulanan / Semester */}
          {filter === "bulan" ? (
            <div className="flex items-center gap-3 mb-6 text-gray-700 ml-2">
              <button
                onClick={() => setBulan(bulan === 1 ? 12 : bulan - 1)}
                className="hover:text-[#7B4EFF]"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-medium text-base">
                {bulanList[bulan - 1]} {tahun}
              </span>
              <button
                onClick={() => {
                  if (bulan === 12) {
                    setBulan(1);
                    setTahun(tahun + 1);
                  } else setBulan(bulan + 1);
                }}
                className="hover:text-[#7B4EFF]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-6 text-gray-700">
              <button
                onClick={() => handleSemesterNavigation("prev")}
                className="hover:text-[#7B4EFF]"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-medium text-base">
                Semester {semester} {tahun}
              </span>
              <button
                onClick={() => handleSemesterNavigation("next")}
                className="hover:text-[#7B4EFF]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2">Nama Siswa</th>
                  <th className="py-2">Kelas</th>
                  <th className="py-2">Keahlian</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2">{row.nama ?? "-"}</td>
                      <td className="py-2">{row.kelas ?? "-"}</td>
                      <td className="py-2">{row.keahlian ?? "-"}</td>
                      <td className="py-2">{row.total ?? "0/0"}</td>
                      <td className="py-2">{row.persentase ?? "0%"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-4">
                      Tidak ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-4 gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  page === num
                    ? "bg-[#FF6B00] text-white border-[#FF6B00]"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiwayatKehadiran;
