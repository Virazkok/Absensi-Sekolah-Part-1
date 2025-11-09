import React, { useMemo, useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import CreateUserModalAdmin from '../auth/registerAdminDashboard';
import { Button } from '@headlessui/react';
import ManageEventsModal from './ManageEvents';
import CreateEskulModal from './AdminEskulCreate';
import EditEskulModal from './AdminEskulDetail';
import { ChevronDown, ChevronRight, QrCode } from "lucide-react";
import Sidebar from "@/Components/sidebar";
dayjs.extend(isoWeek);
import { useLayoutEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

 


type Props = any;

const SmallCard: React.FC<{ title: string; value: React.ReactNode }> = ({ title, value }) => (
  <div className="bg-white rounded-xl border border-[#8B23ED] shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)] p-4 flex flex-col justify-center">
    <div className="text-sm text-gray-500 text-center">{title}</div>
    <div className="text-2xl font-bold mt-2 text-center">{value}</div>
  </div>
);

const ProgressLine: React.FC<{ label: string; percent: number }> = ({ label, percent }) => (
  <div className="mb-3 flex justify-between border p-4 rounded-lg">
    <div className="flex justify-between text-sm">
      <div className="text-gray-900 text-[16px] mt-2">{label}</div>
      
    </div>
    <div className="w-50 overflow-hidden">
      <div className="text-gray-600 flex justify-end bg-white">{percent}%</div>
      <div className='bg-gray-300 rounded'>
      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percent}%` }} />
      </div>
    </div>
  </div>
);

const getEventStatusColor = (status: string) => {
  switch (String(status || '').toLowerCase()) {
    case 'aktif':
      return 'bg-green-100 text-green-700';
    case 'draft':
      return 'bg-orange-100 text-orange-700';
    case 'published':
      return 'bg-blue-100 text-blue-700';
    case 'selesai':
      return 'bg-purple-100 text-purple-700';
    case 'tidak aktif':
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function AdminDashboard() {
  const { props } = usePage<Props>();
  const { user } = props;

  const totalUsers = props.total_users ?? 0;
  const totalEvents = props.total_events ?? 0;
  const totalEskul = props.total_eskul ?? 0;
  const attendanceFromServer = props.attendance_percentage ?? { school: '0%', event: '0%', eskul: '0%' };

  const users: any[] = props.users ?? [];
  const events: any[] = props.events ?? [];
  const eskuls: any[] = props.eskuls ?? [];
  const statistik = props.statistik ?? { sekolah: 0, eskul: 0, event: 0 };


  const [rekapData, setRekapData] = useState<any[]>(props.rekap ?? []);
  const [filterMode, setFilterMode] = useState<'bulan' | 'semester'>('bulan');
  const [bulan, setBulan] = useState<number>(dayjs().month() + 1);
  const [tahun, setTahun] = useState<number>(dayjs().year());
  const [semester, setSemester] = useState<1 | 2>(1);
  const [searchRekap, setSearchRekap] = useState<string>('');
  const [loadingRekap, setLoadingRekap] = useState<boolean>(false);
  const [range, setRange] = useState<'weekly' | 'monthly' | 'semester'>('weekly');
const [statistikData, setStatistikData] = useState({ sekolah: 0, eskul: 0, event: 0 });
  const [showModal, setShowModal] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    
useEffect(() => {
  axios.get(`/api/admin/dashboard/statistik?range=${range}`)
    .then(res => setStatistikData(res.data))
    .catch(err => console.error('Gagal ambil statistik:', err));
}, [range]);
  const fetchRekap = async () => {
  setLoadingRekap(true);
  try {
    const params = { filter: filterMode, bulan, tahun, semester, type: 'sekolah' };
    const res = await axios.get('/api/admin/rekap-kehadiran', { params });
    const data = res.data?.data ?? res.data ?? [];
    const merged = data.map((item: any) => {
      const existing = props.rekap?.find((r: any) => r.id === item.murid_id);
      return {
        ...item,
        avatar: item.avatar || existing?.avatar || '/default-avatar.png',
      };
    });

    setRekapData(Array.isArray(merged) ? merged : []);
  } catch (err) {
    console.error('Gagal ambil rekap:', err);
    setRekapData([]);
  } finally {
    setLoadingRekap(false);
  }
};


  useEffect(() => {
    fetchRekap();
  }, [filterMode, bulan, tahun, semester]);

  const filteredRekap = useMemo(() => {
    const q = searchRekap.trim().toLowerCase();
    if (!q) return rekapData;
    return rekapData.filter((r: any) => {
      const name = (r.nama || r.name || '').toString().toLowerCase();
      const kelas = (r.kelas || r.kelas_nama || '').toString().toLowerCase();
      return name.includes(q) || kelas.includes(q);
    });
  }, [rekapData, searchRekap]);

  const prevMonth = () => {
    if (bulan === 1) {
      setBulan(12);
      setTahun(tahun - 1);
    } else {
      setBulan(bulan - 1);
    }
  };
  const nextMonth = () => {
    if (bulan === 12) {
      setBulan(1);
      setTahun(tahun + 1);
    } else {
      setBulan(bulan + 1);
    }
  };

  const handleSemesterNav = (dir: 'prev' | 'next') => {
    if (dir === 'prev') {
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

  const topThree = filteredRekap.slice(0, 3);
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const currentMonthLabel = `${monthNames[bulan - 1]} ${tahun}`;
const [reportFilterMode, setReportFilterMode] = useState<"mingguan" | "bulanan" | "semester">("bulanan");
const [reportDate, setReportDate] = useState(dayjs());
const [reportData, setReportData] = useState<any[]>([]);
const [searchReport, setSearchReport] = useState("");

const [currentStart, setCurrentStart] = useState(dayjs());
const [currentEnd, setCurrentEnd] = useState(dayjs());
const [reportStart, setReportStart] = useState<string>("");
const [reportEnd, setReportEnd] = useState<string>("");
const [selectedEskul, setSelectedEskul] = useState<any | null>(null);
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;
const totalPages = Math.ceil(reportData.length / itemsPerPage);
const paginatedData = useMemo(() => {
  const startIdx = (currentPage - 1) * itemsPerPage;
  return reportData.slice(startIdx, startIdx + itemsPerPage);
}, [reportData, currentPage]);

const navigateReportPeriod = (dir: "prev" | "next") => {
  setReportDate((prev) => {
    if (reportFilterMode === "mingguan") {
      return prev.add(dir === "prev" ? -1 : 1, "week");
    }
    if (reportFilterMode === "bulanan") {
      return prev.add(dir === "prev" ? -1 : 1, "month");
    }
    const currentMonth = prev.month() + 1;
    const currentYear = prev.year();

    if (currentMonth >= 7) {
      if (dir === "next") {
        return dayjs(`${currentYear + 1}-01-01`);
      } else {
        return dayjs(`${currentYear}-01-01`);
      }
    } else {
      if (dir === "next") {
        return dayjs(`${currentYear}-07-01`);
      } else {
        return dayjs(`${currentYear - 1}-07-01`);
      }
    }
  });
};

useEffect(() => {
  if (reportFilterMode === "bulanan") {
    setReportDate(dayjs()); // bulan saat ini
  } else if (reportFilterMode === "mingguan") {
    const now = dayjs();
    const monday = now.startOf("week").add(1, "day");
    setCurrentStart(monday);
    setCurrentEnd(monday.add(4, "day"));
    setReportDate(now);
  }
}, [reportFilterMode]);

useEffect(() => {
  let start: dayjs.Dayjs;
  let end: dayjs.Dayjs;

  if (reportFilterMode === "mingguan") {
    const monday = dayjs().startOf("week").add(1, "day");
    start = monday;
    end = monday.add(4, "day");
  } else if (reportFilterMode === "bulanan") {
    start = reportDate.startOf("month");
    end = reportDate.endOf("month");
  } else {
    const month = reportDate.month() + 1;
    const year = reportDate.year();

    if (month >= 7) {
      start = dayjs(`${year}-07-01`);
      end = dayjs(`${year}-12-31`);
    } else {
      start = dayjs(`${year}-01-01`);
      end = dayjs(`${year}-06-30`);
    }
  }

  setCurrentStart(start);
  setCurrentEnd(end);
  setReportStart(start.format("YYYY-MM-DD"));
  setReportEnd(end.format("YYYY-MM-DD"));

  console.log("🧭 Period updated:", {
    mode: reportFilterMode,
    start: start.format("YYYY-MM-DD"),
    end: end.format("YYYY-MM-DD"),
  });
}, [reportDate, reportFilterMode]);


useEffect(() => {
  if (!reportStart || !reportEnd) return;

  console.log("📤 Fetching report:", {
    mode: reportFilterMode,
    start: reportStart,
    end: reportEnd,
  });

  axios
    .get(`/api/admin/dashboard/report`, {
      params: {
        range: reportFilterMode,
        start_date: reportStart,
        end_date: reportEnd,
      },
    })
    .then((res) => {
      console.log("📊 Data fetched:", res.data.periode);
      setReportData(res.data.data ?? []);
    })
    .catch((err) => console.error("Gagal ambil report:", err));
}, [reportStart, reportEnd, reportFilterMode]);

const reportPeriodLabel = useMemo(() => {
  if (reportFilterMode === "mingguan") {
    const start = currentStart?.format("DD MMM");
    const end = currentEnd?.format("DD MMM YYYY");
    return `${start} – ${end}`;
  }

  if (reportFilterMode === "bulanan") {
    return `${reportDate.format("MMMM YYYY")}`;
  }


  const month = reportDate.month() + 1;
  const year = reportDate.year();

  let semesterNumber, semesterLabelYear;

  if (month >= 7) {
    semesterNumber = 1;
    semesterLabelYear = year;
  } else {
    semesterNumber = 2;
    semesterLabelYear = year - 1;
  }

  return `Semester ${semesterNumber} — ${semesterLabelYear}`;
}, [reportFilterMode, reportDate, currentStart, currentEnd]);



const filteredReport = useMemo(() => {
  const q = searchReport.trim().toLowerCase();
  if (!q) return reportData;
  return reportData.filter((r: any) => (r.nama || r.name || "").toLowerCase().includes(q));
}, [reportData, searchReport]);

const [reportPage, setReportPage] = useState<number>(1);
const REPORT_PAGE_SIZE = 5;
const totalReportItems = filteredReport.length;
const totalReportPages = Math.max(1, Math.ceil(totalReportItems / REPORT_PAGE_SIZE));

const paginatedReport = useMemo(() => {
  const startIdx = (reportPage - 1) * REPORT_PAGE_SIZE;
  return filteredReport.slice(startIdx, startIdx + REPORT_PAGE_SIZE);
}, [filteredReport, reportPage]);

useEffect(() => {
  setReportPage(1);
}, [reportFilterMode, currentStart, currentEnd, searchReport, reportData]);

{selectedEskul && (
  <EditEskulModal
    eskul={selectedEskul}
    onClose={() => setSelectedEskul(null)}
  />
)}

  const deleteEvent = (id: number) => {
  if (confirm("Apakah kamu yakin ingin menghapus event ini?")) {
    router.delete(route("admin.events.destroy", id));
  }
};

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <Head title="Dashboard" />
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-x-auto p-4">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center bg-white p-2 gap-10 rounded-xl shadow border">
              <div className="flex items-center gap-2 p-2">
                <img src={props.auth?.user?.avatar ?? '/images/avatar-placeholder.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                <div className="text-[16px]">{props.auth?.user?.name ?? 'Admin'}</div>
              </div>
              <div>
              <button className="p-2 rounded bg-white">⚙️</button>
              <button className="p-2 rounded bg-white">🔓</button>
              </div>
              
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SmallCard title="Total Siswa" value={totalUsers} />
            <SmallCard title="Event Aktif" value={totalEvents} />
            <SmallCard title="Ekstrakulikuler" value={totalEskul} />
            <SmallCard title="Rata-rata Kehadiran" value={attendanceFromServer.school ?? '0%'} />
          </div>

          {/* Users, Events, Eskul */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Users */}
<div className="bg-white rounded-xl shadow p-4 border border-[#8B23ED] shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]">
  <div className="flex justify-between items-center mb-3">
    <div className="font-semibold">User</div>
    <CreateUserModalAdmin />
  </div>

  <div className="space-y-3 max-h-90 overflow-y-auto pr-2">
    {users.length === 0 && <div className="text-sm text-gray-500">Tidak ada data user</div>}

    {users.map((u: any) => (
      <div
        key={u.id}
        className="flex items-center justify-between border rounded-lg p-2 w-full"
      >
        <div className="flex items-center gap-3">
          <img
            src={
              u.avatar?.startsWith('data:image')
                ? u.avatar
                : u.avatar_path
                ? `/storage/${u.avatar_path.replace(/^public\//, '')}`
                : '/default-avatar.png'
            }
            alt={u.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium">{u.name}</div>
            <div className="text-xs text-gray-500">{u.role ?? 'Siswa'}</div>
          </div>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
              •••
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>
              <a
                href={`/admin/users/${u.id}`}
                className="text-[#7B5EF3] w-full text-left"
              >
                Detail
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (confirm(`Yakin ingin menghapus user "${u.name}"?`)) {
                  axios
                    .delete(`/admin/users/${u.id}`)
                    .then(() => {
                      alert('User berhasil dihapus');
                      window.location.reload();
                    })
                    .catch(() => alert('Gagal menghapus user'));
                }
              }}
              className="text-red-600"
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ))}
  </div>
</div>


            {/* Events */}
            <div className="bg-white rounded-xl shadow p-4 border border-[#8B23ED] shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]">
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold">Event</div>
                <Button
                onClick={() => setShowModal(true)}
                className="text-sm bg-[#8B23ED] text-white px-3 py-2 mr-2 rounded"
              >
                Tambah
              </Button>
              </div>
              <div className="space-y-3 max-h-90 overflow-y-auto pr-2">
                {events.length === 0 && <div className="text-sm text-gray-500">Tidak ada event</div>}
                {events.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between border rounded-lg p-2 w-full">
                    <div>
                      <div className="font-medium">{e.title || e.nama || 'Event'}</div>
                      <div className="text-xs text-gray-500">
                        {e.start_date ? new Date(e.start_date).toLocaleDateString() : ''} - {e.end_date ? new Date(e.end_date).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <div className='flex gap-4'>
                    <div className={`flex text-xs font-semibold px-3 py-1 rounded-full items-center ${getEventStatusColor(e.status_event)}`}>
                      {e.status_event ?? 'Tidak Aktif'}
                    </div>
                     <div className="mr-3">
                      <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-md bg-white hover:bg-gray-100 px-2 py-1">
                          •••
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.visit(route("admin.events.detail", e.id))}
                        >
                          Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteEvent(e.id)}
                          className="text-red-600"
                        >
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eskul */}
            <div className="bg-white rounded-xl shadow p-4 border border-[#8B23ED] shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]">
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold">Ekstrakulikuler</div>
                <Button
                onClick={() => setShowCreate(true)}
                className="text-sm bg-[#8B23ED] text-white px-3 py-2 mr-2 rounded"
              >
                Tambah
              </Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {eskuls.length === 0 && <div className="text-sm text-gray-500">Tidak ada eskul</div>}
                {eskuls.map((k: any) => (
                  <div key={k.id} className="flex items-center justify-between border rounded-lg p-3 w-full">
                    <div className="font-medium text-[16px]">{k.nama}</div>
                    <div className="flex gap-4">
                      <div className="text-xs text-white border rounded-lg bg-orange-600 p-1">
                        {k.anggota_count ?? (k.anggota ?? 0)} Anggota
                      </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-md bg-white hover:bg-gray-100">
                          •••
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedEskul(k)}>
                          Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus Eskul "${k.nama}"?`)) {
                              router.delete(route("admin.eskul.destroy", k.id));
                            }
                          }}
                          className="text-red-600"
                        >
                          Hapus Eskul
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistik + Rekap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4 border border-[#8B23ED] h-91 shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]">
              <div className=" items-center justify-between mb-3">
                <div className="font-semibold text-[23px] mb-3">Statistik Kehadiran</div>
                <div className="space-x-2 flex gap-2 mb-5">
                  <div className='mt-1'>
                    <img src="" alt="" />
                    <label htmlFor="" className='text-[16px]'>Filter</label>
                  </div>
                  <button onClick={() => setRange('weekly')} className={`px-3 py-1 rounded border border-[#8B23ED] ${range === 'weekly' ? 'bg-[#8B23ED] text-white' : 'bg-gray-100'}`}>Mingguan</button>
                  <button onClick={() => setRange('monthly')} className={`px-3 py-1 rounded border border-[#8B23ED] ${range === 'monthly' ? 'bg-[#8B23ED] text-white' : 'bg-gray-100'}`}>Bulanan</button>
                  <button onClick={() => setRange('semester')} className={`px-3 py-1 rounded border border-[#8B23ED] ${range === 'semester' ? 'bg-[#8B23ED] text-white' : 'bg-gray-100'}`}>Semester</button>
                </div>
              </div>
              <div>
              <ProgressLine label="Kehadiran sekolah" percent={Number(statistikData.sekolah)} />
              <ProgressLine label="Kehadiran Ekstrakulikuler" percent={Number(statistikData.eskul)} />
              <ProgressLine label="Kehadiran Event" percent={Number(statistikData.event)} />

              </div>
            </div>

            {/* Rekap Kehadiran */}
            <div className="bg-white rounded-xl shadow border border-[#8B23ED] p-5 shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]">
              <div>
                  <h2 className="text-[23px] font-semibold mb-3">Rekap Kehadiran Siswa</h2>
                </div>
              <div className="flex flex-wrap justify-end items-center mb-4 gap-2">
                
                <div className="flex flex-wrap items-center gap-2">
                  <button className="flex items-center gap-1 bg-[#8B23ED] text-white px-3 py-1.5 rounded-lg text-[15px]">⚙️ Filter</button>
                  <button
                    onClick={() => setFilterMode('bulan')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${filterMode === 'bulan' ? 'bg-[#8B23ED] text-white' : 'border border-[#8B23ED] text-[#8B23ED]'}`}
                  >
                    Bulanan
                  </button>
                  <button
                    onClick={() => setFilterMode('semester')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${filterMode === 'semester' ? 'bg-[#8B23ED] text-white' : 'border border-[#8B23ED] text-[#8B23ED]'}`}
                  >
                    Semester
                  </button>
                  <input
                    type="text"
                    placeholder="Cari"
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                    value={searchRekap}
                    onChange={(e) => setSearchRekap(e.target.value)}
                  />
                </div>
              </div>

              {/* KODE JIKA INGIN ADA NAVIGASI BULAN/SEMESTER */}
              {/* <div className="flex items-center justify-between mb-4">
                {filterMode === 'bulan' ? (
                  <div className="flex items-center gap-3">
                    <button onClick={prevMonth} className="px-2 py-1 rounded border">◀</button>
                    <div className="text-sm font-medium">{currentMonthLabel}</div>
                    <button onClick={nextMonth} className="px-2 py-1 rounded border">▶</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleSemesterNav('prev')} className="px-2 py-1 rounded border">◀</button>
                    <div className="text-sm font-medium">Semester {semester} — {tahun}</div>
                    <button onClick={() => handleSemesterNav('next')} className="px-2 py-1 rounded border">▶</button>
                  </div>
                )}
                <div className="text-xs text-gray-500">{loadingRekap ? 'Memuat...' : `${filteredRekap.length} siswa`}</div>
              </div> */}

              <div className="space-y-2">
                {filteredRekap.length === 0 && (
                  <div className="text-sm text-gray-500 text-center">Tidak ada data</div>
                )}
                {topThree.map((r: any, i: number) => {
                console.log("Rekap avatar URL:", r.avatar);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between border rounded-xl p-3 bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                src={r.avatar || '/default-avatar.png'}
                alt={r.nama}
                onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                className="w-10 h-10 rounded-full object-cover"
              />

                    <div>
                      <div className="font-medium">{r.nama}</div>
                      <div className="text-xs text-gray-500">{r.kelas}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 text-right">{r.total ?? '-'}</div>
                    <div className="font-semibold text-[#8B23ED]">{r.persentase ?? 0}</div>
                  </div>
                </div>
              );
            })}

              </div>
            </div>
          </div>
  {/* Report Kehadiran Table (uses restored reportFilterMode/searchReport/filteredReport) */}
            <div className="bg-white rounded-xl shadow p-4 border border-[#8B23ED] shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]">
             <div className=" flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
              <div className="font-semibold text-lg mb-6">Report Kehadiran</div>

            

              <div className="flex items-center gap-6 flex-wrap ">
                <div className="flex items-center gap-2">
                <img src="" alt="" />
                <label htmlFor="">Filter</label>
              </div>
              <div className="flex items-center m-0 gap-0">
                <button onClick={() => navigateReportPeriod("prev")} className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200">◀</button>
                <div className="text-sm font-medium text-gray-700 min-w-[150px] text-center">{reportPeriodLabel}</div>
                <button onClick={() => navigateReportPeriod("next")} className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200">▶</button>
              </div>
                <button onClick={() => setReportFilterMode("mingguan")} className={`px-3 py-1 rounded border border-[#8B23ED] ${reportFilterMode === "mingguan" ? "bg-[#8B23ED] text-white" : "bg-gray-100"}`}>Mingguan</button>
                <button onClick={() => setReportFilterMode("bulanan")} className={`px-3 py-1 rounded border border-[#8B23ED] ${reportFilterMode === "bulanan" ? "bg-[#8B23ED] text-white" : "bg-gray-100"}`}>Bulanan</button>
                <button onClick={() => setReportFilterMode("semester")} className={`px-3 py-1 rounded border border-[#8B23ED] ${reportFilterMode === "semester" ? "bg-[#8B23ED] text-white" : "bg-gray-100"}`}>Semester</button>

                <input
                  value={searchReport}
                  onChange={(e) => setSearchReport(e.target.value)}
                  placeholder="cari"
                  className="border rounded px-3 py-2 text-sm"
                />
                <button className="px-3 py-2 bg-green-500 text-white rounded">Download Report</button>
              </div>
            </div>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-t ">
                      <th className="py-2 pr-4">No</th>
                      <th className="py-2 pr-4">Nama</th>
                      <th className="py-2 pr-4">Kelas</th>
                      <th className="py-2 pr-4">Kejuruan</th>
                      <th className="py-2 pr-4">Jumlah Hadir Sekolah</th>
                      <th className="py-2 pr-4">Jumlah Hadir Ekstrakulikuler</th>
                      <th className="py-2 pr-4">Jumlah Hadir Event</th>
                      <th className="py-2 pr-4">Total Kehadiran</th>
                      <th className="py-2 pr-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.murid_id}>
                        <td className="py-3 pr-4">{item.no}</td>
                        <td className="py-3 pr-4">{item.nama}</td>
                        <td className="py-3 pr-4">{item.kelas}</td>
                        <td className="py-3 pr-4">{item.keahlian}</td>
                        <td className="py-3 pr-4">{item.hadir_sekolah}</td>
                        <td className="py-3 pr-4">{item.hadir_ekskul}</td>
                        <td className="py-3 pr-4">{item.hadir_event}</td>
                        <td className="py-3 pr-4">{item.total}</td>
                        <td className="py-3 pr-4">{item.keterangan}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-3">Tidak ada data</td>
                    </tr>
                  )}
                </tbody>
                </table>
               <div className="flex justify-end mt-6">
                  <div className="flex items-center gap-2 border rounded-full px-3 py-1 bg-white shadow-sm">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // tampilkan 1, 2, ..., halaman aktif ±2, ..., halaman terakhir
                        if (page === 1 || page === totalPages) return true;
                        if (page >= currentPage - 2 && page <= currentPage + 2) return true;
                        return false;
                      })
                      .map((page, index, visible) => {
                        const prevPage = visible[index - 1];
                        const showDots = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showDots && <span className="px-2 text-gray-400">…</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 rounded-full transition-all duration-150 ${
                                currentPage === page
                                  ? 'bg-orange-400 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

          </main>
        </div>
        {/* Modal Tambah Event */}
              {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto p-6 relative">
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
                    >
                      ✕
                    </button>
                    <h2 className="text-lg font-semibold mb-4">Tambah Event Baru</h2>
                    <ManageEventsModal onClose={() => setShowModal(false)} />
                  </div>
                </div>
              )}
               {showCreate && <CreateEskulModal onClose={() => setShowCreate(false)} />}
          {selectedEskul && (
          <EditEskulModal
            eskul={selectedEskul}
            onClose={() => setSelectedEskul(null)}
          />
        )}
                    
      </div>
  );
}
