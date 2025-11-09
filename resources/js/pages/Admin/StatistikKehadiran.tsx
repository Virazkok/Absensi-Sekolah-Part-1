import React, { useEffect, useMemo, useState } from "react";
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
import Sidebar from "@/Components/sidebar";

type Range = "latest" | "daily" | "weekly" | "monthly";

export default function StatistikKehadiran() {
  // --- Sekolah card state ---
  const [sekolahRange, setSekolahRange] = useState<Range>("latest");
  const [sekolahDayOffset, setSekolahDayOffset] = useState(0);
  const [sekolahWeekOffset, setSekolahWeekOffset] = useState(0);
  const [sekolahMonthOffset, setSekolahMonthOffset] = useState(0);
  const [sekolahData, setSekolahData] = useState<any>({ labels: [], hadir: [], tidak_hadir: [], terlambat: [] });

  // --- Eskul card state ---
  const [eskulRange, setEskulRange] = useState<Range>("latest");
  const [eskulDayOffset, setEskulDayOffset] = useState(0);
  const [eskulWeekOffset, setEskulWeekOffset] = useState(0);
  const [eskulMonthOffset, setEskulMonthOffset] = useState(0);
  const [eskuls, setEskuls] = useState<any[]>([]); 
  const [eskulAggregates, setEskulAggregates] = useState<any[]>([]);

  // --- Event card state ---
  const [eventRange, setEventRange] = useState<Range>("latest");
  const [eventDayOffset, setEventDayOffset] = useState(0);
  const [eventWeekOffset, setEventWeekOffset] = useState(0);
  const [eventMonthOffset, setEventMonthOffset] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [eventAggregates, setEventAggregates] = useState<any[]>([]); 
  const buildRangeQuery = (range: Range, day: number, week: number, monthOffset: number) => {
    if (range === "latest") return "range=daily&day=0";
    if (range === "daily") return `range=daily&day=${day}`;
    if (range === "weekly") return `range=weekly&week=${week}`;
    if (range === "monthly") {
      const now = new Date();
      const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
      return `range=monthly&month=${d.getMonth() + 1}&year=${d.getFullYear()}`;
    }
    return "";
  };

  useEffect(() => {
    axios.get("/api/eskul/list").then((res) => setEskuls(res.data || [])).catch(() => setEskuls([]));
    axios.get("/api/event/list").then((res) => setEvents(res.data || [])).catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    const q = buildRangeQuery(sekolahRange, sekolahDayOffset, sekolahWeekOffset, sekolahMonthOffset);
    const url = `/api/stats/sekolah?${q}`;
    let cancelled = false;
    axios.get(url).then((res) => {
      if (cancelled) return;
      setSekolahData(res.data || { labels: [], hadir: [], tidak_hadir: [], terlambat: [] });
    }).catch((err) => console.error("Sekolah stats error:", err));
    return () => { cancelled = true; };
  }, [sekolahRange, sekolahDayOffset, sekolahWeekOffset, sekolahMonthOffset]);


  useEffect(() => {
    const q = buildRangeQuery(eskulRange, eskulDayOffset, eskulWeekOffset, eskulMonthOffset);
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const results: any[] = []
        await Promise.all(eskuls.map(async (e) => {
          try {
            const url = `/api/stats/eskul?${q}&eskul_id=${e.id}`;
            const res = await axios.get(url);
            const payload = res.data || { hadir: [], tidak_hadir: [] };
            const hadirSum = (payload.hadir || []).reduce((a: number, b: number) => a + Number(b), 0);
            const tidakSum = (payload.tidak_hadir || []).reduce((a: number, b: number) => a + Number(b), 0);
            results.push({ name: e.nama, hadir: hadirSum, tidak_hadir: tidakSum });
          } catch (err) {
            console.warn(`Eskul ${e.id} fetch failed, skipping`, err);
          }
        }));

        if (!cancelled) setEskulAggregates(results);
      } catch (err) {
        console.error("Eskul aggregation error", err);
      }
    };

    fetchAll();

    return () => { cancelled = true; };
  }, [eskuls, eskulRange, eskulDayOffset, eskulWeekOffset, eskulMonthOffset]);

  useEffect(() => {
  const q = buildRangeQuery(eventRange, eventDayOffset, eventWeekOffset, eventMonthOffset);
  let cancelled = false;

  const fetchEventSummary = async () => {
    try {
      const res = await axios.get(`/api/stats/event-summary?${q}`);
      if (cancelled) return;

      const payload = res.data || { labels: [], pendaftar: [], hadir: [] };
      const results = (payload.labels || []).map((label: string, i: number) => ({
        name: label,
        Pendaftar: payload.pendaftar?.[i] ?? 0,
        Kehadiran: payload.hadir?.[i] ?? 0,
      }));

      setEventAggregates(results);
    } catch (err) {
      console.error("Event summary fetch error:", err);
    }
  };

  fetchEventSummary();

  return () => { cancelled = true; };
}, [eventRange, eventDayOffset, eventWeekOffset, eventMonthOffset]);


  const sekolahChartData = useMemo(() => {
    return (sekolahData.labels || []).map((label: string, i: number) => ({
      name: label,
      Hadir: sekolahData.hadir?.[i] ?? 0,
      "Tidak Hadir": sekolahData.tidak_hadir?.[i] ?? 0,
      Terlambat: sekolahData.terlambat?.[i] ?? 0,
    }));
  }, [sekolahData]);

  const eskulChartData = useMemo(() => {
    return (eskulAggregates || []).map((r) => ({ name: r.name, Hadir: r.hadir, "Tidak Hadir": r.tidak_hadir }));
  }, [eskulAggregates]);

  const eventChartData = useMemo(() => {
  return (eventAggregates || []).map((r) => ({
    name: r.name,
    Pendaftar: r.Pendaftar ?? 0,
    Kehadiran: r.Kehadiran ?? 0,
  }));
}, [eventAggregates]);

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

    return `${start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
  };

  const formatMonthly = (offset: number) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex justify-center gap-6 mt-4 font-[Vercetti] text-[14px]" style={{ textAlign: "center" }}>
      {(payload || []).map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex text-gray-900">
      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-6">Riwayat Kehadiran</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          

          {/* Eskul Card */}
          <div className="bg-white p-4 rounded-lg shadow border border-[#8B23ED]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-gray-600">⚙️ Filter</button>
              </div>
              <div className="flex gap-2 items-center">
                <select value={eskulRange} onChange={(e) => { setEskulRange(e.target.value as Range); setEskulDayOffset(0); setEskulWeekOffset(0); setEskulMonthOffset(0); }} className="border p-2 rounded">
                  <option value="latest">Data Terbaru</option>
                  <option value="daily">Data Harian</option>
                  <option value="weekly">Data Mingguan</option>
                  <option value="monthly">Data Bulanan</option>
                </select>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-2">Statistik Kehadiran Ekstrakulikuler</h2>

            {eskulRange !== "latest" && (
              <div className="flex items-center justify-center gap-3 mb-4">
                {eskulRange === "daily" && (
                  <>
                    <button onClick={() => setEskulDayOffset(eskulDayOffset - 1)} className="p-2 bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-medium">{formatDaily(eskulDayOffset)}</span>
                    <button onClick={() => setEskulDayOffset(eskulDayOffset + 1)} disabled={eskulDayOffset >= 0} className={`p-2 rounded-full ${eskulDayOffset >= 0 ? "bg-gray-200 text-gray-400" : "bg-gray-100"}`}><ChevronRightIcon className="w-5 h-5" /></button>
                  </>
                )}

                {eskulRange === "weekly" && (
                  <>
                    <button onClick={() => setEskulWeekOffset(eskulWeekOffset - 1)} className="p-2 bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-medium">{formatWeekly(eskulWeekOffset)}</span>
                    <button onClick={() => setEskulWeekOffset(eskulWeekOffset + 1)} disabled={eskulWeekOffset >= 0} className={`p-2 rounded-full ${eskulWeekOffset >= 0 ? "bg-gray-200 text-gray-400" : "bg-gray-100"}`}><ChevronRightIcon className="w-5 h-5" /></button>
                  </>
                )}

                {eskulRange === "monthly" && (
                  <>
                    <button onClick={() => setEskulMonthOffset(eskulMonthOffset - 1)} className="p-2 bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-medium">{formatMonthly(eskulMonthOffset)}</span>
                    <button onClick={() => setEskulMonthOffset(eskulMonthOffset + 1)} disabled={eskulMonthOffset >= 0} className={`p-2 rounded-full ${eskulMonthOffset >= 0 ? "bg-gray-200 text-gray-400" : "bg-gray-100"}`}><ChevronRightIcon className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            )}

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={eskulChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} />
                <YAxis axisLine={false} tickLine={false} interval={0}/>
                <Tooltip />
                <Legend content={<CustomLegend payload={undefined} />} />
                <Bar dataKey="Hadir" fill="#640FB4" radius={[10, 10, 0, 0]}/>
                <Bar dataKey="Tidak Hadir" fill="#CAC3D0" radius={[10, 10, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Event Card */}
          <div className="bg-white p-4 rounded-lg shadow border border-[#8B23ED]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-gray-600">⚙️ Filter</button>
              </div>
              <div className="flex gap-2 items-center">
                <select value={eventRange} onChange={(e) => { setEventRange(e.target.value as Range); setEventDayOffset(0); setEventWeekOffset(0); setEventMonthOffset(0); }} className="border p-2 rounded">
                  <option value="latest">Data Terbaru</option>
                  <option value="daily">Data Harian</option>
                  <option value="weekly">Data Mingguan</option>
                  <option value="monthly">Data Bulanan</option>
                </select>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-2">Statistik Kehadiran Event</h2>

            {eventRange !== "latest" && (
              <div className="flex items-center justify-center gap-3 mb-4">
                {eventRange === "daily" && (
                  <>
                    <button onClick={() => setEventDayOffset(eventDayOffset - 1)} className="p-2 bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-medium">{formatDaily(eventDayOffset)}</span>
                    <button onClick={() => setEventDayOffset(eventDayOffset + 1)} disabled={eventDayOffset >= 0} className={`p-2 rounded-full ${eventDayOffset >= 0 ? "bg-gray-200 text-gray-400" : "bg-gray-100"}`}><ChevronRightIcon className="w-5 h-5" /></button>
                  </>
                )}

                {eventRange === "weekly" && (
                  <>
                    <button onClick={() => setEventWeekOffset(eventWeekOffset - 1)} className="p-2 bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-medium">{formatWeekly(eventWeekOffset)}</span>
                    <button onClick={() => setEventWeekOffset(eventWeekOffset + 1)} disabled={eventWeekOffset >= 0} className={`p-2 rounded-full ${eventWeekOffset >= 0 ? "bg-gray-200 text-gray-400" : "bg-gray-100"}`}><ChevronRightIcon className="w-5 h-5" /></button>
                  </>
                )}

                {eventRange === "monthly" && (
                  <>
                    <button onClick={() => setEventMonthOffset(eventMonthOffset - 1)} className="p-2 bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-medium">{formatMonthly(eventMonthOffset)}</span>
                    <button onClick={() => setEventMonthOffset(eventMonthOffset + 1)} disabled={eventMonthOffset >= 0} className={`p-2 rounded-full ${eventMonthOffset >= 0 ? "bg-gray-200 text-gray-400" : "bg-gray-100"}`}><ChevronRightIcon className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            )}

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={eventChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" interval={0} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} interval={0}/>
                <Tooltip />
                <Legend content={<CustomLegend payload={undefined} />} />
                <Bar dataKey="Pendaftar" fill="#D9B7F9" radius={[10, 10, 0, 0]}/>
                <Bar dataKey="Kehadiran" fill="#640FB4" radius={[10, 10, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Sekolah Card */}
          <div className="bg-white p-4 rounded-lg shadow mt-10 border border-[#8B23ED]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-gray-600">⚙️ Filter</button>
              </div>
              <div className="flex gap-2">
                <select value={sekolahRange} onChange={(e) => { setSekolahRange(e.target.value as Range); setSekolahDayOffset(0); setSekolahWeekOffset(0); setSekolahMonthOffset(0); }} className="border p-2 rounded">
                  <option value="latest">Data Terbaru</option>
                  <option value="daily">Data Harian</option>
                  <option value="weekly">Data Mingguan</option>
                  <option value="monthly">Data Bulanan</option>
                </select>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-2">Statistik Kehadiran Sekolah</h2>

            {/* navigation (hide for latest) */}
            {sekolahRange !== "latest" && (
              <div className="flex items-center justify-center gap-3 mb-4">
                {sekolahRange === "daily" && (
                  <>
                    <button onClick={() => setSekolahDayOffset(sekolahDayOffset - 1)} className="p-2 bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-medium">{formatDaily(sekolahDayOffset)}</span>
                    <button onClick={() => setSekolahDayOffset(sekolahDayOffset + 1)} disabled={sekolahDayOffset >= 0} className={`p-2 rounded-full ${sekolahDayOffset >= 0 ? "bg-gray-200 text-gray-400" : "bg-gray-100"}`}><ChevronRightIcon className="w-5 h-5" /></button>
                  </>
                )}

                {sekolahRange === "weekly" && (
                  <>
                    <button onClick={() => setSekolahWeekOffset(sekolahWeekOffset - 1)} className="p-2 bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-medium">{formatWeekly(sekolahWeekOffset)}</span>
                    <button onClick={() => setSekolahWeekOffset(sekolahWeekOffset + 1)} disabled={sekolahWeekOffset >= 0} className={`p-2 rounded-full ${sekolahWeekOffset >= 0 ? "bg-gray-200 text-gray-400" : "bg-gray-100"}`}><ChevronRightIcon className="w-5 h-5" /></button>
                  </>
                )}

                {sekolahRange === "monthly" && (
                  <>
                    <button onClick={() => setSekolahMonthOffset(sekolahMonthOffset - 1)} className="p-2 bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-medium">{formatMonthly(sekolahMonthOffset)}</span>
                    <button onClick={() => setSekolahMonthOffset(sekolahMonthOffset + 1)} disabled={sekolahMonthOffset >= 0} className={`p-2 rounded-full ${sekolahMonthOffset >= 0 ? "bg-gray-200 text-gray-400" : "bg-gray-100"}`}><ChevronRightIcon className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            )}

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sekolahChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} className="border-none" />
                <YAxis axisLine={false} tickLine={false} interval={0}/>
                <Tooltip />
                <Legend content={<CustomLegend payload={undefined} />} />
                <Bar dataKey="Hadir" fill="#640FB4" radius={[10, 10, 0, 0]}/>
                <Bar dataKey="Tidak Hadir" fill="#CF9795" radius={[10, 10, 0, 0]} />
                <Bar dataKey="Terlambat" fill="#D9B7F9" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
}
