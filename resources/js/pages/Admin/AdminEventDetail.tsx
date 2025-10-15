import { Head, useForm, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";

interface EventDetail {
  id: number;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  image?: string | null;
  location?: string | null;
}

interface Registration {
  id: number;
  user: { name: string; kelas?: { name: string } };
  sport_category?: string;
  created_at?: string | null;
}

interface Attendance {
  id: number;
  user: { name: string; kelas?: { name: string } };
  status: string;
}

interface PageProps {
  auth: { user: any };
  event: EventDetail;
  registrations: Registration[];
  attendances: Attendance[];
}

export default function AdminEventDetail() {
  const { auth, event, registrations, attendances } = usePage<PageProps>().props;
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"registrations" | "attendances">("registrations");
  const [query, setQuery] = useState("");

  const { data, setData, processing } = useForm({
    title: event.title || "",
    description: event.description || "",
    location: event.location || "",
    type: event.type || "non-olahraga",
    start_date: event.start_date || "",
    end_date: event.end_date || "",
    image: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (data.image) {
      const url = URL.createObjectURL(data.image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [data.image]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("_method", "PATCH");
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location || "");
    formData.append("type", data.type);
    formData.append("start_date", data.start_date);
    formData.append("end_date", data.end_date);

    if (data.image) {
      formData.append("image", data.image);
    }

    router.post(route("admin.events.update", event.id), formData, {
      forceFormData: true,
      onSuccess: () => setShowModal(false),
    });
  };

  const filteredRegs = registrations.filter((r) =>
    r.user.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAtts = attendances.filter((a) =>
    a.user.name.toLowerCase().includes(query.toLowerCase())
  );

  const formatDate = (d?: string | null) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      return dt.toLocaleString("id-ID", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  return (
    <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl">Detail Event</h2>}>
      <Head title={`Detail Event - ${event.title}`} />

      <div className="py-8 max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6 text-gray-900">
        {/* Card with image and two-column detail */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          {event.image ? (
            <div className="w-full aspect-[16/9] overflow-hidden">
              <img
                src={`/storage/${event.image}`}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">Nama Event</div>
                <div className="text-sm text-gray-600">Deskripsi</div>
                <div className="text-sm text-gray-600">Kategori</div>
                <div className="text-sm text-gray-600">Waktu Acara</div>
                <div className="text-sm text-gray-600">Lokasi</div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-900">{event.title}</div>
                <div className="text-sm text-gray-700 max-w-prose">{event.description}</div>
                <div className="text-sm text-gray-900">{event.type}</div>
                <div className="text-sm text-gray-900">
                  {formatDate(event.start_date)} — {formatDate(event.end_date)}
                </div>
                <div className="text-sm text-gray-900">{event.location || "-"}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant={"outline"} onClick={() => router.get(route("admin.events.manage"))}>
                Kembali
              </Button>
              <Button onClick={() => setShowModal(true)}>Edit</Button>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant={activeTab === "registrations" ? "default" : "ghost"} onClick={() => setActiveTab("registrations")}>
              Pendaftaran
            </Button>
            <Button variant={activeTab === "attendances" ? "default" : "ghost"} onClick={() => setActiveTab("attendances")}>
              Kehadiran
            </Button>
          </div>

          <div className="w-72">
            <Input placeholder="cari nama peserta" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          {activeTab === "registrations" ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-3">No</th>
                  <th className="py-2 px-3">Nama Peserta</th>
                  <th className="py-2 px-3">Kelas</th>
                  <th className="py-2 px-3">Kategori</th>
                  <th className="py-2 px-3">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.map((r, idx) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-3 px-3 text-gray-600">{idx + 1}</td>
                    <td className="py-3 px-3">{r.user.name}</td>
                    <td className="py-3 px-3">{r.user.kelas?.name || "-"}</td>
                    <td className="py-3 px-3">{r.sport_category || "-"}</td>
                    <td className="py-3 px-3">{r.created_at ? formatDate(r.created_at) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-3">No</th>
                  <th className="py-2 px-3">Nama Peserta</th>
                  <th className="py-2 px-3">Kelas</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAtts.map((a, idx) => (
                  <tr key={a.id} className="border-t">
                    <td className="py-3 px-3 text-gray-600">{idx + 1}</td>
                    <td className="py-3 px-3">{a.user.name}</td>
                    <td className="py-3 px-3">{a.user.kelas?.name || "-"}</td>
                    <td className="py-3 px-3">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination placeholder */}
          <div className="mt-4 flex justify-end">
            <div className="inline-flex items-center gap-2 bg-gray-50 border rounded-full px-3 py-1 text-sm">
              <span className="text-gray-500">1</span>
              <span className="text-gray-400">2</span>
              <span className="text-gray-400">3</span>
              <span className="text-gray-400">…</span>
            </div>
          </div>
        </div>

        {/* Modal Edit Event */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Gambar Event</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setData("image", e.target.files ? e.target.files[0] : null)
                  }
                />
                <div className="mt-2">
                  {previewUrl ? (
                    <img src={previewUrl} className="w-48 h-28 object-cover rounded" alt="preview" />
                  ) : event.image ? (
                    <img src={`/storage/${event.image}`} className="w-48 h-28 object-cover rounded" alt="event" />
                  ) : null}
                </div>
              </div>

              <div>
                <Label>Judul</Label>
                <Input value={data.title} onChange={(e) => setData("title", e.target.value)} required />
              </div>

              <div>
                <Label>Deskripsi</Label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  className="w-full rounded border-gray-300"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Lokasi</Label>
                <Input
                  value={data.location}
                  onChange={(e) => setData("location", e.target.value)}
                  placeholder="Contoh: Aula Sekolah"
                />
              </div>

              <div>
                <Label>Tipe Event</Label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="w-full rounded border-gray-300 p-2"
                  required
                >
                  <option value="olahraga">Olahraga</option>
                  <option value="non-olahraga">Non-olahraga</option>
                  <option value="pemberitahuan">Pemberitahuan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tanggal Mulai</Label>
                  <Input
                    type="datetime-local"
                    value={data.start_date}
                    onChange={(e) => setData("start_date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Tanggal Selesai</Label>
                  <Input
                    type="datetime-local"
                    value={data.end_date}
                    onChange={(e) => setData("end_date", e.target.value)}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
}
