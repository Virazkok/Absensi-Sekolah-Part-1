import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, FormEvent } from 'react';

interface AuthUser { id: number; name: string; email: string; }
interface Kehadiran {
  foto_url: string | undefined; id: number; user: { name: string }; foto_path: string; created_at: string; 
}
interface Absensi {
  id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  dipublish: boolean;
  eskul: { nama: string };
  kehadiran: Kehadiran[];
}

interface PageProps {
  auth: { user: AuthUser };
  absensi: Absensi;
}

export default function DetailAbsensi() {
  const { auth, absensi } = usePage().props as unknown as PageProps;
  const [editing, setEditing] = useState(false);

  // edit form
  const { data, setData, put, processing, errors } = useForm({
    tanggal: absensi.tanggal,
    jam_mulai: absensi.jam_mulai,
    jam_selesai: absensi.jam_selesai,
  });

  const saveEdit = (e: FormEvent) => {
    e.preventDefault();
    put(route('admin.eskul.absensi.update', absensi.id), {
      onSuccess: () => setEditing(false),
    });
  };

  const deleteAbsensi = () => {
    if (confirm('Yakin ingin menghapus absensi dan semua kehadiran-nya?')) {
      (window as any).router.delete(route('admin.eskul.absensi.destroy', absensi.id));
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-900 leading-tight">Detail Absensi</h2>}
    >
      <Head title="Detail Absensi" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* card info */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6 text-gray-900">
            <div className="flex justify-between items-center">
              <div>
                <h3>{absensi.eskul?.nama ?? 'Tanpa Nama Eskul'}</h3>
                <p>
                  {absensi.tanggal
        ? new Date(absensi.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Invalid Date'}
</p>
<span className={`... ${absensi.dipublish ? 'bg-green-100' : 'bg-yellow-100'}`}>
  {absensi.dipublish ? 'Published' : 'Draft'}
</span>
              </div>

              {/* action buttons */}
              <div className="space-x-2">
                <Button onClick={() => setEditing(true)}>Edit</Button>
              </div>
            </div>
          </div>

          {/* list kehadiran */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-gray-900">
            <h4 className="text-lg font-semibold mb-4">Daftar Kehadiran ({(absensi.kehadiran ?? []).length})</h4>
            {absensi.kehadiran.length ? (
              <div className="space-y-4">
                {absensi.kehadiran.map((k) => (
                  <div key={k.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium text-gray-900">{k.user.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(k.created_at).toLocaleString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <a
                      href={`http://localhost:8000/storage/${k.foto_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-sm underline"
                    >
                    Lihat Foto
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Belum ada yang mengisi kehadiran.</p>
            )}
          </div>

          {/* modal edit */}
          {editing && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30 text-gray-900">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h4 className="text-lg font-semibold mb-4">Edit Jadwal</h4>
                <form onSubmit={saveEdit} className="space-y-4">
                  <div>
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={data.tanggal}
                      onChange={(e) => setData('tanggal', e.target.value)}
                    />
                    {errors.tanggal && <p className="text-red-500 text-sm">{errors.tanggal}</p>}
                  </div>
                  <div>
                    <Label>Jam Mulai</Label>
                    <Input
                      type="time"
                      value={data.jam_mulai}
                      onChange={(e) => setData('jam_mulai', e.target.value)}
                    />
                    {errors.jam_mulai && <p className="text-red-500 text-sm">{errors.jam_mulai}</p>}
                  </div>
                  <div>
                    <Label>Jam Selesai</Label>
                    <Input
                      type="time"
                      value={data.jam_selesai}
                      onChange={(e) => setData('jam_selesai', e.target.value)}
                    />
                    {errors.jam_selesai && <p className="text-red-500 text-sm">{errors.jam_selesai}</p>}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                      Batal
                    </Button>
                    <Button disabled={processing}>Simpan</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}