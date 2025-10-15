import React, { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

/**
 * AdminDashboard.tsx
 * - Tampilan disesuaikan persis dengan mock gambar yang diberikan
 * - Mengambil semua data dari props Inertia (backend Laravel yang sudah ada)
 * - TailwindCSS digunakan untuk styling
 *
 * Ekspektasi props (dikirim dari DashboardController atau controller lain):
 * {
 *   total_users, total_events, total_eskul,
 *   attendance_percentage: { school, event, eskul },
 *   users: [ { id, name, role, kelas, avatar_url } ],
 *   events: [ { id, title, start_date, is_active } ],
 *   eskuls: [ { id, nama, anggota_count } ],
 *   statistik: { sekolah: number, eskul: number, event: number },
 *   rekap: [ { id, name, kelas, percentage } ],
 *   report: [ { no, nama, kelas, kejuruan, hadir_sekolah, hadir_ekskul, hadir_event, total, keterangan } ]
 * }
 */

type Props = any;

const SmallCard: React.FC<{ title: string; value: React.ReactNode }> = ({ title, value }) => (
  <div className="bg-white rounded-xl border border-[#6200EE] shadow-sm p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold mt-2">{value}</div>
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

export default function AdminDashboard() {
  const { props } = usePage<Props>();

  // Fallbacks jika backend belum mengirim
  const totalUsers = props.total_users ?? 0;
  const totalEvents = props.total_events ?? 0;
  const totalEskul = props.total_eskul ?? 0;
  const attendance = props.attendance_percentage ?? { school: '0%', event: '0%', eskul: '0%' };

  const users: any[] = props.users ?? [];
  const events: any[] = props.events ?? [];
  const eskuls: any[] = props.eskuls ?? [];
  const statistik = props.statistik ?? { sekolah: 0, eskul: 0, event: 0 };
  const rekap: any[] = props.rekap ?? [];
  const report: any[] = props.report ?? [];

  // Filter state for statistik / rekap / report (Mingguan, Bulanan, Semester)
  const [filterMode, setFilterMode] = useState<'mingguan'|'bulanan'|'semester'>('mingguan');
  const [reportFilterMode, setReportFilterMode] = useState<'mingguan'|'bulanan'|'semester'>('mingguan');

  // Search
  const [searchRekap, setSearchRekap] = useState('');
  const [searchReport, setSearchReport] = useState('');

  const filteredRekap = useMemo(() => {
    const q = searchRekap.toLowerCase();
    if (!q) return rekap;
    return rekap.filter(r => (r.name || r.nama || '').toLowerCase().includes(q));
  }, [rekap, searchRekap]);

  const filteredReport = useMemo(() => {
    const q = searchReport.toLowerCase();
    if (!q) return report;
    return report.filter(r => (r.nama || r.name || '').toLowerCase().includes(q));
  }, [report, searchReport]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Head title="Dashboard" />
      <div className="max-w-full ">
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

          {/* Konten utama */}
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
              <SmallCard title="Rata-rata Kehadiran" value={attendance.school ?? '0%'} />
            </div>

            {/* Kiri: User, Event, Eskul (tiga kolom kecil) */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Users box */}
              <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">User</div>
                  <button className="text-sm bg-[#6200EE] text-white px-3 py-1 rounded">tambah</button>
                </div>
                <div className="space-y-3 h-56 overflow-auto pr-2">
                  {users.length === 0 && <div className="text-sm text-gray-500">Tidak ada data user</div>}
                  {users.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between">
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

              {/* Event box */}
              <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">Event</div>
                  <button className="text-sm bg-[#6200EE] text-white px-3 py-1 rounded">tambah</button>
                </div>
                <div className="space-y-3 h-56 overflow-auto pr-2">
                  {events.length === 0 && <div className="text-sm text-gray-500">Tidak ada event</div>}
                  {events.map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{e.title || e.nama || 'Event'}</div>
                        <div className="text-xs text-gray-500">{e.start_date ? new Date(e.start_date).toLocaleDateString() : ''}</div>
                      </div>
                      <div className={`text-sm px-3 py-1 rounded-full ${e.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {e.is_active ? 'Aktif' : 'Non-aktif'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eskul box */}
              <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold">Ekstrakulikuler</div>
                  <button className="text-sm bg-[#6200EE] text-white px-3 py-1 rounded">tambah</button>
                </div>
                <div className="space-y-3 h-56 overflow-auto pr-2">
                  {eskuls.length === 0 && <div className="text-sm text-gray-500">Tidak ada eskul</div>}
                  {eskuls.map((k: any) => (
                    <div key={k.id} className="flex items-center justify-between">
                      <div className="font-medium">{k.nama}</div>
                      <div className="text-xs text-gray-500">{k.anggota_count ?? (k.anggota ?? 0)} Anggota</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistik Kehadiran + Rekap Kehadiran Siswa */}
            <div className="grid grid-cols-2 gap-4 mb-6 ">
              <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Statistik Kehadiran</div>
                  <div className="space-x-2">
                    <button onClick={() => setFilterMode('mingguan')} className={`px-3 py-1 rounded ${filterMode === 'mingguan' ? 'bg-[#6200EE] text-white' : 'bg-gray-100'}`}>Mingguan</button>
                    <button onClick={() => setFilterMode('bulanan')} className={`px-3 py-1 rounded ${filterMode === 'bulanan' ? 'bg-[#6200EE] text-white' : 'bg-gray-100'}`}>Bulanan</button>
                    <button onClick={() => setFilterMode('semester')} className={`px-3 py-1 rounded ${filterMode === 'semester' ? 'bg-[#6200EE] text-white' : 'bg-gray-100'}`}>Semester</button>
                  </div>
                </div>
                <div>
                  <ProgressLine label="Kehadiran sekolah" percent={Number(statistik.sekolah ?? statistik.school ?? 0)} />
                  <ProgressLine label="Kehadiran Ekstrakulikuler" percent={Number(statistik.eskul ?? statistik.ekskul ?? 0)} />
                  <ProgressLine label="Kehadiran Event" percent={Number(statistik.event ?? 0)} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Rekap Kehadiran Siswa</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFilterMode('mingguan')} className={`px-3 py-1 rounded ${filterMode === 'mingguan' ? 'bg-[#6200EE] text-white' : 'bg-gray-100'}`}>Mingguan</button>
                    <button onClick={() => setFilterMode('bulanan')} className={`px-3 py-1 rounded ${filterMode === 'bulanan' ? 'bg-[#6200EE] text-white' : 'bg-gray-100'}`}>Bulanan</button>
                    <button onClick={() => setFilterMode('semester')} className={`px-3 py-1 rounded ${filterMode === 'semester' ? 'bg-[#6200EE] text-white' : 'bg-gray-100'}`}>Semester</button>
                  </div>
                </div>

                <div className="mb-3">
                  <input value={searchRekap} onChange={e => setSearchRekap(e.target.value)} placeholder="Cari" className="w-full border rounded px-3 py-2 text-sm" />
                </div>

                <div className="space-y-3 h-56 overflow-auto pr-2">
                  {filteredRekap.length === 0 && <div className="text-sm text-gray-500">Tidak ada data rekap</div>}
                  {filteredRekap.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={r.avatar_url ?? '/images/avatar-placeholder.png'} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="font-medium">{r.name ?? r.nama}</div>
                          <div className="text-xs text-gray-500">{r.kelas ?? r.kelas_nama ?? ''}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">{r.percentage ?? r.persen ?? '0%'}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Kehadiran Table */}
            <div className="bg-white rounded-xl shadow p-4 border border-[#6200EE]">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Report Kehadiran</div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">{/* date range placeholder */}</div>
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
