import React from "react";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditBiodataModal({ user, kelas, onClose }: any) {
  const { data, setData, post, processing, errors } = useForm({
    _method: "PUT",
    name: user.name || "",
    nis: user.nis || "",
    kelas_id: user.kelas_id || "",
    kejuruan: user.kejuruan || "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/Admin/UserDetail/${user.id}`, {
      onSuccess: () => {
        onClose();
        window.location.reload();
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] p-8 overflow-auto max-h-[90vh]">
        <h3 className="text-xl font-semibold mb-4">Edit Biodata</h3>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Nama */}
          <div className="grid gap-2">
            <Label>Nama</Label>
            <Input
              value={data.name}
              disabled
              className="bg-gray-100"
            />
          </div>

          {/* NIS */}
          <div className="grid gap-2">
            <Label>NIS</Label>
            <Input
              value={data.nis}
              disabled
              className="bg-gray-100"
            />
          </div>

          {/* Kelas */}
          <div className="grid gap-2">
            <Label>Kelas</Label>
            <Select
              value={String(data.kelas_id)}
              onValueChange={(v) => setData("kelas_id", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {kelas.map((k: any) => (
                  <SelectItem key={k.id} value={String(k.id)}>
                    {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kejuruan */}
          <div className="grid gap-2">
            <Label>Kejuruan</Label>
            <Input
              value={data.kejuruan}
              onChange={(e) => setData("kejuruan", e.target.value)}
            />
          </div>

          {/* Tombol */}
          <div className="col-span-2 flex justify-center gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose?.()}
              disabled={processing}
              className="bg-white border border-gray-300 w-40"
            >
              Kembali
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-[#E4D2FC] hover:bg-[#d6b9f7] text-black w-40"
            >
              {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
