// DetailUser.tsx (updated)
import React, { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import EditUserModal from "@/pages/Admin/UserEdit"; // sesuaikan path jika beda

export default function DetailUser() {
  const { props } = usePage<{ user: any }>();
  const { user } = props;

  // modal state + data lists
  const [openEdit, setOpenEdit] = useState(false);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [eskulList, setEskulList] = useState<any[]>([]);

  useEffect(() => {
    // ambil data kelas & eskul (dipanggil sekali)
    // jika backend sudah mengirim kelas/eskuls dengan props, bisa gunakan itu dan tidak perlu fetch
    fetch("/api/kelas")
      .then((r) => r.json())
      .then((data) => setKelasList(data))
      .catch(() => setKelasList([]));

    fetch("/api/eskuls")
      .then((r) => r.json())
      .then((data) => setEskulList(data))
      .catch(() => setEskulList([]));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">
      {/* Sidebar (kiri) */}
      <aside className="w-56 bg-white rounded-xl shadow p-4">
        <div className="mb-6">
          <div className="text-lg font-bold">Dashboard</div>
        </div>
        <nav className="space-y-2 text-sm text-gray-700">
          <div
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-200"
            onClick={() => (window.location.href = "/Admin/Dashboard")}
          >
            🏠 <button>Dashboard</button>
          </div>
          <div
            className="flex items-center gap-3 p-2 rounded bg-gray-200 font-medium"
            onClick={() => (window.location.href = "/Admin/UserManagement")}
          >
            👥 <button>User Management</button>
          </div>
          <div
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-200"
            onClick={() => (window.location.href = "/admin/events")}
          >
            📅 <button>Event Management</button>
          </div>
          <div
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-200"
            onClick={() => (window.location.href = "/admin/eskul")}
          >
            ⚽ <button>Ekstrakurikuler</button>
          </div>
          <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-200">
            📈 <button>Statistik Kehadiran</button>
          </div>
          <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-200">
            📄 <button>Laporan</button>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Details User</h1>

        <div className="bg-white rounded-xl shadow flex justify-between items-start border border-gray-400 w-min">
          <div className="flex flex-1 gap-6">
            {/* Info Table */}
            <div className="flex-1 ">
              <table className="w-min text-[16px]">
                <tbody>
                  <tr>
                    <td className="font-medium w-32 bg-gray-200 px-3 py-2 rounded-t-lg text-[24px]">Nis</td>
                    <td className="px-3 py-2">{user.nis}</td>
                  </tr>
                  <tr>
                    <td className="font-medium bg-gray-200 px-3 py-2">Nama</td>
                    <td className="px-3 py-2">{user.name}</td>
                  </tr>
                  <tr>
                    <td className="font-medium bg-gray-200 px-3 py-2">Kelas</td>
                    <td className="px-3 py-2">{user.kelas?.name}</td>
                  </tr>
                  <tr>
                    <td className="font-medium bg-gray-200 px-3 py-2">Email</td>
                    <td className="px-3 py-2">{user.email}</td>
                  </tr>
                  <tr>
                    <td className="font-medium bg-gray-200 px-3 py-2">Username</td>
                    <td className="px-3 py-2">{user.username}</td>
                  </tr>
                  <tr>
                    <td className="font-medium bg-gray-200 px-3 py-2">Password</td>
                    <td className="px-3 py-2">********</td>
                  </tr>
                  <tr>
                    <td className="font-medium bg-gray-200 px-3 py-2">Roles</td>
                    <td className="px-3 py-2 capitalize">{user.role}</td>
                  </tr>
                  <tr>
                    <td className="font-medium bg-gray-200 px-3 py-2 rounded-br-lg">Ekstrakurikuler</td>
                    <td className="px-3 py-2 space-x-2">
                      {user.eskuls?.map((e: any) => (
                        <span
                          key={e.id}
                          className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {e.nama}
                        </span>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Avatar dan Tombol - sebelah kanan tabel */}
            <div className="flex flex-col mr-10 ml-50">
              {/* Avatar */}
              <div className="mb-18 mt-2">
                <img
                  src={user?.avatar || "/default-avatar.png"}
                  alt={user.name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                />
              </div>

              {/* Tombol-tombol: Back + Open Modal Edit */}
              <div className="flex gap-3">
                <Link href="/Admin/UserManagement">
                  <Button className="border-gray-200 w-full">Kembali</Button>
                </Link>

                {/* GANTI: Link -> Button yang membuka modal */}
                <Button
                  onClick={() => setOpenEdit(true)}
                  className="border-gray-200 bg-gray-200 w-full"
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit modal: render ketika state openEdit = true */}
      {openEdit && (
        <EditUserModal
          user={user}
          kelas={kelasList}
          eskuls={eskulList}
          onClose={() => setOpenEdit(false)}
        />
      )}
    </div>
  );
}
