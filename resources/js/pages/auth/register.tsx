import { useEffect, useState, FormEventHandler } from "react";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import InputError from "@/components/input-error";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  kelas_id: string;
  nis: string;
  keahlian: string;
  role: string;
  eskul_siswa1_id: string;
  eskul_siswa2_id: string;
  eskul_siswa3_id: string;
};

interface Kelas {
  id: string | number;
  name: string;
}

interface Eskul {
  id: string | number;
  nama: string;
}

export default function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [eskulOptions, setEskulOptions] = useState<Eskul[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    kelas_id: "",
    nis: "",
    keahlian: "",
    role: "murid",
    eskul_siswa1_id: "",
    eskul_siswa2_id: "",
    eskul_siswa3_id: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/kelas").then((r) => r.json()),
      fetch("/api/eskuls").then((r) => r.json()),
    ])
      .then(([kelasData, eskulData]) => {
        setKelasList(kelasData);
        setEskulOptions(eskulData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("register"), {
      onSuccess: () => {
        setOpen(false);
        reset();
        window.location.reload();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#E4D2FC] hover:bg-[#D7BFFD] text-black font-medium px-4 py-2 rounded-lg">
          Tambah User
        </Button>
      </DialogTrigger>

     <DialogContent
  className="!max-w-[900px] w-full bg-white p-10 rounded-2xl shadow-lg overflow-y-auto max-h-[70vh] text-gray-900"
>

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Tambah Akun Baru
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="grid grid-cols-2 gap-6 mt-4">
          {/* Nama */}
          <div className="grid gap-2">
            <Label>Nama</Label>
            <Input
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              placeholder="cth. Bastian"
            />
            <InputError message={errors.name} />
          </div>

          {/* NIS */}
          <div className="grid gap-2">
            <Label>NIS/NIP</Label>
            <Input
              value={data.nis}
              onChange={(e) => setData("nis", e.target.value)}
              placeholder="cth. 12345"
            />
            <InputError message={errors.nis} />
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              placeholder="email@example.com"
            />
            <InputError message={errors.email} />
          </div>

          {/* Role */}
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
              value={data.role}
              onValueChange={(v) => setData("role", v)}
            >
              <SelectTrigger className="text-gray-900">
                <SelectValue placeholder="Pilih role" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="murid">Murid</SelectItem>
                <SelectItem value="guru">Guru</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <InputError message={errors.role} />
          </div>

          {/* Kelas */}
          <div className="grid gap-2">
            <Label>Kelas</Label>
            <Select
              value={String(data.kelas_id)}
              onValueChange={(v) => setData("kelas_id", v)}
              disabled={isLoading}
            >
              <SelectTrigger className="text-gray-900">
                <SelectValue placeholder="Pilih kelas" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent>
                {kelasList.map((kelas) => (
                  <SelectItem key={kelas.id} value={String(kelas.id)}>
                    {kelas.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={errors.kelas_id} />
          </div>

          {/* Keahlian */}
          <div className="grid gap-2">
            <Label>Keahlian</Label>
            <Input
              value={data.keahlian}
              onChange={(e) => setData("keahlian", e.target.value)}
              placeholder="cth. RPL, DKV, Akuntansi"
            />
            <InputError message={errors.keahlian} />
          </div>

          {/* Eskul 1–3 */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid gap-2">
              <Label>Eskul {i} (Opsional)</Label>
              <Select
                value={String(data[`eskul_siswa${i}_id` as keyof RegisterForm] || "")}
                onValueChange={(v) =>
                  setData(`eskul_siswa${i}_id` as keyof RegisterForm, v)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="text-gray-900">
                  <SelectValue placeholder="Pilih eskul" className="text-gray-900" />
                </SelectTrigger>
                <SelectContent>
                  {eskulOptions.map((eskul) => (
                    <SelectItem key={eskul.id} value={String(eskul.id)}>
                      {eskul.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Password */}
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="Masukkan password"
            />
            <InputError message={errors.password} />
          </div>

          {/* Konfirmasi Password */}
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
            <InputError message={errors.password_confirmation} />
          </div>

          {/* Tombol */}
          <div className="col-span-2 flex justify-center mt-8 gap-4">
            <Button
              type="button"
              onClick={() => setOpen(false)}
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
      </DialogContent>
    </Dialog>
  );
}
