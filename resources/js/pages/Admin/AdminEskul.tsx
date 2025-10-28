import React, { useEffect, useState } from "react";
import { usePage, router, Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import CreateEskulModal from "./AdminEskulCreate";
import EditEskulModal from "./AdminEskulDetail";
import AddMemberModal from "./AdminEskulAddAnggota";
import { Student } from "@/types";

interface Siswa {
  id: number;
  name: string;
  kelas: { name: string };
  keahlian?: string;
}

interface Eskul {
  id: number;
  nama: string;
  siswa: {
    data: Siswa[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
  };
}

interface PageProps {
  eskuls: Eskul[];
  filters: { search: string };
}
type Props = any;
export default function AdminEskul() {
  const { props } = usePage<Props>();
 
  const { eskuls, filters } = usePage<PageProps>().props;
  const [search, setSearch] = useState(filters.search || "");
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedEskul, setSelectedEskul] = useState<Eskul | null>(null);
  const [user, setUser] = useState<Student | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route("admin.eskul.index"), { search });
  };

  const handlePageChange = (eskulId: number, page: number) => {
    router.get(route("admin.eskul.index"), { page, eskul_id: eskulId });
  };

  useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser && storedUser.id) {
        console.log("📦 User dari localStorage:", storedUser); // DEBUG
        setUser(storedUser);
      }
    }, []);
    
  const renderPagination = (eskul: Eskul) => {
    const { current_page, last_page } = eskul.siswa;
    if (last_page <= 1) return null;

    const pages: (number | string)[] = [];
    for (let i = 1; i <= last_page; i++) {
      if (
        i === 1 ||
        i === last_page ||
        (i >= current_page - 2 && i <= current_page + 2)
      ) {
        pages.push(i);
      } else if (
        pages[pages.length - 1] !== "…" &&
        (i === current_page - 3 || i === current_page + 3)
      ) {
        pages.push("…");
      }
    }

    return (
      <div className="flex justify-end mt-3">
        <div className="flex gap-1 bg-white border border-gray-600 rounded-full px-2 py-1 shadow-sm">
          {pages.map((p, idx) =>
            p === "…" ? (
              <span key={idx} className="px-2 text-gray-500">
                …
              </span>
            ) : (
              <button
                key={idx}
                onClick={() => handlePageChange(eskul.id, p as number)}
                className={`px-3 py-1 rounded-full text-sm ${
                  p === current_page
                    ? "bg-orange-300 text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Head title="Ekstrakurikuler" />
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block md:w-60 bg-white p-4 shadow-lg min-h-screen">
          <nav className="space-y-2 text-sm">
            <div onClick={() => (window.location.href = '/Admin/Dashboard')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--dashboard-line.svg" alt="" />Dashboard</div>
            <div onClick={() => (window.location.href = '/Admin/UserManagement')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--user-settings-line.svg" alt="" /> User Manajemen</div>
            <div onClick={() => (window.location.href = '/admin/events')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--list-settings-line.svg" alt="" /> Event Manajemen</div>
            <div onClick={() => (window.location.href = '/admin/eskul')}
              className="p-2 rounded bg-[#E86D1F] font-medium cursor-pointer text-white flex items-center gap-2"><img src="/icons/ri--user-community-lineW.svg" alt="" /> Ekstrakurikuler</div>
            <div onClick={() => (window.location.href = '/admin/riwayat-kehadiran')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--history-line.svg" alt="" /> Riwayat Kehadiran</div>
            <div onClick={() => (window.location.href = '/admin/statistik-kehadiran')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--pie-chart-2-line.svg" alt="" /> Statistik Kehadiran</div>
            <div onClick={() => (window.location.href = '/admin/laporan-kehadiran')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--file-text-line.svg" alt="" /> Laporan</div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <h1 className="text-2xl font-bold">Ekstrakurikuler</h1>
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
          <div className="flex justify-between items-center">
          </div>
          <div className="flex justify-between items-center mb-2 mt-10">
            <p className="text-sm text-gray-600">
              Semua Ekstrakurikuler : {eskuls.length}
            </p>
            
            <div className="flex gap-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari nama eskul"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded-lg p-1 border border-purple-700"
                />
              </form>
              <Button
                onClick={() => setShowAddMember(true)}
                className="border border-purple-700 bg-white-600 text-gray-900 hover:bg-purple-700 hover:text-white"
              >
                Tambah Anggota
              </Button>
              <Button
                onClick={() => setShowCreate(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Tambah Eskul
              </Button>
            </div>
          </div>

          

          {eskuls.map((eskul) => (
            <div
              key={eskul.id}
              className="mb-8 bg-white p-2 rounded-xl shadow border border-[#6200EE]"
            >
              <h2 className="text-xl font-semibold mb-3 ml-2">{eskul.nama}</h2>

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-2 w-12 text-center">No</th>
                    <th className="p-2 text-left">Nama Siswa</th>
                    <th className="p-2 text-left">Kelas</th>
                    <th className="p-2 text-left">Kejuruan</th>
                    <th className="p-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {eskul.siswa.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-4 text-gray-500">
                        Belum ada anggota
                      </td>
                    </tr>
                  ) : (
                    eskul.siswa.data.map((s, idx) => (
                      <tr key={s.id} className="border-b">
                        <td className="p-2 text-center">
                          {eskul.siswa.from + idx}
                        </td>
                        <td className="p-2">{s.name}</td>
                        <td className="p-2">{s.kelas?.name}</td>
                        <td className="p-2">{s.keahlian || "-"}</td>
                        <td className="p-2 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="text-black bg-white cursor-pointer"
                                size="sm"
                              >
                                ...
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setSelectedEskul(eskul)}
                              >
                                Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600"
                                onClick={() => {
                                  if (
                                    confirm(`Hapus ${s.name} dari ${eskul.nama}?`)
                                  ) {
                                    router.delete(
                                      route("admin.eskul.removeMember", {
                                        eskul: eskul.id,
                                      }),
                                      { data: { user_id: s.id } }
                                    );
                                  }
                                }}
                              >
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {renderPagination(eskul)}
            </div>
          ))}
        </main>
      </div>

      {showAddMember && (
        <AddMemberModal onClose={() => setShowAddMember(false)} />
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
