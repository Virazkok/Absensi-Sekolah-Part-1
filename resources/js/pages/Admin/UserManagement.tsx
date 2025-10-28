import React, { useMemo, useState } from "react";
import { usePage, Link, Head } from "@inertiajs/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CreateUserModal from "@/pages/auth/register";

type Props = {
  users: {
    data: {
      id: number;
      name: string;
      username?: string;
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

  const filteredUsers = useMemo(() => {
    return users.data.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "all" || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users.data, search, filterRole]);

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-gray-900">
      <Head title="User Management" />
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block md:w-60 bg-white p-4 shadow-lg min-h-screen">
          <nav className="space-y-2 text-sm">
            <div onClick={() => (window.location.href = '/Admin/Dashboard')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--dashboard-line.svg" alt="" />Dashboard</div>
            <div onClick={() => (window.location.href = '/Admin/UserManagement')}
              className="p-2 rounded bg-[#E86D1F] font-medium cursor-pointer text-white flex items-center gap-2"><img src="/icons/ri--user-settings-lineW.svg" alt="" /> User Manajemen</div>
            <div onClick={() => (window.location.href = '/admin/events')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--list-settings-line.svg" alt="" /> Event Manajemen</div>
            <div onClick={() => (window.location.href = '/admin/eskul')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--user-community-line.svg" alt="" /> Ekstrakurikuler</div>
            <div onClick={() => (window.location.href = '/admin/riwayat-kehadiran')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--history-line.svg" alt="" /> Riwayat Kehadiran</div>
            <div onClick={() => (window.location.href = '/admin/statistik-kehadiran')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--pie-chart-2-line.svg" alt="" /> Statistik Kehadiran</div>
            <div onClick={() => (window.location.href = '/admin/laporan-kehadiran')}
              className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-2"><img src="/icons/ri--file-text-line.svg" alt="" /> Laporan</div>
          </nav>
        </aside>

        {/* Konten utama */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">User Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Semua User <span className="font-semibold">{users.total}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="cari nama"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#8B23ED]"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B23ED]"
              >
                <option value="all">Filter Roles</option>
                <option value="murid">Murid</option>
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
              </select>

              
              <CreateUserModal />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-[#8B23ED] bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[#D9B7F9]">
                <tr className="text-left text-gray-700 font-medium">
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Roles</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4">Latest Active</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-6">
                      Tidak ada user
                    </td>
                  </tr>
                )}
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b hover:bg-[#FAF7FF] transition"
                  >
                    <td className="py-3 px-4">{u.name}</td>
                    
                    <td className="py-3 px-4 capitalize">{u.role}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(u.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-gray-500">–</td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className=" bg-white border-none decoration-none hover:bg-gray-100 items-center "
                          >
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link
                              href={route("admin.user.detail", u.id)}
                              className="text-[#7B5EF3]"
                            >
                              Detail
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
          <div className="flex justify-between items-center mt-5 text-sm text-gray-600">
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
  );
}
