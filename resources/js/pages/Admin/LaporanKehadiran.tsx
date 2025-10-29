import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Filter, FileDown } from "lucide-react";
import axios from "axios";

interface LaporanItem {
  nama: string;
  kelas: string;
  keahlian: string;
  hadirSekolah: number;
  hadirEskul: number;
  hadirEvent: number;
  keterangan: string;
}

const LaporanKehadiranPage: React.FC = () => {
  const [range, setRange] = useState<"weekly" | "monthly" | "semester">("monthly");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState(
  new Date().getMonth() + 1 <= 6 ? 2 : 1
);

  const [data, setData] = useState<LaporanItem[]>([]);
  const [search, setSearch] = useState("");

  // === 🗓️ Hitung range minggu (Senin - Jumat) ===
  const getWeekRange = (date = new Date()) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Senin
    const monday = new Date(start.setDate(diff));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4); // Jumat
    return { start: monday, end: friday };
  };

  const [weekStart, setWeekStart] = useState<Date>(getWeekRange().start);
  const [weekEnd, setWeekEnd] = useState<Date>(getWeekRange().end);

  const bulanList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  // === 🧮 Predikat ===
  const getPredikat = (hadir: number, total: number): string => {
    if (total === 0) return "-";
    const percentage = (hadir / total) * 100;
    if (percentage < 50) return "Kurang";
    if (percentage >= 50 && percentage <= 60) return "Cukup";
    if (percentage >= 61 && percentage <= 74) return "Baik";
    return "Sangat Baik";
  };

  // === 📊 Ambil Data ===
  const fetchData = async () => {
    try {
      let params: any = {};

      if (range === "weekly") {
        params = {
          range: "mingguan",
          start_date: weekStart.toISOString().split("T")[0],
          end_date: weekEnd.toISOString().split("T")[0],
        };
     } else if (range === "semester") {
  let start: Date;
  let end: Date;

  if (semester === 1) {
    // Semester 1 → Juli–Des tahun ini
    start = new Date(tahun, 6, 2);  // Juli
    end = new Date(tahun, 11, 31);  // Desember
  } else {
    // Semester 2 → Januari–Juni tahun berikutnya
    start = new Date(tahun + 1, 0, 2);  // Januari tahun berikutnya
    end = new Date(tahun + 1, 5, 31);   // Juni tahun berikutnya
  }

  params = {
    range: "semester",
    semester,
    tahun,
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  };
} else {
  // ✅ tambahkan ini
  params = {
    range: "bulanan",
    bulan,
    tahun,
  };
}

      const [resSekolah, resEskul, resEvent] = await Promise.all([
        axios.get("/api/laporan/sekolah", { params }),
        axios.get("/api/laporan/eskul", { params }),
        axios.get("/api/laporan/event", { params }),
      ]);

      const map = new Map<string, LaporanItem>();

      const mergeData = (items: any[], type: "sekolah" | "eskul" | "event") => {
  if (!Array.isArray(items)) return;
  items.forEach((item) => {
    const nama = item.nama || "-";
    const existing = map.get(nama) || {
      nama,
      kelas: item.kelas || "-",
      keahlian: item.kejuruan || item.keahlian || "-",
      hadirSekolah: 0,
      hadirEskul: 0,
      hadirEvent: 0,
      keterangan: "-",
    };

    if (type === "sekolah") existing.hadirSekolah += item.hadir_sekolah || 0;
    if (type === "eskul") existing.hadirEskul += item.hadir_ekskul || 0;
    if (type === "event") existing.hadirEvent += item.hadir_event || 0;

    map.set(nama, existing);
  });
};


      mergeData(resSekolah.data.data || [], "sekolah");
mergeData(resEskul.data.data || [], "eskul");
mergeData(resEvent.data.data || [], "event");

      const mergedData = Array.from(map.values()).map((d) => {
        const totalHadir = d.hadirSekolah + d.hadirEskul + d.hadirEvent;
        const totalHari = totalHadir + 2;
        return { ...d, keterangan: getPredikat(totalHadir, totalHari) };
      });

      setData(mergedData);
    } catch (error) {
      console.error("Error fetching laporan:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range, bulan, tahun, semester, weekStart, weekEnd]);

  // === ⏩ Navigasi ===
  const handleNext = () => {
    if (range === "semester") {
      if (semester === 1) setSemester(2);
      else {
        setSemester(1);
        setTahun(tahun + 1);
      }
    } else if (range === "weekly") {
      const nextMonday = new Date(weekStart);
      nextMonday.setDate(nextMonday.getDate() + 7);
      const { start, end } = getWeekRange(nextMonday);
      setWeekStart(start);
      setWeekEnd(end);
    } else {
      if (bulan === 12) {
        setBulan(1);
        setTahun(tahun + 1);
      } else {
        setBulan(bulan + 1);
      }
    }
  };

  const handlePrev = () => {
    if (range === "semester") {
      if (semester === 2) setSemester(1);
      else {
        setSemester(2);
        setTahun(tahun - 1);
      }
    } else if (range === "weekly") {
      const prevMonday = new Date(weekStart);
      prevMonday.setDate(prevMonday.getDate() - 7);
      const { start, end } = getWeekRange(prevMonday);
      setWeekStart(start);
      setWeekEnd(end);
    } else {
      if (bulan === 1) {
        setBulan(12);
        setTahun(tahun - 1);
      } else {
        setBulan(bulan - 1);
      }
    }
  };

  const filteredData = data.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase())
  );

   const itemsPerPage = 15;
    const [currentPage, setCurrentPage] = React.useState(1);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = React.useMemo(() => {
      const startIdx = (currentPage - 1) * itemsPerPage;
      return filteredData.slice(startIdx, startIdx + itemsPerPage);
    }, [filteredData, currentPage]);

    // replace map source in table with paginatedData below
    const pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((page) => {
        if (page === 1 || page === totalPages) return true;
        if (page >= currentPage - 2 && page <= currentPage + 2) return true;
        return false;
      });

  return (
    <div className="flex bg-gray-100 min-h-screen text-gray-900">
       {/* Sidebar */}
      <aside className="hidden md:block md:w-60 bg-white p-4 shadow-lg min-h-screen">
        <nav className="space-y-2 text-sm">
          <div
            onClick={() => (window.location.href = "/Admin/Dashboard")}
            className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"
          >
            <img src="/icons/ri--dashboard-line.svg" alt="" />
            Dashboard
          </div>
          <div
            onClick={() => (window.location.href = "/Admin/UserManagement")}
            className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"
          >
            <img src="/icons/ri--user-settings-line.svg" alt="" />
            User Manajemen
          </div>
          <div
            onClick={() => (window.location.href = "/admin/events")}
            className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"
          >
            <img src="/icons/ri--list-settings-line.svg" alt="" />
            Event Manajemen
          </div>
          <div
            onClick={() => (window.location.href = "/admin/eskul")}
            className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"
          >
            <img src="/icons/ri--user-community-line.svg" alt="" />
            Ekstrakurikuler
          </div>
          <div
            onClick={() => (window.location.href = "/admin/riwayat-kehadiran")}
            className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"
          >
            <img src="/icons/ri--history-line.svg" alt="" />
            Riwayat Kehadiran
          </div>
          <div
            onClick={() => (window.location.href = "/admin/statistik-kehadiran")}
            className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"
          >
            <img src="/icons/ri--pie-chart-2-line.svg" alt="" />
            Statistik Kehadiran
          </div>
          <div
            onClick={() => (window.location.href = "/admin/laporan-kehadiran")}
            className="p-2 rounded bg-[#E86D1F] font-medium cursor-pointer text-white flex items-center gap-2"
          >
            <img src="/icons/ri--file-text-lineW.svg" alt="" />
            Laporan
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Laporan Kehadiran</h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <span className="text-gray-700 font-medium">Admin</span>
          </div>
        </div>

        <Card className="border-2 border-purple-300 rounded-2xl bg-white shadow-sm">
          <CardContent className="p-6">
            {/* Filter Section */}
            
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <Filter size={16} />
                <span>Filter</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={range === "weekly" ? "default" : "outline"}
                    className={`rounded-full ${range === "weekly" ? "bg-purple-600 text-white" : ""}`}
                    onClick={() => setRange("weekly")}
                  >
                    Mingguan
                  </Button>
                  <Button
                    variant={range === "monthly" ? "default" : "outline"}
                    className={`rounded-full ${range === "monthly" ? "bg-purple-600 text-white" : ""}`}
                    onClick={() => setRange("monthly")}
                  >
                    Bulanan
                  </Button>
                  <Button
                    variant={range === "semester" ? "default" : "outline"}
                    className={`rounded-full ${range === "semester" ? "bg-purple-600 text-white" : ""}`}
                    onClick={() => setRange("semester")}
                  >
                    Semester
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Semua Keahlian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Keahlian</SelectItem>
                      <SelectItem value="rpl">RPL</SelectItem>
                      <SelectItem value="tkj">TKJ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Cari nama..."
                    className="w-44"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

            {/* Navigasi */}
            <div className="flex items-center gap-2 mt-2 text-gray-900">
              <Button variant="ghost" size="icon" onClick={handlePrev}>
                <ChevronLeft size={18} />
              </Button>
              <span className="font-semibold">
                {range === "semester"
                  ? `Semester ${semester} ${tahun}`
                  : range === "weekly"
                  ? `${weekStart.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                    })} - ${weekEnd.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}`
                  : `${bulanList[bulan - 1]} ${tahun}`}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight size={18} />
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto text-gray-900">
              <table className="w-full border-t border-gray-300 text-sm">
                <thead className="text-gray-600 border-b">
                  <tr>
                    <th className="py-2 px-3 text-left">No</th>
                    <th className="py-2 px-3 text-left">Nama</th>
                    <th className="py-2 px-3 text-left">Kelas</th>
                    <th className="py-2 px-3 text-left">Keahlian</th>
                    <th className="py-2 px-3 text-left">Hadir Sekolah</th>
                    <th className="py-2 px-3 text-left">Hadir Eskul</th>
                    <th className="py-2 px-3 text-left">Hadir Event</th>
                    <th className="py-2 px-3 text-left">Keterangan</th>
                  </tr>
                </thead>
                 <tbody>
              {paginatedData.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="py-2 px-3">{item.nama}</td>
                  <td className="py-2 px-3">{item.kelas}</td>
                  <td className="py-2 px-3">{item.keahlian}</td>
                  <td className="py-2 px-3">{item.hadirSekolah}</td>
                  <td className="py-2 px-3">{item.hadirEskul}</td>
                  <td className="py-2 px-3">{item.hadirEvent}</td>
                  <td
                    className={`py-2 px-3 font-semibold ${
                      item.keterangan === "Sangat Baik"
                        ? "text-green-600"
                        : item.keterangan === "Baik"
                        ? "text-blue-600"
                        : item.keterangan === "Cukup"
                        ? "text-yellow-600"
                        : item.keterangan === "Kurang"
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {item.keterangan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Control */}
        <div className="flex justify-between mt-4">
          {/* Download Button */}
            <div className="mt-4 flex justify-start">
              <Button className="bg-gray-100 text-gray-800 border hover:bg-gray-200">
                <FileDown className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>

          <div className="flex items-center gap-1 border rounded-full px-3 py-1 bg-white shadow-sm">
            {pagesToShow.map((page, index) => {
              const prevPage = pagesToShow[index - 1];
              const showDots = prevPage && page - prevPage > 1;
              return (
                <React.Fragment key={page}>
                  {showDots && <span className="px-2 text-gray-400">…</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      currentPage === page
                        ? "bg-orange-400 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LaporanKehadiranPage;
