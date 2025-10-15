import React, { useState, ChangeEvent, FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onClose: () => void;
}

export default function ManageEventsModal({ onClose }: Props) {
  const { data, setData, post, processing, reset } = useForm({
    title: "",
    description: "",
    type: "",
    location: "",
    start_date: "",
    end_date: "",
    image: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setData("image", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route("admin.events.store"), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[850px] max-h-[90vh] overflow-y-auto rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-semibold mb-6">Create Event</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Event */}
            <div>
              <Label>Nama Event</Label>
              <Input
                placeholder="cth. Pekan Olahraga"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                required
              />
            </div>

            {/* Kategori */}
            <div>
              <Label>Kategori</Label>
              <select
                value={data.type}
                onChange={(e) => setData("type", e.target.value)}
                className="border border-gray-300 rounded-md w-full px-3 py-2"
                required
              >
                <option value="">Pilih kategori...</option>
                <option value="olahraga">Olahraga</option>
                <option value="non-olahraga">Non-Olahraga</option>
                <option value="pemberitahuan">Pemberitahuan</option>
              </select>
            </div>

            {/* Deskripsi */}
            <div className="col-span-2">
              <Label>Deskripsi Event</Label>
              <textarea
                placeholder="cth. Lorem ipsum dolor sit amet..."
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 h-14"
                rows={3}
              />
            </div>

            {/* Lokasi */}
            <div className="col-span-2">
              <Label>Lokasi Event</Label>
              <textarea
                placeholder="cth. Aula utama, lapangan, atau lokasi lainnya"
                value={data.location}
                onChange={(e) => setData("location", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2"
                rows={2}
              />
            </div>

            {/* Tanggal */}
            <div>
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={data.start_date}
                onChange={(e) => setData("start_date", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Tanggal Akhir</Label>
              <Input
                type="date"
                value={data.end_date}
                onChange={(e) => setData("end_date", e.target.value)}
                required
              />
            </div>

            {/* Thumbnail */}
            <div className="col-span-2">
              <Label>Thumbnail Event</Label>
              <div className="border border-gray-300 rounded-md h-64 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="object-contain w-full h-full rounded-md"
                  />
                ) : (
                  <>
                    <span className="text-4xl mb-2"></span>
                    <span>select image</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 pt-4 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-10 bg-white border border-gray-300 hover:bg-white border border-gray-300 text-gray-900"
            >
              Kembali
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="px-10 bg-gray-200 hover:bg-gray-200"
            >
              {processing ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
