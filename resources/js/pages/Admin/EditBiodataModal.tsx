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
    nis: String(user.nis || ""),
    kelas_id: user.kelas_id || "",
    keahlian: user.keahlian || "",
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/Admin/UserManagement/UserDetail/${user.id}`, {
      onSuccess: () => {
        onClose();
        window.location.reload();
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border-2 border-[#8B23ED] shadow-xl w-full max-w-[500px] p-8 overflow-auto max-h-[90vh]">
        <h3 className="text-xl font-semibold mb-4">Edit Biodata</h3>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Nama */}
          <div className="grid gap-2">
            <Label>Nama</Label>
            <Input
              value={data.name}
              disabled
              className="bg-gray-300"
            />
          </div>

          {/* NIS */}
          <div className="grid gap-2">
            <Label>NIS</Label>
            <Input
              value={data.nis}
              disabled
              className="bg-gray-300"
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
              value={data.keahlian}
              onChange={(e) => setData("keahlian", e.target.value)}
            />
          </div>

          {/* Tombol */}
          <div className="col-span-2 flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose?.()}
              disabled={processing}
              className="bg-white border border-[#8B23ED] w-65 hover:bg-gray-200 hover:text-black shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]"
            >
              Kembali
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-[#8B23ED] hover:bg-purple-700 text-white w-65 border border-[#8B23ED] shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)]"
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
