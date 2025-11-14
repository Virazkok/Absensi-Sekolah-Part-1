  // resources/js/Pages/Eskul/AbsensiEskul.tsx
  import { Head, usePage, useForm, router, Link } from "@inertiajs/react";
  import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
  import BottomNavbar from "@/components/Murid/BottomNavbar";
  import { CameraIcon } from "lucide-react";
  import { FormEvent, useEffect, useState } from "react";
  import { Student } from "@/types";
import { Button } from "@/components/ui/button";
import axios from "axios";

  interface AuthUser {
    id: number;
    name: string;
    email: string;
    foto?: string;
    kelas?: {
      id: number;
      name: string;
    };
  }

  interface EskulItem {
    id: number;
    nama: string;
  }

  interface AbsensiItem {
    id: number;
    eskul_id: number;
    tanggal: string | null;
    day_of_week: number | null;
    jam_mulai: string;
    jam_selesai: string;
    kehadiran: {
      status: string;
      tanggal: string;
      user_id: number;
    }[];
  }

  interface User {
  id: number;
  name: string;
  email: string;
  kelas: { id: number; name: string };
  nis: string;
  avatar?: string;
}

  interface PageProps {
    auth: {
      user: AuthUser;
    };
    eskul: EskulItem[];
    absensiHariIni: AbsensiItem[];
  }

  export default function AbsensiEskul() {
    const page = usePage();
    const props = page.props as unknown as PageProps;
    const { auth, eskul, absensiHariIni } = props;
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState<"list" | "form">("list");
    const [selectedAbsensi, setSelectedAbsensi] = useState<AbsensiItem | null>(null);
    const [image, setImage] = useState<string | null>(null);

    const { data, setData } = useForm({
      absensi_eskul_id: "",
      foto: null as File | null,
    });

    useEffect(() => {
    axios.get("/api/student/me").then((res) => setUser(res.data));
  }, []);

    const handleIsiAbsen = (absensi: AbsensiItem) => {
      setSelectedAbsensi(absensi);
      setData("absensi_eskul_id", absensi.id.toString());
      setStep("form");
      setImage(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setData("foto", file);
        setImage(URL.createObjectURL(file));
      }
    };

    const handleSubmit = async (Hadir: boolean, e: FormEvent) => {
      e.preventDefault();
      if (Hadir && !data.foto) {
        alert("Silakan upload foto terlebih dahulu.");
        return;
      }

      const formData = new FormData();
      formData.append("absensi_eskul_id", data.absensi_eskul_id);
      if (Hadir && data.foto) {
        formData.append("foto", data.foto);
      }

      router.post(route("eskul.absensi.store"), formData, {
        onSuccess: () => {
          setData("foto", null);
          setStep("list");
          setSelectedAbsensi(null);
          setImage(null);
          router.reload({ only: ["absensiHariIni"] });
        },
      });
    };

    const hariLabel = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    return (
      <AuthenticatedLayout user={auth.user}>
        <Head title="Absensi Eskul" />

        <div className="p-4">
          {/* 🔹 Profile Header (nama + kelas dari HomeSiswa) */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-600">{user?.name}</h1>
              <p className="text-sm text-gray-600">
                {user?.kelas?.name || "Kelas"}
              </p>
            </div>
          </div>

          {/* daftar eskul */}
          {step === "list" && (
  <div className="flex flex-col gap-4">
    {eskul.length === 0 ? (
      <div className="bg-white rounded-xl p-6 shadow">
        <p>Anda belum terdaftar di eskul apapun.</p>
      </div>
    ) : (
      (() => {
        // Ambil hanya eskul yang punya jadwal hari ini
        const eskulDenganJadwal = eskul.filter((eskulItem) =>
          absensiHariIni.some((a) => a.eskul_id === eskulItem.id)
        );

        if (eskulDenganJadwal.length === 0) {
          return (
            <div className="bg-white text-gray-900 rounded-xl p-6 shadow">
              <p>Tidak ada absensi eskul hari ini.</p>
            </div>
          );
        }

        return eskulDenganJadwal.map((eskulItem) => {
          const absensi = absensiHariIni.filter(
            (a) => a.eskul_id === eskulItem.id
          );

          return (
            <div
              key={eskulItem.id}
              className="bg-purple-400 text-white rounded-xl p-4 shadow"
            >
              <h2 className="font-semibold text-lg mb-3">{eskulItem.nama}</h2>
              {absensi.map((a) => {
                const sudahAbsen = a.kehadiran.some(
                  (k) =>
                    k.user_id === auth.user.id &&
                    k.tanggal === new Date().toISOString().split("T")[0]
                );

                return (
                  <div key={a.id} className="mb-4">
                    <div className="mb-2">
                      <p className="text-xs opacity-80">Jadwal</p>
                      <p className="text-sm">
                        {a.tanggal
                          ? new Date(a.tanggal).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : `Hari ${
                              a.day_of_week !== null
                                ? hariLabel[a.day_of_week]
                                : "-"
                            }`}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs opacity-80">Waktu</p>
                      <p className="text-sm">
                        {a.jam_mulai} - {a.jam_selesai}
                      </p>
                    </div>

                    {sudahAbsen ? (
                    <div className="w-full text-center py-2 rounded font-semibold text-white">
                      {a.kehadiran.some(k => 
                        k.user_id === auth.user.id && 
                        k.tanggal === new Date().toISOString().split("T")[0] &&
                        // Asumsikan kita bisa mendapatkan status dari kehadiran
                        // Anda mungkin perlu menyesuaikan query untuk mendapatkan status
                        k.status === "Tidak Hadir" // Ini perlu disesuaikan dengan struktur data Anda
                      ) ? ( 
                        <div className="w-full text-center py-2 rounded font-semibold bg-red-500 rounded-lg ">Tidak Hadir</div>
                      ) : (
                        <div className="w-full text-center py-2 rounded font-semibold bg-green-500 rounded-lg">Hadir</div>
                      )}
                    </div>
                  ) : (
                    <Link href={route("murid.eskul.kehadiran", a.id)}>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">
                        Isi Absen
                      </Button>
                    </Link>
                  )}
                  </div>
                );
              })}
            </div>
          );
        });
      })()
    )}
  </div>
)}
        </div>

        <BottomNavbar />
      </AuthenticatedLayout>
    );
  }
