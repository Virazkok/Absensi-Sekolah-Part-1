import React, { useMemo, useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import dayjs from 'dayjs';

type Props = any;

const SmallCard: React.FC<{ title: string; value: React.ReactNode }> = ({ title, value }) => (
  <div className="bg-white rounded-xl border border-[#6200EE] shadow-sm p-4 flex flex-col justify-center">
    <div className="text-sm text-gray-500 text-center">{title}</div>
    <div className="text-2xl font-bold mt-2 text-center">{value}</div>
  </div>
);

const ProgressLine: React.FC<{ label: string; percent: number }> = ({ label, percent }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <div className="text-gray-600">{label}</div>
      <div className="text-gray-600">{percent}%</div>
    </div>
    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${percent}%` }} />
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

  // Top summary fallback
  const totalUsers = props.total_users ?? 0;
  const totalEvents = props.total_events ?? 0;
  const totalEskul = props.total_eskul ?? 0;
  const attendanceFromServer = props.attendance_percentage ?? { school: '0%', event: '0%', eskul: '0%' };

  // Data lists from server
  const users: any[] = props.users ?? [];
  const events: any[] = props.events ?? [];
  const eskuls: any[] = props.eskuls ?? [];
  const statistik = props.statistik ?? { sekolah: 0, eskul: 0, event: 0 };

  // =========================
  // Rekap (interactive block)
  // =========================
  const [rekapData, setRekapData] = useState<any[]>(props.rekap ?? []);
  const [filterMode, setFilterMode] = useState<'bulan' | 'semester'>('bulan'); // bulan|semester for rekap UI
  const [bulan, setBulan] = useState<number>(dayjs().month() + 1); // 1..12
  const [tahun, setTahun] = useState<number>(dayjs().year());
  const [semester, setSemester] = useState<1 | 2>(1);
  const [searchRekap, setSearchRekap] = useState<string>('');
  const [loadingRekap, setLoadingRekap] = useState<boolean>(false);

  // Fetch rekap from API (like RiwayatKehadiran)
  const fetchRekap = async () => {
    setLoadingRekap(true);
    try {
      // adapt params to your API naming (RiwayatController expects mode/week/month/year in earlier examples)
      // Here we send 'filter','bulan','tahun','semester','type'
      const params: any = {
        filter: filterMode === 'bulan' ? 'bulan' : 'semester',
        bulan,
        tahun,
        semester,
        type: 'sekolah',
      };

      const res = await axios.get('/api/admin/riwayat-kehadiran', { params });
      // API shape may be { success, data, summary } or raw array
      const data = res.data?.data ?? res.data ?? [];
      setRekapData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal ambil rekap:', err);
      setRekapData([]);
    } finally {
      setLoadingRekap(false);
    }
  };

  useEffect(() => {
    fetchRekap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Month navigation helpers
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

  // Semester nav
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

  // Top 3 to display
  const topThree = filteredRekap.slice(0, 3);

  // Month label
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const currentMonthLabel = `${monthNames[bulan - 1]} ${tahun}`;

  // =========================
  // Report (kehadiran table) — restore missing states used in JSX
  // =========================
  const [reportFilterMode, setReportFilterMode] = useState<'mingguan' | 'bulanan' | 'semester'>('mingguan');
  const [searchReport, setSearchReport] = useState<string>('');
  const reportData: any[] = props.report ?? [];

  const filteredReport = useMemo(() => {
    const q = searchReport.trim().toLowerCase();
    if (!q) return reportData;
    return reportData.filter((r: any) => {
      const name = (r.nama || r.name || '').toString().toLowerCase();
      return name.includes(q);
    });
  }, [reportData, searchReport]);

  // =========================
  // Render
  // =========================
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 ">
      <Head title="Dashboard" />
      <div className="max-w-full mr-5">
        <div className="flex items-start gap-6">
          {/* Sidebar */}
          <aside className="w-56 bg-white h-screen p-4 shadow">
            <nav className="space-y-2 text-sm">
              <div onClick={() => (window.location.href = '/Admin/Dashboard')}
                className="p-2 rounded bg-[#E86D1F] font-medium cursor-pointer text-white">🏠 Dashboard</div>
              <div onClick={() => (window.location.href = '/Admin/UserManagement')}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer">👥 User Manajemen</div>
              <div onClick={() => (window.location.href = '/admin/events')}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer">📅 Event Manajemen</div>
              <div onClick={() => (window.location.href = '/admin/eskul')}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer">⚽ Ekstrakurikuler</div>
              <div onClick={() => (window.location.href = '/admin/riwayat-kehadiran')}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer">📈 Riwayat Kehadiran</div>
              <div onClick={() => (window.location.href = '/admin/statistik-kehadiran')}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer">📈 Statistik Kehadiran</div>
              <div onClick={() => (window.location.href = '/admin/laporan-kehadiran')}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer">📄 Laporan</div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Admin</h1>
              <div className="flex items-center gap-3">
                <button className="p-2 rounded border bg-white">⚙️</button>
                <button className="p-2 rounded border bg-white">🔓</button>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow">
                  <img src={props.auth?.user?.avatar_url ?? '/images/avatar-placeholder.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  <div className="text-sm">{props.auth?.user?.name ?? 'Admin'}</div>
                </div>
              </div>
            </div>

            {/* Top summary cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <SmallCard title="Total Siswa" value={totalUsers} />
              <SmallCard title="Event Aktif" value={totalEvents} />
              <SmallCard title="Ekstrakulikuler" value={totalEskul} />
              <SmallCard title="Rata-rata Kehadiran" value={attendanceFromServer.school ?? '0%'} />
            </div>

            {/* three columns */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Users */}
              <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">User</div>
                  <button className="text-sm bg-[#6200EE] text-white px-3 py-1 rounded">tambah</button>
                </div>
                <div className="space-y-3 h-90 pr-2">
                  {users.length === 0 && <div className="text-sm text-gray-500">Tidak ada data user</div>}
                  {users.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between border rounded-lg p-2 w-120">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url ?? '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.role ?? 'Siswa'}</div>
                        </div>
                      </div>
                      <div className="text-gray-400">...</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events */}
              <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">Event</div>
                  <button className="text-sm bg-[#6200EE] text-white px-3 py-1 rounded">tambah</button>
                </div>
                <div className="space-y-3 h-90 pr-2">
                  {events.length === 0 && <div className="text-sm text-gray-500">Tidak ada event</div>}
                  {events.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between border rounded-lg p-2 w-120">
                      <div>
                        <div className="font-medium">{e.title || e.nama || 'Event'}</div>
                        <div className="text-xs text-gray-500">
                          {e.start_date ? new Date(e.start_date).toLocaleDateString() : ''} - {e.end_date ? new Date(e.end_date).toLocaleDateString() : ''}
                        </div>
                      </div>
                      <div className={`text-xs font-semibold px-3 py-1 rounded-full ${getEventStatusColor(e.status_event)}`}>
                        {e.status_event ?? 'Tidak Aktif'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eskul */}
              <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">Ekstrakulikuler</div>
                  <button className="text-sm bg-[#6200EE] text-white px-3 py-1 rounded">tambah</button>
                </div>
                <div className="space-y-3 h-90 pr-2">
                  {eskuls.length === 0 && <div className="text-sm text-gray-500">Tidak ada eskul</div>}
                  {eskuls.map((k: any) => (
                    <div key={k.id} className="flex items-center justify-between border rounded-lg p-3 w-120">
                      <div className="font-medium">{k.nama}</div>
                      <div className="flex gap-4">
                        <div className="text-xs text-white border rounded-lg bg-orange-600 p-1">
                          {k.anggota_count ?? (k.anggota ?? 0)} Anggota
                        </div>
                        <div>...</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistik + Rekap */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Statistik Kehadiran</div>
                  <div className="space-x-2">
                    <button onClick={() => {}} className={`px-3 py-1 rounded bg-[#6200EE] text-white`}>Mingguan</button>
                    <button onClick={() => {}} className={`px-3 py-1 rounded bg-gray-100`}>Bulanan</button>
                    <button onClick={() => {}} className={`px-3 py-1 rounded bg-gray-100`}>Semester</button>
                  </div>
                </div>
                <div>
                  <ProgressLine label="Kehadiran sekolah" percent={Number(statistik.sekolah ?? statistik.school ?? 0)} />
                  <ProgressLine label="Kehadiran Ekstrakulikuler" percent={Number(statistik.eskul ?? statistik.ekskul ?? 0)} />
                  <ProgressLine label="Kehadiran Event" percent={Number(statistik.event ?? 0)} />
                </div>
              </div>

              {/* Rekap Kehadiran (interactive) */}
              <div className="bg-white rounded-2xl shadow border border-[#C9A2FF] p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Rekap Kehadiran Siswa</h2>
                    <div className="text-xs text-gray-500">{filterMode === 'bulan' ? currentMonthLabel : `Semester ${semester} ${tahun}`}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 bg-[#7B4EFF] text-white px-3 py-1.5 rounded-lg text-sm">
                      ⚙️ Filter
                    </button>

                    <button
                      onClick={() => setFilterMode('bulan')}
                      className={`px-3 py-1.5 rounded-lg text-sm ${filterMode === 'bulan' ? 'bg-[#7B4EFF] text-white' : 'border border-[#7B4EFF] text-[#7B4EFF]'}`}
                    >
                      Bulanan
                    </button>

                    <button
                      onClick={() => setFilterMode('semester')}
                      className={`px-3 py-1.5 rounded-lg text-sm ${filterMode === 'semester' ? 'bg-[#7B4EFF] text-white' : 'border border-[#7B4EFF] text-[#7B4EFF]'}`}
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

                {/* Navigation */}
                <div className="flex items-center justify-between mb-4">
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

                  <div className="text-xs text-gray-500">{loadingRekap ? 'Memuat...' : `${filteredRekap.length} hasil`}</div>
                </div>

                {/* List (top 3) */}
                <div className="space-y-3">
                  {topThree.length === 0 && !loadingRekap && <div className="text-sm text-gray-500">Tidak ada data rekap</div>}

                  {topThree.map((r: any) => (
                    <div key={r.id ?? r.murid_id ?? `${r.nama ?? r.name}-${Math.random()}`} className="flex justify-between items-center border rounded-xl p-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <img src={r.avatar_url ?? r.avatar ?? '/images/avatar-placeholder.png'} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="font-medium">{r.nama ?? r.name ?? '-'}</div>
                          <div className="text-xs text-gray-500">{ (r.kelas && (typeof r.kelas === 'string' ? r.kelas : (r.kelas?.name ?? r.kelas_nama ?? '-'))) }</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-400">{r.total ?? r.total_hadir ?? '-'}</div>
                        <div className="text-lg font-bold text-[#7B4EFF]">{(r.persentase ?? r.persen ?? r.persentase_s ?? '0')}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Kehadiran Table (uses restored reportFilterMode/searchReport/filteredReport) */}
            <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Report Kehadiran</div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600"></div>
                  <div className="space-x-2">
                    <button onClick={() => setReportFilterMode('mingguan')} className={`px-3 py-1 rounded ${reportFilterMode === 'mingguan' ? 'bg-[#6200EE] text-white' : 'bg-gray-100'}`}>Mingguan</button>
                    <button onClick={() => setReportFilterMode('bulanan')} className={`px-3 py-1 rounded ${reportFilterMode === 'bulanan' ? 'bg-[#6200EE] text-white' : 'bg-gray-100'}`}>Bulanan</button>
                    <button onClick={() => setReportFilterMode('semester')} className={`px-3 py-1 rounded ${reportFilterMode === 'semester' ? 'bg-[#6200EE] text-white' : 'bg-gray-100'}`}>Semester</button>
                  </div>
                  <input value={searchReport} onChange={e => setSearchReport(e.target.value)} placeholder="cari" className="border rounded px-3 py-2 text-sm" />
                  <button className="px-3 py-2 bg-green-500 text-white rounded">Download Report</button>
                </div>
              </div>

              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
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
                    {filteredReport.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-gray-500">Tidak ada data report</td>
                      </tr>
                    )}
                    {filteredReport.map((r: any, idx: number) => (
                      <tr key={r.no ?? r.id ?? idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 pr-4">{r.no ?? idx + 1}</td>
                        <td className="py-3 pr-4">{r.nama ?? r.name}</td>
                        <td className="py-3 pr-4">{r.kelas}</td>
                        <td className="py-3 pr-4">{r.kejuruan}</td>
                        <td className="py-3 pr-4">{r.hadir_sekolah ?? r.jumlah_hadir_sekolah ?? 0}</td>
                        <td className="py-3 pr-4">{r.hadir_ekskul ?? r.jumlah_hadir_ekskul ?? 0}</td>
                        <td className="py-3 pr-4">{r.hadir_event ?? r.jumlah_hadir_event ?? 0}</td>
                        <td className="py-3 pr-4">{r.total ?? r.jumlah_total ?? 0}</td>
                        <td className="py-3 pr-4">{r.keterangan ?? 'Baik'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
