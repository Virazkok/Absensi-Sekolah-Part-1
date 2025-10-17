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
  const [range, setRange] = useState<"weekly" | "monthly" | "semester">(
    "monthly"
  );
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState(1);
  const [data, setData] = useState<LaporanItem[]>([]);
  const [search, setSearch] = useState("");

  const bulanList = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // === Fungsi predikat sesuai ApiMuridOverviewController ===
  const getPredikat = (hadir: number, total: number): string => {
    if (total === 0) return "-";
    const percentage = (hadir / total) * 100;
    if (percentage < 50) return "Kurang";
    if (percentage >= 50 && percentage <= 60) return "Cukup";
    if (percentage >= 61 && percentage <= 74) return "Baik";
    return "Sangat Baik";
  };

  const fetchData = async () => {
    try {
      const [resSekolah, resEskul, resEvent] = await Promise.all([
        axios.get("/api/laporan/sekolah", {
          params: { range, bulan, tahun, semester },
        }),
        axios.get("/api/laporan/eskul", {
          params: { range, bulan, tahun, semester },
        }),
        axios.get("/api/laporan/event", {
          params: { range, bulan, tahun, semester },
        }),
      ]);

      const map = new Map<string, LaporanItem>();

      const mergeData = (items: any[], type: "sekolah" | "eskul" | "event") => {
        items.forEach((item) => {
          const nama = item.nama || "-";
          const existing = map.get(nama) || {
            nama,
            kelas: item.murid?.kelas?.name || item.keterangan || "-",
            keahlian:
              item.murid?.keahlian ||
              item.keahlian ||
              item.murid?.kejuruan ||
              "-",
            hadirSekolah: 0,
            hadirEskul: 0,
            hadirEvent: 0,
            keterangan: "-",
          };

          if (type === "sekolah") existing.hadirSekolah += item.hadir || 0;
          if (type === "eskul") existing.hadirEskul += item.hadir || 0;
          if (type === "event") existing.hadirEvent += item.hadir || 0;

          map.set(nama, existing);
        });
      };

      mergeData(resSekolah.data, "sekolah");
      mergeData(resEskul.data, "eskul");
      mergeData(resEvent.data, "event");

      // Hitung predikat berdasarkan total kehadiran
      const mergedData = Array.from(map.values()).map((d) => {
        const totalHadir = d.hadirSekolah + d.hadirEskul + d.hadirEvent;
        const totalHari = totalHadir + 2; // dummy asumsi 2 ketidakhadiran untuk simulasi
        return {
          ...d,
          keterangan: getPredikat(totalHadir, totalHari),
        };
      });

      setData(mergedData);
    } catch (error) {
      console.error("Error fetching laporan:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range, bulan, tahun, semester]);

  const filteredData = data.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-gray-100 min-h-screen text-gray-900">
     {/* Sidebar */}
                  <aside className="w-56 bg-white h-screen p-4 shadow">
                    <nav className="space-y-2 text-sm">
                      <div onClick={() => (window.location.href = '/Admin/Dashboard')}
                        className="p-2 rounded bg-[#E86D1F] font-medium cursor-pointer text-white">🏠 Dashboard</div>
                      <div onClick={() => (window.location.href = '/Admin/UserManagement')}
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer">👥 User Manajemen</div>
                      <div onClick={() => (window.location.href = '/admin/events')}
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer">📅 Event Manajemen</div>
                      <div
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer"
                        onClick={() => (window.location.href = '/admin/eskul')}
                      >
                        ⚽ Ekstrakurikuler
                      </div>
                      <div 
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer"
                        onClick={() => (window.location.href = '/admin/riwayat-kehadiran')}
                      >📈 Riwayat Kehadiran</div>
                       <div 
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer"
                        onClick={() => (window.location.href = '/admin/statistik-kehadiran')}
                      >📈 Statistik Kehadiran</div>
                      <div 
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer"
                        onClick={() => (window.location.href = '/admin/laporan-kehadiran')}
                      >📄 Laporan</div>
                    </nav>
                  </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Laporan Kehadiran
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <span className="text-gray-700 font-medium">Admin</span>
          </div>
        </div>

        <Card className="border-2 border-purple-300 rounded-2xl bg-white shadow-sm">
          <CardContent className="p-6">
            {/* Filter Section */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <Filter size={16} />
                <span>Filter</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={range === "weekly" ? "default" : "outline"}
                    className={`rounded-full ${
                      range === "weekly" ? "bg-purple-600 text-white" : ""
                    }`}
                    onClick={() => setRange("weekly")}
                  >
                    Mingguan
                  </Button>
                  <Button
                    variant={range === "monthly" ? "default" : "outline"}
                    className={`rounded-full ${
                      range === "monthly" ? "bg-purple-600 text-white" : ""
                    }`}
                    onClick={() => setRange("monthly")}
                  >
                    Bulanan
                  </Button>
                  <Button
                    variant={range === "semester" ? "default" : "outline"}
                    className={`rounded-full ${
                      range === "semester" ? "bg-purple-600 text-white" : ""
                    }`}
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

              {/* Navigasi bulan / semester */}
              <div className="flex items-center gap-2 mt-2 text-gray-900">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (range === "semester") setSemester(semester - 1);
                    else setBulan(bulan === 1 ? 12 : bulan - 1);
                  }}
                >
                  <ChevronLeft size={18} />
                </Button>
                <span className="font-semibold">
                  {range === "semester"
                    ? `Semester ${semester} ${tahun}`
                    : `${bulanList[bulan - 1]} ${tahun}`}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (range === "semester") setSemester(semester + 1);
                    else setBulan(bulan === 12 ? 1 : bulan + 1);
                  }}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
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
                  {filteredData.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{idx + 1}</td>
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

            {/* Download Button */}
            <div className="mt-4 flex justify-start">
              <Button className="bg-gray-100 text-gray-800 border hover:bg-gray-200">
                <FileDown className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LaporanKehadiranPage;
