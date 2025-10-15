import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LaporanKehadiran() {
  const [type, setType] = useState<"sekolah" | "eskul" | "event">("sekolah");
  const [range, setRange] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eskuls, setEskuls] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [kelas, setKelas] = useState<any[]>([]);
  const [selectedEskul, setSelectedEskul] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [data, setData] = useState<any[]>([]);

  // ambil list eskul, event, kelas
  useEffect(() => {
    axios.get("/api/eskul/list").then((res) => setEskuls(res.data));
    axios.get("/api/event/list").then((res) => setEvents(res.data));
    axios.get("/api/kelas/list").then((res) => setKelas(res.data));
  }, []);

  // fetch otomatis setiap filter berubah
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `/api/laporan/${type}?range=${range}`;
        if (startDate && endDate) url += `&start=${startDate}&end=${endDate}`;
        if (type === "eskul" && selectedEskul) url += `&eskul_id=${selectedEskul}`;
        if (type === "event" && selectedEvent) url += `&event_id=${selectedEvent}`;
        if (type === "sekolah" && selectedKelas) url += `&kelas_id=${selectedKelas}`;

        const res = await axios.get(url);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [type, range, selectedEskul, selectedEvent, selectedKelas, startDate, endDate]);

  const exportReport = (format: "pdf" | "excel") => {
    let url = `/api/laporan/${type}/export?format=${format}&range=${range}`;
    if (startDate && endDate) url += `&start=${startDate}&end=${endDate}`;
    if (type === "eskul" && selectedEskul) url += `&eskul_id=${selectedEskul}`;
    if (type === "event" && selectedEvent) url += `&event_id=${selectedEvent}`;
    if (type === "sekolah" && selectedKelas) url += `&kelas_id=${selectedKelas}`;

    window.open(url, "_blank");
  };

  return (
    <div className="flex-1 bg-gray-100 min-h-screen p-6 text-gray-900">
      
      
      <h1 className="text-2xl font-bold mb-6">📑 Laporan Kehadiran</h1>
      

      {/* Tabs */}
      <div className="mb-4 flex gap-3">
        {["sekolah", "eskul", "event"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t as any)}
            className={`px-3 py-1 rounded ${type === t ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <select value={range} onChange={(e) => setRange(e.target.value)} className="border p-2 rounded">
          <option value="daily">Harian</option>
          <option value="weekly">Mingguan</option>
          <option value="monthly">Bulanan</option>
          <option value="custom">Custom</option>
        </select>

        {range === "custom" && (
          <>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded" />
          </>
        )}

        {type === "sekolah" && (
          <select value={selectedKelas || ""} onChange={(e) => setSelectedKelas(Number(e.target.value))} className="border p-2 rounded">
            <option value="">-- Semua Kelas --</option>
            {kelas.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        )}

        {type === "eskul" && (
          <select value={selectedEskul || ""} onChange={(e) => setSelectedEskul(Number(e.target.value))} className="border p-2 rounded">
            <option value="">-- Pilih Eskul --</option>
            {eskuls.map((e) => (
              <option key={e.id} value={e.id}>{e.nama}</option>
            ))}
          </select>
        )}

        {type === "event" && (
          <select value={selectedEvent || ""} onChange={(e) => setSelectedEvent(Number(e.target.value))} className="border p-2 rounded">
            <option value="">-- Pilih Event --</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.nama}</option>
            ))}
          </select>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button onClick={() => exportReport("pdf")} className="bg-red-600 text-white px-4 py-2 rounded">Export PDF</button>
        <button onClick={() => exportReport("excel")} className="bg-green-600 text-white px-4 py-2 rounded">Export Excel</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Nama</th>
              <th className="p-2 border">{type === "sekolah" ? "Kelas" : type === "eskul" ? "Eskul" : "Event"}</th>
              <th className="p-2 border">Hadir</th>
              <th className="p-2 border">Tidak Hadir</th>
              <th className="p-2 border">Terlambat</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="text-center">
                <td className="border p-2">{row.nama}</td>
                <td className="border p-2">{row.keterangan}</td>
                <td className="border p-2">{row.hadir}</td>
                <td className="border p-2">{row.tidak_hadir}</td>
                <td className="border p-2">{row.terlambat}</td>
              </tr>
            ))}
          </tbody>    
        </table>
      </div>
    </div>
  );
}
