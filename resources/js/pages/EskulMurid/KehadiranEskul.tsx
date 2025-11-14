import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import BottomNavbar from "@/components/Murid/BottomNavbar";
import { useEffect, useState } from "react";
import { CameraIcon } from "lucide-react";
import axios from "axios";
import { PageProps as InertiaPageProps } from "@inertiajs/core";

interface User {
  id: number;
  name: string;
  email: string;
  kelas: { id: number; name: string };
  nis: string;
  avatar?: string;
}

interface Absensi {
  id: number;
  eskul_id: number;
  tanggal: string | null;
  jam_mulai: string;
  jam_selesai: string;
}

interface Kehadiran {
  id: number;
  status: "Hadir" | "Tidak Hadir";
  foto?: string | null;
}

type PageProps = InertiaPageProps & {
  auth: { user: User };
  absensi: Absensi;
  kehadiran: Kehadiran | null;
};

export default function KehadiranEskul() {
  const { props } = usePage<PageProps>();
  const { auth, absensi, kehadiran } = props;
  const [user, setUser] = useState<User | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFotoFile(file);
      setImage(URL.createObjectURL(file));

      try {
        const base64 = await fileToBase64(file);
        setFotoBase64(base64);
      } catch (err) {
        console.error("Gagal konversi foto ke base64:", err);
      }
    } else {
      setFotoFile(null);
      setFotoBase64(null);
      setImage(null);
    }
  };
  const submitKehadiran = async (status: "Hadir" | "Tidak Hadir") => {
    if (status === "Hadir" && !fotoFile && !fotoBase64) {
      alert("Harap ambil foto terlebih dahulu sebelum memilih Hadir!");
      return;
    }

    setProcessing(true);

    try {
      if (fotoFile) {
        const formData = new FormData();
        formData.append("status", status);
        formData.append("foto", fotoFile);

        await axios.post(`/murid/eskul/kehadiran/${absensi.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
      } 
      else if (fotoBase64) {
        await axios.post(
          `/murid/eskul/kehadiran/${absensi.id}`,
          {
            status,
            foto: fotoBase64,
          },
          { withCredentials: true }
        );
      }

      alert("Kehadiran berhasil disimpan!");
      window.location.href = "/murid/eskul";
    } catch (error: any) {
      console.error("Gagal kirim kehadiran:", error);
      alert("Terjadi kesalahan saat menyimpan kehadiran.");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
      axios.get("/api/student/me").then((res) => setUser(res.data));
    }, []);

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Kehadiran Eskul" />

      <div className="min-h-screen flex flex-col bg-white text-gray-900">
        {/* Header profil */}
        <div className="flex items-center gap-3 p-4">
          <img
            src={auth.user.avatar || "/default-avatar.png"}
            alt="Profile"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
             <h1 className="text-xl font-semibold">{user?.name}</h1>
            <p className="text-sm">{user?.kelas?.name}</p>
          </div>
        </div>

        {/* Jika sudah absen */}
        {kehadiran ? (
          <div className="flex flex-col items-center mt-6">
            {kehadiran.status === "Hadir" && kehadiran.foto && (
            <img
              src={`/storage/${kehadiran.foto}`}
              alt="Foto Kehadiran"
              className="w-[90%] max-w-sm aspect-square object-cover rounded-lg mb-4"
            />
          )}
            <div
              className={`px-4 py-2 rounded-xl text-center text-white font-semibold ${
                kehadiran.status === "Hadir" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              Status: {kehadiran.status}
            </div>
          </div>
        ) : (
          <>
            {/* Upload foto */}
            <div className="flex flex-col items-center mt-6 border-b border-t pb-4">
              <label className="relative w-[90%] max-w-sm aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <CameraIcon className="w-10 h-10 mb-3" />
                    <p className="text-xs bg-gray-200 px-4 py-1 rounded-full shadow">
                      Ambil foto dahulu untuk kehadiran eskul!
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>

              {!isMobile && (
                <p className="text-red-500 text-sm mt-3 text-center px-4">
                  ⚠️ Fitur kamera hanya tersedia di perangkat mobile. <br />
                  Silakan buka halaman ini melalui HP Anda.
                </p>
              )}
            </div>

            {/* Tombol hadir/tidak hadir */}
            <div className="flex justify-center gap-4 mt-6 mb-6">
              <button
                onClick={() => submitKehadiran("Hadir")}
                disabled={processing}
                className="bg-green-500 text-white text-sm px-6 py-2 rounded-lg shadow-md w-32 text-center"
              >
                {processing ? "Menyimpan..." : "Hadir"}
              </button>

              <button
                onClick={() => submitKehadiran("Tidak Hadir")}
                disabled={processing}
                className="bg-red-500 text-white text-sm px-6 py-2 rounded-lg shadow-md w-32 text-center"
              >
                {processing ? "Menyimpan..." : "Tidak Hadir"}
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNavbar />
    </AuthenticatedLayout>
  );
}
