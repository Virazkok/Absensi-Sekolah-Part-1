import React, { useMemo, useState } from "react";
import { usePage, Link, Head, router } from "@inertiajs/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CreateUserModal from "@/pages/auth/register";
import Sidebar from "@/Components/sidebar";

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
  auth: {
    user: {
      id: number;
      name: string;
      role: string;
      avatar?: string;
    };
  };
};

export default function UserManagement() {
  const { props } = usePage<Props>();
  const { users } = props;
  const [openEditAccount, setOpenEditAccount] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filteredUsers = useMemo(() => {
    return users.data.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "all" || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users.data, search, filterRole]);

  const handleLogout = () => {
  router.post('/logout', {}, {
    onFinish: () => router.visit('/login'),
  });
};

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-gray-900">
      <Head title="User Management" />
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Konten utama */}
        <main className="flex-1 p-4 mr-3">
           {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center bg-white p-2 gap-10 rounded-xl shadow border">
              <div className="flex items-center gap-2 p-2">
                <img src={props.auth?.user?.avatar ?? '/images/avatar-placeholder.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                <div className="text-[16px]">{props.auth?.user?.name ?? 'Admin'}</div>
              </div>
              <div>
              <button onClick={() => setOpenEditAccount(true)} className="p-2 rounded bg-white">⚙️</button>
              <button onClick={handleLogout} className="p-2 rounded bg-white">🔓</button>
              </div>
          </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600 mt-1">
              Semua User{" "}
              <span className="font-semibold text-gray-400">
                {users.total}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="cari nama"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-[#8B23ED] rounded-lg  px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#8B23ED] shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-[#8B23ED] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B23ED] shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]"
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
                  <th className="py-3 px-4 w-75">Nama</th>
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

          {/* Pagination (Custom Ellipsis Style) */}
          <div className="flex justify-end mt-6">
            <div className="flex items-center gap-2 border rounded-full px-3 py-1 bg-white shadow-sm">
              {Array.from({ length: users.last_page }, (_, i) => i + 1)
                .filter((page) => {
                  if (page === 1 || page === users.last_page) return true;
                  if (
                    page >= users.current_page - 2 &&
                    page <= users.current_page + 2
                  )
                    return true;
                  return false;
                })
                .map((page, index, visible) => {
                  const prevPage = visible[index - 1];
                  const showDots = prevPage && page - prevPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {showDots && (
                        <span className="px-2 text-gray-400">…</span>
                      )}
                      <Link
                        href={`?page=${page}`}
                        className={`px-3 py-1.5 rounded-full transition-all duration-150 ${
                          users.current_page === page
                            ? "bg-orange-400 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </Link>
                    </React.Fragment>
                  );
                })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
