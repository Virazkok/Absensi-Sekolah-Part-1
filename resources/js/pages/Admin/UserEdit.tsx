// components/EditUserModal.tsx
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

export default function EditUserModal({ user, kelas, eskuls, onClose }: any) {
  const { data, setData, post, processing, errors } = useForm({
    _method: "PUT",
    nis: user.nis || "",
    name: user.name || "",
    username: user.username || "",
    status: String(user?.status ?? "active"),
    email: user.email || "",
    password: "",
    kelas_id: user.kelas_id || "",
    keahlian: user.keahlian || "",
    role: user.role || "murid",
    eskul_siswa1_id: user.eskul_siswa1_id || "",
    eskul_siswa2_id: user.eskul_siswa2_id || "",
    eskul_siswa3_id: user.eskul_siswa3_id || "",
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[1050px] p-8 overflow-auto max-h-[90vh]">
        <h3 className="text-xl font-semibold mb-4">Edit Account</h3>

        <form onSubmit={submit} className="grid grid-cols-2 gap-6">
          {/* Nama */}
          <div className="grid gap-2">
            <Label>Nama</Label>
            <Input
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* NIS */}
          <div className="grid gap-2">
            <Label>NIS</Label>
            <Input
              value={data.nis}
              onChange={(e) => setData("nis", e.target.value)}
            />
            {errors.nis && <p className="text-sm text-red-600">{errors.nis}</p>}
          </div>

          {/* Kelas */}
          <div className="grid gap-2">
            <Label>Kelas</Label>
            <Select
              value={data.kelas_id || "none"}
              onValueChange={(v) => setData("kelas_id", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Belum memilih</SelectItem>
                {kelas.map((k: any) => (
                  <SelectItem key={k.id} value={String(k.id)}>
                    {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kelas_id && <p className="text-sm text-red-600">{errors.kelas_id}</p>}
          </div>

          {/* Keahlian */}
          <div className="grid gap-2">
            <Label>Keahlian</Label>
            <Input
              value={data.keahlian}
              onChange={(e) => setData("keahlian", e.target.value)}
            />
            {errors.keahlian && <p className="text-sm text-red-600">{errors.keahlian}</p>}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Username */}
          <div className="grid gap-2">
            <Label>Username</Label>
            <Input
              value={data.username}
              onChange={(e) => setData("username", e.target.value)}
            />
            {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
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
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Eskul */}
          <div>
            <label className="block text-sm font-medium">Ekstrakurikuler 1</label>
            <select
              value={data.eskul_siswa1_id}
              onChange={(e) => setData("eskul_siswa1_id", e.target.value)}
              className="w-full border rounded-lg p-2 bg-gray-100"
            >
              <option value="">Pilih Eskul</option>
              {eskuls.map((e: any) => (
                <option key={e.id} value={e.id}>{e.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Ekstrakurikuler 2</label>
            <select
              value={data.eskul_siswa2_id}
              onChange={(e) => setData("eskul_siswa2_id", e.target.value)}
              className="w-full border rounded-lg p-2 bg-gray-100"
            >
              <option value="">Pilih Eskul</option>
              {eskuls.map((e: any) => (
                <option key={e.id} value={e.id}>{e.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Ekstrakurikuler 3</label>
            <select
              value={data.eskul_siswa3_id}
              onChange={(e) => setData("eskul_siswa3_id", e.target.value)}
              className="w-full border rounded-lg p-2 bg-gray-100"
            >
              <option value="">Pilih Eskul</option>
              {eskuls.map((e: any) => (
                <option key={e.id} value={e.id}>{e.nama}</option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
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
            </Select>
          </div>

          {/* Status aktif/nonaktif */}
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={data.status}
              onValueChange={(v) => setData("status", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
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
              className="bg-gray-200 hover:bg-gray-300 text-black w-40"
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
