import React from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";

const days = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
];

export default function CreateEskulModal({ onClose }: any) {
  const { data, setData, post, processing } = useForm({
    nama: "",
    schedules: [] as { day_of_week: number; jam_mulai: string; jam_selesai: string }[],
  });

  const toggleDay = (day: number) => {
    if (data.schedules.some((s) => s.day_of_week === day)) {
      setData("schedules", data.schedules.filter((s) => s.day_of_week !== day));
    } else {
      setData("schedules", [...data.schedules, { day_of_week: day, jam_mulai: "", jam_selesai: "" }]);
    }
  };

  const updateTime = (day: number, field: "jam_mulai" | "jam_selesai", value: string) => {
    setData(
      "schedules",
      data.schedules.map((s) => (s.day_of_week === day ? { ...s, [field]: value } : s))
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("admin.eskul.store"), { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white border-2 border-purple-400 rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h2 className="text-lg font-bold mb-4">Create Ekstrakurikuler</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nama Ekstrakurikuler</label>
            <input
              type="text"
              placeholder="cth. paskibra"
              value={data.nama}
              onChange={(e) => setData("nama", e.target.value)}
              className="border rounded-md p-2 w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Jadwal Latihan</label>
            <div className="flex flex-wrap gap-2">
              {days.map((d) => (
                <label key={d.value} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={data.schedules.some((s) => s.day_of_week === d.value)}
                    onChange={() => toggleDay(d.value)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Waktu Latihan</label>
            {data.schedules.map((s) => (
              <div key={s.day_of_week} className="flex items-center gap-3 mt-2">
                <span className="w-20">{days.find((d) => d.value === s.day_of_week)?.label}</span>
                <input
                  type="time"
                  value={s.jam_mulai}
                  onChange={(e) => updateTime(s.day_of_week, "jam_mulai", e.target.value)}
                  className="border rounded-md p-2 w-28"
                />
                <span>-</span>
                <input
                  type="time"
                  value={s.jam_selesai}
                  onChange={(e) => updateTime(s.day_of_week, "jam_selesai", e.target.value)}
                  className="border rounded-md p-2 w-28"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white border border-gray-300 text-black w-28"
            >
              Kembali
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-purple-600 hover:bg-purple-700 text-white w-28"
            >
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
