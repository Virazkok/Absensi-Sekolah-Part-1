import React, { useMemo, useState } from "react";
import { usePage, Link, Head } from "@inertiajs/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CreateUserModal from "@/pages/auth/register"; // import modal baru

type Props = {
  users: {
    data: {
      id: number;
      name: string;
      role: string;
      status: string;
      created_at: string;
    }[];
    current_page: number;
    last_page: number;
    total: number;
  };
};

export default function UserManagement() {
  const { props } = usePage<Props>();
  const { users } = props;

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // 🔍 Filtering
  const filteredUsers = useMemo(() => {
    return users.data.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "all" || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users.data, search, filterRole]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Head title="User Management" />
      <div className="max-w-full">
        <div className="flex items-start gap-6">
         {/* Sidebar */}
                  <aside className="w-56 bg-white h-screen p-4 shadow">
                    <nav className="space-y-2 text-sm">
                      <div onClick={() => (window.location.href = '/Admin/Dashboard')}
                        className="p-2 rounded hover:bg-gray-200 cursor-pointer">🏠 Dashboard</div>
                      <div onClick={() => (window.location.href = '/Admin/UserManagement')}
                        className="p-2 rounded bg-gray-200 font-medium cursor-pointer">👥 User Manajemen</div>
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
                      >📈 Riwayat Kehadiran
                      </div>
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

          {/* Konten utama - Tabel User Management */}
          <main className="flex-1 bg-white p-6 rounded-xl shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-semibold">Total User: {users.total}</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
  <input
    type="text"
    placeholder="Cari nama..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded px-3 py-2 text-sm"
  />
  <select
    value={filterRole}
    onChange={(e) => setFilterRole(e.target.value)}
    className="border rounded px-3 py-2 text-sm"
  >
    <option value="all">Semua Role</option>
    <option value="murid">Murid</option>
    <option value="admin">Admin</option>
  </select>

  {/* Modal tambah user */}
  <CreateUserModal />
</div>    
              </div>
              
            </div>

            {/* Table */}
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 px-3">Nama</th>
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Tanggal dibuat</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-500 py-6">
                        Tidak ada user
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-3">{u.name}</td>
                      <td className="py-3 px-3 capitalize">{u.role}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            u.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              ⋮
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link
                                href={route("admin.user.detail", u.id)}
                                className="text-indigo-600 hover:underline"
                              >
                                Detaill
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                confirm("Yakin hapus user ini?") &&
                                alert(`Hapus user ${u.id}`)
                              }
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
            <div className="flex justify-between items-center mt-4 text-sm">
              <div>
                Halaman {users.current_page} dari {users.last_page}
              </div>
              <div className="space-x-2">
                {users.current_page > 1 && (
                  <Link
                    href={`?page=${users.current_page - 1}`}
                    className="px-3 py-1 border rounded"
                  >
                    Prev
                  </Link>
                )}
                {users.current_page < users.last_page && (
                  <Link
                    href={`?page=${users.current_page + 1}`}
                    className="px-3 py-1 border rounded"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}