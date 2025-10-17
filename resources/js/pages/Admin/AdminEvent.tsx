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
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-gray-900">
      <Head title="Event Management" />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white h-screen p-4 shadow-sm border-r border-gray-200">
          <nav className="space-y-2 text-sm">
            <div onClick={() => (window.location.href = '/Admin/Dashboard')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer">🏠 Dashboard</div>
            <div onClick={() => (window.location.href = '/Admin/UserManagement')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer">👥 User Manajemen</div>
            <div onClick={() => (window.location.href = '/admin/events')}
              className="p-2 rounded bg-[#FFE9D6] font-medium cursor-pointer text-[#D76619]">📅 Event Manajemen</div>
            <div onClick={() => (window.location.href = '/admin/eskul')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer">⚽ Ekstrakurikuler</div>
            <div onClick={() => (window.location.href = '/admin/riwayat-kehadiran')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer">📈 Riwayat Kehadiran</div>
            <div onClick={() => (window.location.href = '/admin/statistik-kehadiran')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer">📊 Statistik Kehadiran</div>
            <div onClick={() => (window.location.href = '/admin/laporan-kehadiran')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer">📄 Laporan</div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Event Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Semua Event <span className="font-semibold">{events.length}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="cari event"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-[#CBB2F5]"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CBB2F5]"
              >
                <option value="all">Filter</option>
                <option value="published">Aktif</option>
                <option value="draft">Tidak Aktif</option>
              </select>

              <Button
                onClick={() => setShowModal(true)}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium px-4 py-2 rounded-lg"
              >
                Tambah Event
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[#EFE6FF] border-b border-[#D9C9FF]">
                <tr className="text-left text-gray-700 font-medium">
                  <th className="py-3 px-4 w-16">No</th>
                  <th className="py-3 px-4">Tanggal Awal</th>
                  <th className="py-3 px-4">Tanggal Akhir</th>
                  <th className="py-3 px-4">Nama Event</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-6">
                      Tidak ada event
                    </td>
                  </tr>
                )}
                {filteredEvents.map((event, index) => (
                  <tr key={event.id} className="border-b hover:bg-[#FAF7FF] transition">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{event.start_date}</td>
                    <td className="py-3 px-4">{event.end_date}</td>
                    <td className="py-3 px-4">{event.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {event.is_published ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-none hover:bg-gray-100"
                          >
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.visit(route("admin.events.detail", event.id))
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

          {/* Pagination */}
          <div className="flex justify-end mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 border rounded ${
                    page === 1
                      ? "bg-[#FF8A3D] text-white border-[#FF8A3D]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
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
    </div>
  );
}
