import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function StatistikKehadiran() {
  const [type, setType] = useState<"sekolah" | "eskul" | "event">("sekolah");
  const [range, setRange] = useState<"latest" | "daily" | "weekly" | "monthly">("latest");
  const [eskulId, setEskulId] = useState<number | null>(null);
  const [eskuls, setEskuls] = useState<any[]>([]);
  const [data, setData] = useState<any>({
    labels: [],
    hadir: [],
    tidak_hadir: [],
    terlambat: [],
  });

  // state navigasi
  const [dayOffset, setDayOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    axios.get("/api/eskul/list").then((res) => setEskuls(res.data));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `/api/stats/${type}?range=${range}`;
        if (type === "eskul" && eskulId) {
          url += `&eskul_id=${eskulId}`;
        }

        if (range === "latest") {
          url = `/api/stats/${type}?range=daily&day=0`;
        } else if (range === "daily") {
          url += `&day=${dayOffset}`;
        } else if (range === "weekly") {
          url += `&week=${weekOffset}`;
        } else if (range === "monthly") {
          const now = new Date();
          const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
          url += `&month=${d.getMonth() + 1}&year=${d.getFullYear()}`;
        }

        const res = await axios.get(url);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [type, range, eskulId, dayOffset, weekOffset, monthOffset]);

  const chartData = data.labels.map((label: string, i: number) => ({
    name: label,
    Hadir: data.hadir[i],
    "Tidak Hadir": data.tidak_hadir[i],
    Terlambat: data.terlambat ? data.terlambat[i] : 0,
  }));

  // formatter untuk label navigasi
  const formatDaily = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatWeekly = (offset: number) => {
    const now = new Date();
    const current = new Date(now);
    current.setDate(now.getDate() + offset * 7);

    const start = new Date(current);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })} - ${end.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

  const formatMonthly = (offset: number) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  return (
    <div className="flex text-gray-900">
     {/* Sidebar */}
                  <aside className="w-56 bg-white h-screen p-4 shadow">
                    <nav className="space-y-2 text-sm">
                      <div onClick={() => (window.location.href = '/Admin/Dashboard')}
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer">🏠 Dashboard</div>
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
                        className="p-2 rounded bg-gray-200 font-medium cursor-pointer"
                        onClick={() => (window.location.href = '/admin/statistik-kehadiran')}
                      >📈 Statistik Kehadiran</div>
                      <div 
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer"
                        onClick={() => (window.location.href = '/admin/laporan-kehadiran')}
                      >📄 Laporan</div>
                    </nav>
                  </aside>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-6">Riwayat Kehadiran</h1>

        {/* Card wrapper */}
        <div className="bg-white p-4 rounded shadow">
          {/* Header filter */}
          <div className="flex justify-between items-center mb-4">
            <button className="flex items-center gap-1 text-gray-600">
              <span>⚙️</span> Filter
            </button>
            <div className="flex gap-2">
              {/* Dropdown range */}
              <select
                value={range}
                onChange={(e) => {
                  setRange(e.target.value as any);
                  setDayOffset(0);
                  setWeekOffset(0);
                  setMonthOffset(0);
                }}
                className="border p-2 rounded"
              >
                <option value="latest">Data Terbaru</option>
                <option value="daily">Data Harian</option>
                <option value="weekly">Data Mingguan</option>
                <option value="monthly">Data Bulanan</option>
              </select>

              {/* Dropdown type */}
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "sekolah" | "eskul" | "event")
                }
                className="border p-2 rounded"
              >
                <option value="sekolah">Kehadiran Sekolah</option>
                <option value="eskul">Kehadiran Eskul</option>
                <option value="event">Kehadiran Event</option>
              </select>

              {/* Eskul filter */}
              {type === "eskul" && (
                <select
                  value={eskulId ?? ""}
                  onChange={(e) => setEskulId(Number(e.target.value))}
                  className="border p-2 rounded"
                >
                  <option value="">Pilih Eskul</option>
                  {eskuls.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nama}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-2">Statistik Kehadiran</h2>

          {/* Navigasi Periode (hilang kalau latest) */}
          {type !== "event" && range !== "latest" && (
            <div className="flex items-center justify-center gap-3 mb-4">
              {range === "daily" && (
                <>
                  <button
                    onClick={() => setDayOffset(dayOffset - 1)}
                    className="p-2 bg-gray-100 rounded-full"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <span className="font-medium">{formatDaily(dayOffset)}</span>
                  <button
                    onClick={() => setDayOffset(dayOffset + 1)}
                    disabled={dayOffset >= 0}
                    className={`p-2 rounded-full ${
                      dayOffset >= 0
                        ? "bg-gray-200 text-gray-400"
                        : "bg-gray-100"
                    }`}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}

              {range === "weekly" && (
                <>
                  <button
                    onClick={() => setWeekOffset(weekOffset - 1)}
                    className="p-2 bg-gray-100 rounded-full"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <span className="font-medium">
                    {formatWeekly(weekOffset)}
                  </span>
                  <button
                    onClick={() => setWeekOffset(weekOffset + 1)}
                    disabled={weekOffset >= 0}
                    className={`p-2 rounded-full ${
                      weekOffset >= 0
                        ? "bg-gray-200 text-gray-400"
                        : "bg-gray-100"
                    }`}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}

              {range === "monthly" && (
                <>
                  <button
                    onClick={() => setMonthOffset(monthOffset - 1)}
                    className="p-2 bg-gray-100 rounded-full"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <span className="font-medium">
                    {formatMonthly(monthOffset)}
                  </span>
                  <button
                    onClick={() => setMonthOffset(monthOffset + 1)}
                    disabled={monthOffset >= 0}
                    className={`p-2 rounded-full ${
                      monthOffset >= 0
                        ? "bg-gray-200 text-gray-400"
                        : "bg-gray-100"
                    }`}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Hadir" fill="#2563eb" />
              <Bar dataKey="Tidak Hadir" fill="#ef4444" />
              <Bar dataKey="Terlambat" fill="#9ca3af" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
