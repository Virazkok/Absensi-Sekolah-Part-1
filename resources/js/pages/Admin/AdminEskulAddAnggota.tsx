// resources/js/Pages/Admin/AdminEskulAddAnggota.tsx
import React, { useMemo, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type UserPayload = {
  id: number;
  name: string;
  kelas?: { id: number; name: string } | null;
  eskuls_count: number;
  eskuls_ids: number[]; // eskul ids currently in DB
};

export default function AdminEskulAddAnggota({ onClose }: { onClose: () => void }) {
  const { allUsers = [], eskuls = [], kelasList = [] } = usePage().props as any;

  const users: UserPayload[] = (allUsers || []).map((u: any) => ({
    id: u.id,
    name: u.name,
    kelas: u.kelas ?? null,
    eskuls_count: u.eskuls_count ?? 0,
    eskuls_ids: u.eskuls_ids ?? [],
  }));

  const [selectedEskulId, setSelectedEskulId] = useState<number | null>(null);
  const [selectedKelasId, setSelectedKelasId] = useState<'all' | number>('all');
  const [search, setSearch] = useState('');
  // selectionsByEskul: eskulId -> array of userIds
  const [selectionsByEskul, setSelectionsByEskul] = useState<Record<number, number[]>>({});

  // helper: count how many times user is selected across all eskuls in modal
  function totalSelectedForUser(userId: number) {
    return Object.values(selectionsByEskul).flat().filter((id) => id === userId).length;
  }

  // filter users by kelas and search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedKelasId !== 'all' && u.kelas?.id !== selectedKelasId) return false;
      if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [users, selectedKelasId, search]);

  // check if a user is already in given eskul (from DB)
  function userAlreadyInEskul(user: UserPayload, eskulId: number) {
    return (user.eskuls_ids || []).includes(eskulId);
  }

  // determine disabled state for checkbox for (userId, eskulId)
  function isCheckboxDisabled(user: UserPayload, eskulId: number) {
    // if user already in that eskul => disabled
    if (userAlreadyInEskul(user, eskulId)) return true;

    const alreadySelectedInThisEskul = (selectionsByEskul[eskulId] || []).includes(user.id);
    const selectedCount = totalSelectedForUser(user.id);

    // If not already selected in this eskul, and existing + selectedCount >= 3 then disabled
    // This allows the checkbox in the eskul where user has been selected to remain togglable.
    if (!alreadySelectedInThisEskul && (user.eskuls_count + selectedCount) >= 3) {
      return true;
    }

    return false;
  }

  function toggleSelect(user: UserPayload, eskulId: number) {
    // prefer using eskulId param so we can call from summary too
    if (!eskulId) {
      alert('Pilih eskul terlebih dahulu');
      return;
    }

    // If user already in eskul (DB) we don't allow select
    if (userAlreadyInEskul(user, eskulId)) return;

    const disabled = isCheckboxDisabled(user, eskulId);
    if (disabled) {
      // user can't be selected here (except if already selected in this eskul)
      const alreadySelectedInThisEskul = (selectionsByEskul[eskulId] || []).includes(user.id);
      if (!alreadySelectedInThisEskul) {
        // show small warning
        alert(`${user.name} sudah mencapai batas eskul (3).`);
        return;
      }
    }

    setSelectionsByEskul((prev) => {
      const clone: Record<number, number[]> = { ...prev };
      const set = new Set(clone[eskulId] || []);
      if (set.has(user.id)) set.delete(user.id);
      else set.add(user.id);
      clone[eskulId] = Array.from(set);
      // remove empty arrays to keep object small
      if (clone[eskulId].length === 0) delete clone[eskulId];
      return clone;
    });
  }

  // display dynamic eskul_count: existing + totalSelectedForUser(userId)
  function displayEskulCount(user: UserPayload) {
    return `${user.eskuls_count + totalSelectedForUser(user.id)}/3`;
  }

  function handleSave() {
    const payload = {
      selections: Object.entries(selectionsByEskul).map(([eskulId, userIds]) => ({
        eskul_id: Number(eskulId),
        user_ids: userIds,
      })),
    };

    if (payload.selections.length === 0) {
      alert('Belum ada pilihan anggota untuk disimpan.');
      return;
    }

    Inertia.post(route('admin.eskul.addMembers'), payload, {
      onSuccess: () => {
        // reload page agar data di frontend sinkron dengan DB (menampilkan eskuls_count terbaru)
        Inertia.visit(route('admin.eskul.index'));
      },
      onError: (errors) => {
        // back-end akan mengembalikan 422 dengan list user errors jika melebihi batas
        if (errors && typeof errors === 'object') {
          // show message sederhana
          alert('Beberapa siswa gagal ditambahkan. Periksa batas eskul (maks 3).');
        } else {
          alert('Gagal menyimpan anggota.');
        }
      },
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[920px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Tambah Anggota Eskul</h2>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Pilih Eskul</label>
            <select
              value={selectedEskulId ?? ''}
              onChange={(e) => setSelectedEskulId(e.target.value ? Number(e.target.value) : null)}
              className="w-full border p-2 rounded"
            >
              <option value="">-- pilih eskul --</option>
              {eskuls.map((es: any) => (
                <option key={es.id} value={es.id}>
                  {es.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="block text-sm mb-1">Pilih Kelas</label>
            <select
              value={selectedKelasId as any}
              onChange={(e) =>
                setSelectedKelasId(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full border p-2 rounded"
            >
              <option value="all">Semua Kelas</option>
              {kelasList.map((k: any) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm mb-1">Cari Nama</label>
            <input
              className="w-full border p-2 rounded"
              placeholder="Cari siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 w-12">No</th>
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Kelas</th>
                <th className="p-2 text-center">Eskul</th>
                <th className="p-2 text-center">Pilih</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.kelas?.name ?? '-'}</td>
                  <td className="p-2 text-center">{displayEskulCount(u)}</td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      disabled={!selectedEskulId || isCheckboxDisabled(u, selectedEskulId!)}
                      checked={
                        selectedEskulId
                          ? (selectionsByEskul[selectedEskulId] || []).includes(u.id)
                          : false
                      }
                      onChange={() => toggleSelect(u, selectedEskulId!)}
                      style={{
                        cursor:
                          !selectedEskulId || isCheckboxDisabled(u, selectedEskulId!)
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                      title={
                        userAlreadyInEskul(u, selectedEskulId ?? -1)
                          ? 'Sudah terdaftar di eskul ini'
                          : undefined
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ringkasan pilihan: tampilkan nama (kelas) */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Ringkasan Pilihan</h4>
          {Object.keys(selectionsByEskul).length === 0 ? (
            <div className="text-sm text-gray-500">Belum ada pilihan</div>
          ) : (
            Object.entries(selectionsByEskul).map(([eskulIdStr, userIds]) => {
              const eskulId = Number(eskulIdStr);
              const eskul = eskuls.find((e: any) => e.id === eskulId);
              return (
                <div key={eskulId} className="border rounded p-2 mb-2">
                  <div className="font-medium">{eskul?.nama ?? `Eskul ${eskulId}`}</div>
                  <div className="text-sm mt-1">
                    {userIds.length === 0 ? (
  <p className="text-gray-500 text-sm">Belum ada anggota dipilih</p>
) : (
  <div className="flex flex-wrap gap-2 mt-2">
    {userIds.map((uid) => {
      const uu = users.find((x) => x.id === uid);
      if (!uu) return null;
      return (
        <div
          key={uid}
          className="px-3 py-1 bg-gray-200 border border-gray-400 rounded-xl text-sm text-gray-800"
        >
          {uu.name} {uu.kelas ? `(${uu.kelas.name})` : ""}
        </div>
      );
    })}
  </div>
)}

                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </div>
    </div>
  );
}
