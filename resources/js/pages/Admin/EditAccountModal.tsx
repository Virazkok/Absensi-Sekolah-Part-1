import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import Select from "react-select";
import { LoaderCircle, AlertTriangle } from "lucide-react";
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
    eskul_ids: [
      user.eskul_siswa1_id,
      user.eskul_siswa2_id,
      user.eskul_siswa3_id,
    ].filter(Boolean),
    role: user.role || "murid",
  });

  const [warningOpen, setWarningOpen] = useState(false)
  const handleEskulChange = (selectedOptions: any) => {
    if (selectedOptions && selectedOptions.length > 3) {
      setWarningOpen(true);
      return;
    }
    setData(
      "eskul_ids",
      selectedOptions ? selectedOptions.map((o: any) => o.value) : []
    );
  };

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
    <>
      {/* === MAIN MODAL === */}
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border-2 border-[#8B23ED] shadow-xl w-full max-w-[500px] p-8 overflow-auto max-h-[90vh]">
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
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email}</span>
              )}
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
              {errors.password && (
                <span className="text-red-500 text-sm">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password
            <div className="grid gap-2">
              <Label>Konfirmasi Password</Label>
              <Input
                type="password"
                value={data.password_confirmation}
                onChange={(e) =>
                  setData("password_confirmation", e.target.value)
                }
                placeholder="Ulangi password"
              />
            </div> */}

            {/* Ekstrakurikuler Multi Select */}
            <div className="grid gap-2 col-span-2">
              <Label>Ekstrakurikuler (maksimal 3)</Label>
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
              {errors.eskul_ids && (
                <span className="text-red-500 text-sm">{errors.eskul_ids}</span>
              )}
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
                className="bg-[#8B23ED] hover:bg-purple-700 text-white w-65 border border-[#8B23ED] shadow-[4.0px_4.0px_8.0px_rgba(0,0,0,0.38)] "
              >
                {processing && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                Simpan
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* === CUSTOM WARNING MODAL === */}
      {warningOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[60]">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg text-center">
            <AlertTriangle className="text-yellow-500 w-10 h-10 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">
              Batas Maksimal Ekstrakurikuler
            </h2>
            <p className="text-gray-600 mb-6">
              Kamu hanya bisa memilih maksimal <b>3 ekstrakurikuler</b>.
            </p>
            <Button
              onClick={() => setWarningOpen(false)}
              className="bg-[#E4D2FC] hover:bg-[#d6b9f7] text-black px-8"
            >
              Mengerti
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
