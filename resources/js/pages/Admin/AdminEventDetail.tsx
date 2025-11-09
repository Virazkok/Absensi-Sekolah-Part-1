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
import React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Textarea } from "@headlessui/react";
import Sidebar from "@/components/sidebar";
import { PageProps as InertiaPageProps } from '@inertiajs/core';


interface EventDetail {
  id: number;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  location?: string | null;
  image?: string | null;
  image_url?: string | null;
  is_published: false,
}

interface Registration {
  id: number;
  user: { name: string; kelas?: { name: string } };
  sport_category?: string;
  created_at?: string | null;
}

interface Attendance {
  id: number;
  user: {
    nama: string; name: string; kelas?: { name: string } 
};
  status: string;
}

interface PageProps extends InertiaPageProps {
  auth: { user: any };
  event: EventDetail;
  registrations: Registration[];
  attendances: Attendance[];
}
type Props = any;

export default function AdminEventDetail() {
  const { props } = usePage<Props>();
  const { user } = props;
  const { auth, event, registrations, attendances } = usePage<PageProps>().props;
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"registrations" | "attendances">("registrations");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [query, setQuery] = useState("");
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [publishAction, setPublishAction] = useState<"publish" | "draft" | null>(null);


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
    if (data.image) formData.append("image", data.image);

    router.post(route("admin.events.update", event.id), formData, {
      forceFormData: true,
      onSuccess: () => setShowModal(false),
    });
  };

  const filteredRegs = registrations.filter((r) =>
  (r.user?.name ?? "").toLowerCase().includes(query.toLowerCase())
);

  const filteredAtts = attendances.filter((a) =>
  (a.user?.name ?? "").toLowerCase().includes(query.toLowerCase())
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

const togglePublish = (id: number) => {
  router.patch(route("admin.events.toggle-publish", id), {}, {
    preserveState: true,   
    preserveScroll: true,  
    onSuccess: () => {
      console.log("Status publish berhasil diubah");
    },
  });
};

  const eventImageSrc =
    event.image_url ||
    (event.image ? `/storage/${event.image}` : "");

  const dataToShow =
    activeTab === "registrations"
      ? filteredRegs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      : filteredAtts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(
    (activeTab === "registrations" ? filteredRegs.length : filteredAtts.length) / itemsPerPage
  );

  const pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  );

 

  return (
    <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl">Detail Event</h2>}>
      <Head title={`Detail Event - ${event.title}`} />

      <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
        <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        {/* ======= Event Card ======= */}
        <main className="flex-1 overflow-x-auto p-7 pt-3">
           {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center bg-white p-2 gap-10 rounded-xl shadow border">
              <div className="flex items-center gap-2 p-2">
                <img src={props.auth?.user?.avatar ?? '/images/avatar-placeholder.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                <div className="text-[16px]">{props.auth?.user?.name ?? 'Admin'}</div>
              </div>
              <div>
              <button className="p-2 rounded bg-white">⚙️</button>
              <button className="p-2 rounded bg-white">🔓</button>
              </div>
              
            </div>
          </div>

          
        <div className="bg-white border border-[#8B23ED] rounded-lg shadow-sm overflow-hidden">
          
          <div className="max-w-380 w-1000 h-100 aspect-[16/9] overflow bg-gray-100 m-3">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

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
              <Button 
              className="text-sm bg-white text-gray-900 border border-[#8B23ED] px-3 py-2 mr-2 rounded-lg w-30 hover:border-[#8B23ED] hover:bg-white hover:text-gray-900 hover:bg-gray-200" 
              variant={"outline"} 
              onClick={() => router.get(route("admin.events.manage"))}>
                Kembali
              </Button>
              <Button 
              onClick={() => setShowModal(true)} 
              className="text-sm bg-[#8B23ED] text-white px-3 py-2 mr-2 rounded-lg w-30 hover:bg-[#8B23ED] hover:text-white hover:bg-purple-700">
                Edit
              </Button>
            </div>
          </div>
        </div>
        

        {/* ======= Tabs ======= */}
        <div className="flex items-center justify-between mt-15 mb-5">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "registrations" ? "purple" : "pending"}
              onClick={() => setActiveTab("registrations")}
              className="border border-[#8B23ED]"
            >
              Pendaftaran
            </Button>
            <Button
              variant={activeTab === "attendances" ? "purple" : "pending"}
              onClick={() => setActiveTab("attendances")}
              className="border border-[#8B23ED]"
            >
              Kehadiran
            </Button>
          </div>

          <div className="w-72">
            <Input
              placeholder="Cari nama peserta"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-[#8B23ED]"
            />
          </div>
        </div>

        {/* ======= Table ======= */}
        <div className="bg-white border  border-[#8B23ED] rounded-lg shadow-sm p-4">
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
              {dataToShow.map((r, idx) => (
                <tr key={r.id} className="border-t">
                  <td className="py-3 px-3 text-gray-600">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
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
              {attendances.map((a, idx) => (
                <tr key={a.id} className="border-t">
                  <td className="py-3 px-3 text-gray-600">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">{a.display_name}</td>
                  <td className="py-3 px-3">{a.kelas_name}</td>
                  <td className="py-3 px-3">{a.status}</td>
                </tr>
              ))}
            </tbody>
            </table>
          )}
        </div>

        {/* Pagination Control */}
        <div className="flex justify-between mt-4">
          {/* Kiri: optional tombol download / info */}
          <div />

          {/* Kanan: Pagination (selalu tampil) */}
          <div className="flex items-center gap-1 border rounded-full px-3 py-1 bg-white shadow-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-40"
            >
              
            </button>

            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1)
              .filter((page) => {
                if (page === 1 || page === (totalPages || 1)) return true;
                if (page >= currentPage - 2 && page <= currentPage + 2) return true;
                return false;
              })
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showDots = prev && page - prev > 1;
                return (
                  <React.Fragment key={page}>
                    {showDots && <span className="px-2 text-gray-400">…</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-full transition-all ${
                        currentPage === page
                          ? "bg-orange-400 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage === (totalPages || 1)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-40"
            >
              
            </button>
          </div>
        </div>
        {/* ======= Modal Edit Event ======= */}

    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="max-w-2xl rounded-2xl p-8 bg-white shadow-xl text-gray-900">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">Edit Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Section */}
          <div>
            <Label className="text-gray-700 mb-2 block">Image Event</Label>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={previewUrl || (event.image ? `/storage/${event.image}` : "/default-avatar.png")}
                alt="Event Preview"
                className="w-full h-60 object-cover"
                onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
              />
            </div>
            <div className="mt-3 flex justify-between">
              <Input
                type="file"
                id="imageUpload"
                accept="image/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setData("image", e.target.files ? e.target.files[0] : null)}
              />
             <button
                type="button"
                onClick={() => {
                  setPublishAction(event.is_published ? "draft" : "publish");
                  setConfirmPublish(true);
                }}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  event.is_published
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {event.is_published ? "Published" : "Draft"}
              </button>

              <Button
                type="button"
                onClick={() => document.getElementById("imageUpload")?.click()}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              >
                Upload Image
              </Button>
            </div>
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nama Event</Label>
              <Input value={data.title} onChange={(e) => setData("title", e.target.value)} required />
            </div>
            <div>
              <Label>Kategori</Label>
              <select
                value={data.type}
                onChange={(e) => setData("type", e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                 <option value="olahraga">Olahraga</option>
                  <option value="non-olahraga">Non-olahraga</option>
                  <option value="pemberitahuan">Pemberitahuan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Deskripsi Event</Label>
              <Textarea
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                rows={4}
                placeholder="cth. Jelaskan tentang event anda di sini"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label>Tanggal Mulai</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData("start_date", e.target.value)}
                    className="pr-10"
                  />
                  <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <Label>Tanggal Akhir</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData("end_date", e.target.value)}
                    className="pr-10"
                  />
                  <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label>Lokasi Event</Label>
            <Input
              value={data.location}
              onChange={(e) => setData("location", e.target.value)}
              placeholder="Contoh: Lapangan Utama Sekolah"
            />
          </div>

          {/* Buttons */}
          <DialogFooter className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
              onClick={() => setShowModal(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
            >
              {processing ? "Memproses..." : "Perbarui"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

        
        </main>
      </div>
      </div>
      <Dialog open={confirmPublish} onOpenChange={setConfirmPublish}>
  <DialogContent className="max-w-sm rounded-lg">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold">
        {publishAction === "publish" ? "Publish Event?" : "Ubah ke Draft?"}
      </DialogTitle>
    </DialogHeader>
    <p className="text-gray-600 text-sm">
      Apakah kamu yakin ingin {publishAction === "publish" ? "mempublikasikan" : "mengubah ke draft"} event ini?
    </p>
    <DialogFooter className="flex justify-end gap-3 mt-4">
      <Button
        variant="outline"
        onClick={() => setConfirmPublish(false)}
        className="border-gray-300 text-gray-600"
      >
        Batal
      </Button>
      <Button
        onClick={() => {
          togglePublish(event.id);
          setConfirmPublish(false);
        }}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        Ya, Lanjutkan
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </AuthenticatedLayout>
  );
}
