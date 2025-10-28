  // DetailUser.tsx (updated to match your corrections)
  import React, { useEffect, useState } from "react";
  import { Link, usePage } from "@inertiajs/react";
  import { Button } from "@/components/ui/button";
  import { Pencil } from "lucide-react";
  import EditBiodataModal from "@/pages/Admin/EditBiodataModal";
  import EditAccountModal from "@/pages/Admin/EditAccountModal";

  export default function DetailUser() {
    const { props } = usePage<{ user: any }>();
    const { user } = props;

    const [openEditBiodata, setOpenEditBiodata] = useState(false);
    const [openEditAccount, setOpenEditAccount] = useState(false);
    const [kelasList, setKelasList] = useState<any[]>([]);
    const [eskulList, setEskulList] = useState<any[]>([]);

    useEffect(() => {
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
      <div className="min-h-screen bg-gray-50 text-gray-900 flex">
        {/* Sidebar */}
        <aside className="hidden md:block md:w-60 bg-white p-4 shadow-lg min-h-screen  border-r">
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

        {/* Main */}
        <main className="flex-1 p-10">
          <h1 className="text-2xl font-semibold mb-6">Details User</h1>

          {/* Card with purple border - everything (back link, avatar, columns) inside */}
          <div className="bg-white rounded-2xl shadow border border-[#8B23ED] p-8 relative">
            {/* Back link inside the card */}
            <div className="mb-6">
              <Link href="/Admin/UserManagement" className="text-gray-700 hover:underline">← Kembali</Link>
            </div>

            {/* Avatar centered at top inside card */}
            <div className="flex justify-center -mt-6">
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt={user.name}
                className="w-28 h-28 rounded-full border-4 border-[#fff] object-cover"
                style={{ marginTop: -24 }}
              />
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-2 gap-8 mt-6">
              {/* Biodata Column */}
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  
                  <h2 className="font-semibold text-lg">Biodata</h2>
                  <button onClick={() => setOpenEditBiodata(true)} className="text-sm text-gray-600 flex items-center gap-1 hover:text-black">
                    <Pencil className="w-4 h-4" /> edit
                  </button>
                </div>

                <div className="border-b border-gray-900 mb-4" />

                <div className="space-y-3 text-sm">
                <div className="flex  items-center border-b border-gray-100">
    <span className="text-gray-700 font-medium">Nama</span>
    <div className="justify-center w-full flex">
    <span className="text-gray-900 justify-center">{user.name}</span>
    </div>
  </div>


                  <div className="flex justify-between">
                    <div className="text-gray-600">NIS</div>
                    <div className="justify-center w-full flex">
    <span className="text-gray-900 justify-center text-left">{user.nis}</span>
    </div>
                  </div>

                  <div className="flex justify-between">
                    <div className="text-gray-600">Kelas</div>
                  <div className="justify-center w-full flex">
    <span className="text-gray-900 justify-center text-left">{user.kelas?.name || '-'}</span>
    </div>
                  </div>

                  <div>
                  {/* Ekstrakurikuler */}
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-gray-600 mb-2">Ekstrakurikuler</span>
    <div className="justify-center w-full flex gap-2">
      {user.eskuls && user.eskuls.length > 0 ? (
        user.eskuls.map((eskul: any) => (
          <span
            key={eskul.id}
            className="bg-[#E4D2FC] text-black px-4 py-1 rounded-sm text-sm font-medium"
          >
            {eskul.nama}
          </span>
        ))
      ) : (
        <span className="text-gray-500 italic">-</span>
      )}
    </div>
  </div>

                  </div>
                </div>
              </div>

              {/* Account Column */}
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg">Account</h2>
                  <button onClick={() => setOpenEditAccount(true)} className="text-sm text-gray-600 flex items-center gap-1 hover:text-black">
                    <Pencil className="w-4 h-4" /> edit
                  </button>
                </div>

                <div className="border-b border-gray-900 mb-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <div className="text-gray-600">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>

                  <div className="flex justify-between">
                    <div className="text-gray-600">Password</div>
                    <div className="font-medium">********</div>
                  </div>

                  <div className="flex justify-between">
                    <div className="text-gray-600">Roles</div>
                    <div className="font-medium capitalize">{user.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
        {openEditBiodata && (
          <EditBiodataModal
            user={user}
            kelas={kelasList}
            onClose={() => setOpenEditBiodata(false)}
          />
        )}

        {openEditAccount && (
          <EditAccountModal
            user={user}
            eskuls={eskulList}
            onClose={() => setOpenEditAccount(false)}
          />
        )}
      </div>
    );
  }