import React from "react";
import { useForm } from "@inertiajs/react";
import Select from "react-select";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditAccountModal({ user, eskuls, onClose }: any) {
  const { data, setData, post, processing, errors } = useForm({
    _method: "PUT",
    email: user.email || "",
    password: "",
    password_confirmation: "",
    eskul_ids: user.eskuls?.map((e: any) => e.id) || [],
    role: user.role || "murid",
  });

  const handleEskulChange = (selectedOptions: any) => {
    setData(
      "eskul_ids",
      selectedOptions ? selectedOptions.map((o: any) => o.value) : []
    );
  };

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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[1050px] p-8 overflow-auto max-h-[90vh]">
        <h3 className="text-xl font-semibold mb-4">Edit Account</h3>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="Kosongkan jika tidak diubah"
            />
          </div>

          {/* Confirm Password */}
          <div className="grid gap-2">
            <Label>Konfirmasi Password</Label>
            <Input
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
              placeholder="Ulangi password"
            />
          </div>

          {/* Ekstrakurikuler Multi Select */}
          <div className="grid gap-2 col-span-2">
            <Label>Ekstrakurikuler</Label>
            <Select
              isMulti
              options={eskuls.map((e: any) => ({
                value: e.id,
                label: e.nama,
              }))}
              value={eskuls
                .filter((e: any) => data.eskul_ids.includes(e.id))
                .map((e: any) => ({
                  value: e.id,
                  label: e.nama,
                }))}
              onChange={handleEskulChange}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Pilih ekstrakurikuler..."
            />
          </div>

          {/* Role */}
          <div className="grid gap-2">
            <Label>Role</Label>
            <UiSelect
              value={data.role}
              onValueChange={(v) => setData("role", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="murid">Murid</SelectItem>
                <SelectItem value="guru">Guru</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </UiSelect>
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
