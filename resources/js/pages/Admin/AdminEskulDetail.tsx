// @ts-nocheck
import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const days = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
];

export default function EditEskulModal({ eskul, onClose }: any) {
  // 🔍 Baca semua kemungkinan struktur data jadwal dari backend
  const extractSchedules = (eskulData: any) => {
  if (!eskulData) return [];

  const possibleSchedules =
    eskulData.schedules ||
    eskulData.jadwal_latihan ||
    eskulData.absensiEskul || // ✅ data dari backend
    eskulData.absensi_eskul ||
    [];

  return possibleSchedules.map((s: any) => ({
    day_of_week: Number(s.day_of_week),
    jam_mulai: s.jam_mulai || "",
    jam_selesai: s.jam_selesai || "",
  }));
};


useEffect(() => {
  console.log("Eskul diterima di modal:", eskul);
}, [eskul]);



  const { data, setData, patch, processing } = useForm<any>({
    _method: "PATCH",
    nama: eskul?.nama || "",
    schedules: extractSchedules(eskul),
  });

  // 🔁 Update form bila eskul berubah
  useEffect(() => {
    setData({
      _method: "PATCH",
      nama: eskul?.nama || "",
      schedules: extractSchedules(eskul),
    });
  }, [eskul]);

  const toggleDay = (day: number) => {
    const exists = data.schedules.some((s: any) => s.day_of_week === day);
    if (exists) {
      setData(
        "schedules",
        data.schedules.filter((s: any) => s.day_of_week !== day)
      );
    } else {
      setData("schedules", [
        ...data.schedules,
        { day_of_week: day, jam_mulai: "", jam_selesai: "" },
      ]);
    }
  };

  const updateTime = (day: number, field: "jam_mulai" | "jam_selesai", value: string) => {
    setData(
      "schedules",
      data.schedules.map((s: any) =>
        s.day_of_week === day ? { ...s, [field]: value } : s
      )
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route("admin.eskul.update", eskul.id), {
      onSuccess: () => {
        toast.success("Berhasil memperbarui data eskul!");
        onClose();
      },
      onError: () => {
        toast.error("Gagal memperbarui data. Periksa kembali input.");
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white border-2 border-purple-400 rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h2 className="text-lg font-bold mb-4">Edit Ekstrakurikuler</h2>

        <form onSubmit={submit} className="space-y-4">
          {/* Nama Eskul */}
          <div>
            <label className="block mb-1 font-medium">Nama Ekstrakurikuler</label>
            <input
              type="text"
              value={data.nama}
              onChange={(e) => setData("nama", e.target.value)}
              className="border rounded-md p-2 w-full"
            />
          </div>

          {/* Pilih Hari */}
          <div>
            <label className="block mb-1 font-medium">Jadwal Latihan</label>
            <div className="flex flex-wrap gap-2">
              {days.map((d) => (
                <label key={d.value} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={data.schedules.some((s: any) => Number(s.day_of_week) === d.value)}
                    onChange={() => toggleDay(d.value)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          {/* Jam Latihan */}
          <div>
            <label className="block mb-1 font-medium">Waktu Latihan</label>
            {data.schedules.length === 0 ? (
              <p className="text-sm text-gray-500 italic mt-2">
                Tidak ada jadwal latihan yang dipilih.
              </p>
            ) : (
              data.schedules.map((s: any) => (
                <div key={s.day_of_week} className="flex items-center gap-3 mt-2">
                  <span className="w-20">
                    {days.find((d) => d.value === Number(s.day_of_week))?.label}
                  </span>
                  <input
                    type="time"
                    value={s.jam_mulai || ""}
                    onChange={(e) =>
                      updateTime(s.day_of_week, "jam_mulai", e.target.value)
                    }
                    className="border rounded-md p-2 w-28"
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={s.jam_selesai || ""}
                    onChange={(e) =>
                      updateTime(s.day_of_week, "jam_selesai", e.target.value)
                    }
                    className="border rounded-md p-2 w-28"
                  />
                </div>
              ))
            )}
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white border border-gray-300 text-black w-28"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-purple-600 hover:bg-purple-700 text-white w-28"
            >
              Perbarui
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
