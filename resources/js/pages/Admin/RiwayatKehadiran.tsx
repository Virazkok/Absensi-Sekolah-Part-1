import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface RekapRow {
  nama: string;
  kelas: string;
  keahlian?: string; // sekolah
  eskul?: string;    // eskul
  total: string;
  persentase: string;
}

const bulanList = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
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
      const res = await axios.get("http://192.168.1.105:8000/api/admin/riwayat-kehadiran", {
        params: { filter, bulan, tahun, semester, type, eskul_id: eskulId },
      });
      setRekap(res.data.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, bulan, tahun, semester, type, eskulId]);

  useEffect(() => {
    if (type === "eskul") {
      axios.get("http://192.168.1.105:8000/api/eskul/list").then((res) => {
        setEskulList(res.data);
        if (res.data.length > 0 && !eskulId) {
          setEskulId(res.data[0].id);
        }
      });
    }
  }, [type]);

 const filtered = rekap.filter((r) =>
  (r.nama || "").toLowerCase().includes(search.toLowerCase())
);

  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Rekap Kehadiran Siswa</h1>

      {/* Filter Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Toggle Bulanan / Semester */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={`px-4 py-1 ${filter === "bulan" ? "bg-gray-200 font-semibold" : ""}`}
              onClick={() => setFilter("bulan")}
            >
              Bulanan
            </button>
            <button
              className={`px-4 py-1 ${filter === "semester" ? "bg-gray-200 font-semibold" : ""}`}
              onClick={() => setFilter("semester")}
            >
              Semester
            </button>
          </div>

          {/* Navigasi bulan */}
          {filter === "bulan" && (
            <div className="flex items-center gap-2">
              <button onClick={() => setBulan(bulan === 1 ? 12 : bulan - 1)}>
                <ChevronLeft />
              </button>
              <span>{bulanList[bulan - 1]} {tahun}</span>
              <button onClick={() => setBulan(bulan === 12 ? 1 : bulan + 1)}>
                <ChevronRight />
              </button>
            </div>
          )}

          {/* Semester */}
          {filter === "semester" && (
            <div className="flex items-center gap-2">
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
                className="border rounded p-1"
              >
                <option value="1">Semester 1 (Jul - Des)</option>
                <option value="2">Semester 2 (Jan - Jun)</option>
              </select>
              <span>{tahun}</span>
            </div>
          )}

          
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
            <div className="flex items-center border rounded px-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
                placeholder="Cari siswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 outline-none"
            />
            </div>

        {/* Dropdown Rekapan */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "sekolah" | "eskul")}
            className="border rounded p-1 "
          >
            <option value="sekolah">Rekapan Sekolah</option>
            <option value="eskul">Rekapan Eskul</option>
          </select>

          {/* Pilih Eskul */}
          {type === "eskul" && (
            <select
              value={eskulId ?? ""}
              onChange={(e) => setEskulId(Number(e.target.value))}
              className="border rounded p-1"
            >
              {eskulList.map((eskul) => (
                <option key={eskul.id} value={eskul.id}>
                  {eskul.nama}
                </option>
              ))}
            </select>
          )}
          </div>
        </div>

      
          

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
         <thead>
  <tr className="bg-gray-100">
    <th className="p-2 border">Nama Siswa</th>
    <th className="p-2 border">Kelas</th>
    <th className="p-2 border">Keahlian</th>
    <th className="p-2 border">Total</th>
    <th className="p-2 border">Persentase</th>
  </tr>
</thead>
<tbody>
  {paginated.length > 0 ? (
    paginated.map((row, idx) => (
      <tr key={idx} className="border-b">
        <td className="p-2">{row.nama ?? "-"}</td>
        <td className="p-2">{row.kelas ?? "-"}</td>
        <td className="p-2">{row.keahlian ?? "-"}</td>
        <td className="p-2">{row.total ?? "0/0"}</td>
        <td className="p-2">{row.persentase ?? "0%"}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={5} className="p-4 text-center text-gray-500">
        Tidak ada data
      </td>
    </tr>
  )}
</tbody>


        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 mt-3">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={`px-3 py-1 rounded ${page === num ? "bg-gray-300 font-semibold" : "bg-gray-100"}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RiwayatKehadiran;
