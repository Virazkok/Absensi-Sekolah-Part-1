import React, { useState } from "react";
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

interface Siswa {
  id: number;
  name: string;
  kelas: { name: string };
  kejuruan?: string;
}

interface Eskul {
  id: number;
  nama: string;
  siswa: {
    data: Siswa[];
    current_page: number;
    last_page: number;
    from: number;
  };
}

interface PageProps {
  eskuls: Eskul[];
  filters: { search: string };
}

export default function AdminEskul() {
  const { eskuls, filters } = usePage<PageProps>().props;
  const [search, setSearch] = useState(filters.search || "");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEskul, setSelectedEskul] = useState<Eskul | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route("admin.eskul.index"), { search });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Head title="Ekstrakurikuler" />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white h-screen p-4 shadow">
          <nav className="space-y-2 text-sm">
            <div
              onClick={() => (window.location.href = "/Admin/Dashboard")}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              🏠 Dashboard
            </div>
            <div
              onClick={() => (window.location.href = "/Admin/UserManagement")}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              👥 User Manajemen
            </div>
            <div
              onClick={() => (window.location.href = "/admin/events")}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              📅 Event Manajemen
            </div>
            <div
              className="p-2 rounded bg-gray-200 font-medium cursor-pointer"
              onClick={() => (window.location.href = "/admin/eskul")}
            >
              ⚽ Ekstrakurikuler
            </div>
            <div
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
              onClick={() => (window.location.href = "/admin/riwayat-kehadiran")}
            >
              📈 Riwayat Kehadiran
            </div>
            <div
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
              onClick={() => (window.location.href = "/admin/statistik-kehadiran")}
            >
              📊 Statistik Kehadiran
            </div>
            <div
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
              onClick={() => (window.location.href = "/admin/laporan-kehadiran")}
            >
              📄 Laporan
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Ekstrakurikuler</h1>
            <div className="flex gap-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari nama eskul"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded p-2"
                />
                <Button type="submit">Cari</Button>
              </form>
              <Button onClick={() => setShowCreate(true)} className="bg-purple-600 hover:bg-purple-700">
                + Tambah
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Semua Ekstrakurikuler : {eskuls.length}
          </p>

          {eskuls.map((eskul) => (
            <div key={eskul.id} className="mb-8 bg-white p-4 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-3">{eskul.nama}</h2>

              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
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
                      <tr key={s.id} className="border-t">
                        <td className="p-2 text-center">{eskul.siswa.from + idx}</td>
                        <td className="p-2">{s.name}</td>
                        <td className="p-2">{s.kelas?.name}</td>
                        <td className="p-2">{s.kejuruan || "-"}</td>
                        <td className="p-2 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">⋮</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedEskul(eskul)}>
                                Detail
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </main>
      </div>

      {showCreate && <CreateEskulModal onClose={() => setShowCreate(false)} />}
      {selectedEskul && (
        <EditEskulModal eskul={selectedEskul} onClose={() => setSelectedEskul(null)} />
      )}
    </div>
  );
}
