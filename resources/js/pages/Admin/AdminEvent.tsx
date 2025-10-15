// resources/js/Pages/Admin/Event/AdminEvent.tsx
import React, { useMemo, useState } from "react";
import { usePage, Head, router } from "@inertiajs/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ManageEventsModal from "./ManageEvents";


interface Event {
  id: number;
  title: string;
  type: string;
  start_date: string;
  end_date: string;
  created_at: string;
  is_published: boolean;
}

interface PageProps {
  auth: { user: any };
  events: Event[];
}

export default function AdminEvent() {
  const { events } = usePage<PageProps>().props;

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // 🔍 Filtering
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "published" && e.is_published) ||
        (filterStatus === "draft" && !e.is_published);
      return matchSearch && matchStatus;
    });
  }, [events, search, filterStatus]);

  const deleteEvent = (id: number) => {
    if (confirm("Apakah kamu yakin ingin menghapus event ini?")) {
      router.delete(route("admin.events.destroy", id));
    }
  };

  const [showModal, setShowModal] = useState(false);


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Head title="Event Management" />
      <div className="max-w-full">
        <div className="flex items-start gap-6">
         {/* Sidebar */}
                  <aside className="w-56 bg-white h-screen p-4 shadow">
                    <nav className="space-y-2 text-sm">
                      <div onClick={() => (window.location.href = '/Admin/Dashboard')}
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer">🏠 Dashboard</div>
                      <div onClick={() => (window.location.href = '/Admin/UserManagement')}
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer">👥 User Manajemen</div>
                      <div onClick={() => (window.location.href = '/admin/events')}
                        className="p-2 rounded bg-gray-200 font-medium cursor-pointer">📅 Event Manajemen</div>
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

          {/* Konten utama - Tabel Event Management */}
          <main className="flex-1 bg-white p-6 rounded-xl shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-semibold">
                Total Event: {events.length}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Cari judul event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white rounded hover:bg-indigo-600"
                >
                  + Tambah Event
                </Button>


              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 px-3">Judul</th>
                    <th className="py-2 px-3">Tipe</th>
                    <th className="py-2 px-3">Mulai</th>
                    <th className="py-2 px-3">Selesai</th>
                    <th className="py-2 px-3">Tanggal dibuat</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-gray-500 py-6"
                      >
                        Tidak ada event
                      </td>
                    </tr>
                  )}
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b bg-gray-50 "
                    >
                      <td className="py-3 px-3">{event.title}</td>
                      <td className="py-3 px-3 capitalize">{event.type}</td>
                      <td className="py-3 px-3">{event.start_date}</td>
                      <td className="py-3 px-3">{event.end_date}</td>
                      <td className="py-3 px-3">
                        {new Date(event.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            event.is_published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {event.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              ⋮
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.visit(
                                  route("admin.events.detail", event.id)
                                )
                              }
                            >
                              Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteEvent(event.id)}
                              className="text-red-600"
                            >
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
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

        </div>
      </div>
    </div>
  );
}
