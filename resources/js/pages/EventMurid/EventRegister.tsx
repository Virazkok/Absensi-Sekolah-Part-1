import { router } from "@inertiajs/react";
import { useState } from "react";

interface Event {
  id: number;
  title: string;
  type: string;
  sport_categories?: string[];
  team_required_sports?: string[];
}

interface User {
  id: number;
  name: string;
  kelas?: {
    id?: number;
    name?: string;
  } | null;
}



interface Props {
  event: Event;
  auth: { user: User };
  onClose?: () => void; // optional: kalau dipakai sebagai modal
}

export default function EventRegister({ event, auth, onClose }: Props) {
  const [sportCategory, setSportCategory] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: any = {};
    if (event.type === "olahraga") {
      payload.sport_category = sportCategory;
      if (event.team_required_sports?.includes(sportCategory)) {
        payload.team_members = teamMembers
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);
      }
    }

    router.post(route("events.register", event.id), payload, {
      onFinish: () => setIsSubmitting(false),
      onSuccess: () => {
        if (onClose) {
          onClose();
        }
        router.visit(route("events.confirmation", { id: event.id }));
      },
    });
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl w-80 p-6">
      <h2 className="text-center font-semibold mb-5 text-base">
        Form Register
      </h2>

    {/* Informasi Peserta */}
<div className="flex flex-col gap-3 mb-5">
  <div>
    <label className="text-sm text-gray-600">Nama</label>
    <input
      type="text"
      value={auth.user.name}
      readOnly
      className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
    />
  </div>
  <div>
    <label className="text-sm text-gray-600">Kelas</label>
   <input
  type="text"
  value={auth.user.kelas?.name || "-"}
  readOnly
  className="w-full border rounded p-2 bg-gray-100"
/>

  </div>
</div>


      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {event.type === "olahraga" && (
          <>
            <label className="text-sm text-gray-600">Cabang Olahraga *</label>
            <select
              required
              value={sportCategory}
              onChange={(e) => setSportCategory(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm 
                         focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              <option value="">Pilih Cabang</option>
              {event.sport_categories?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </>
        )}

        {event.type === "olahraga" &&
          sportCategory &&
          event.team_required_sports?.includes(sportCategory) && (
            <>
              <label className="text-sm text-gray-600">
                Anggota Tim (pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                placeholder="contoh: Budi, Andi, Siti"
                className="border border-gray-300 rounded px-3 py-2 text-sm 
                           focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </>
          )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium shadow-sm 
                     active:scale-[0.98] transition disabled:opacity-50"
        >
          {isSubmitting ? "Mendaftarkan..." : "Gabung"}
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-white text-orange-500 border border-gray-300 py-2 rounded-lg 
                       font-medium shadow-sm active:scale-[0.98] transition"
          >
            Kembali
          </button>
        )}
      </form>
    </div>
  </div>
);
}
