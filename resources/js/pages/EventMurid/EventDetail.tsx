import { usePage } from "@inertiajs/react";
import BottomNavbar from "@/components/Murid/BottomNavbar";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import EventRegister from "./EventRegister";

interface Event {
  id: number;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  sport_categories?: string[];
  image?: any;
  lokasi?: string;
}

interface Registration {
  id: number;
}

interface PageProps {
  event: Event;
  registration?: Registration;
  auth: { user: { id: number; name: string; kelas?: { name: string } } };
  [key: string]: any;
}

export default function EventDetail() {
  const { event, registration, auth } = usePage<PageProps>().props;
  const isRegistered = !!registration;
  const now = new Date();
  const endDate = new Date(event.end_date);
  const isEnded = now > endDate;

  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="bg-white min-h-screen p-4 text-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => (window.location.href = '/murid/events/')}>
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <span className="font-medium">Detail Event</span>
      </div>

      {/* Event Image */}
        <img
        src={event.image || '/default-avatar.png'}
        alt={event.title}
        className="w-full h-48 object-cover rounded-t-[20px]"
        onError={(e: any) => (e.target.src = '/default-avatar.png')}
      />
      

      {/* Title */}
      <h1 className="text-xl font-bold text-center mb-1">{event.title}</h1>
      <h2 className="text-sm font-semibold text-center mb-4">Jadwal Event</h2>

     {/* Jadwal */}
      <div className="flex justify-between text-sm mb-3">
        <div>
          <p>Hari, Tanggal</p>
          <p className="font-semibold">
            {new Date(event.start_date).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p >Waktu</p>
          <p className="font-semibold">
            {new Date(event.start_date).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            s.d{" Selesai"}
            
          </p>
        </div>
      </div>
      {/* Deskripsi */}
      <div className="mb-3">
        <h3 className="text-sm mb-1">Deskripsi Event</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* Lokasi */}
      <div className="mb-5">
        <h3 className="text-sm mb-1">Lokasi</h3>
        <p className="text-sm font-semibold">{event.lokasi || "SGB"}</p>
      </div>

      {/* Status Pendaftaran */}
      {isRegistered ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
          <p className="text-green-700 font-medium">
            Anda sudah terdaftar di event ini
          </p>
          <button
            onClick={() =>
              (window.location.href = route("events.confirmation", event.id))
            }
            className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg w-full active:scale-[0.98] transition"
          >
            Lihat Bukti Pendaftaran
          </button>
        </div>
      ) : !isEnded && event.type !== "pemberitahuan" ? (
        <button
          onClick={() => setShowRegister(true)}
          className="w-full py-2 border border-orange-400 text-orange-500 rounded-lg font-medium active:scale-[0.98] transition"
        >
          Daftar
        </button>
      ) : null}

      {/* Jika event sudah berakhir */}
      {isEnded && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Event ini sudah berakhir</p>
        </div>
      )}

      <BottomNavbar />

      {/* Modal Register */}
      {showRegister && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
        <EventRegister
      event={event}
      auth={{ user: auth.user }}
      onClose={() => setShowRegister(false)}
    />

      </div>
    )}
    </div>
  );
}
