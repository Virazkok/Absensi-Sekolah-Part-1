import { usePage, router } from "@inertiajs/react";
import { useState } from "react";
import BottomNavbar from "@/components/Murid/BottomNavbar";
import axios from "axios";

interface Event {
  end_date_plain: string;
  start_date_plain: string;
  id: number;
  title: string;
  type: string;
  start_date: string;
  end_date: string;
}

interface Registration {
  id: number;
  sport_category?: string;
  team_members?: string[];
  user: {
    name: string;
    murid: {
      kelas: {
        name: string;
      };
    };
  };
}

interface PageProps {
  event: Event;
  registration: Registration;
  qrMessage?: string;
  auth: { user: { id: number } };
  props?: {
    qr_code?: string;
    error?: boolean;
  };
}

export default function EventConfirmation() {
  const { event, registration } = usePage<PageProps>().props;
  const [qrCode, setQrCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const parseLocalDate = (dateString: string) => {
    const [datePart, timePart] = dateString.split("T");
    const [year, month, day] = datePart.split("-");
    const [hours, minutes] = timePart.split(":");

    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
  };

  const startDate = parseLocalDate(event.start_date_plain);
  const endDate = parseLocalDate(event.end_date_plain);
  const now = new Date();
  const canGenerateByTime = now >= startDate && now <= endDate;
  const isSameDay =
    now.toISOString().split("T")[0] ===
    startDate.toISOString().split("T")[0];
  const canGenerateQR = isSameDay || canGenerateByTime;

  const showComingSoon = !isSameDay && now < startDate; 

  const generateQR = async () => {
  if (!canGenerateQR) return;
  setIsGenerating(true);

  try {
    router.visit(route("events.qr.show", { id: event.id }));
  } catch (err) {
    console.error(err);
  } finally {
    setIsGenerating(false);
  }
};
  const tanggalEvent = startDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const waktuEvent = `${startDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })} s.d ${endDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <div className="bg-white min-h-screen p-4">
      <div className="max-w-md mx-auto text-gray-900">
        <h1 className="text-xl font-bold mb-6 text-center">
          Bukti Pendaftaran
        </h1>

        {/* Profil & Event */}
        <div className="grid grid-cols-2 text-sm mb-4">
          <div>
            <p className="text-gray-500">Profil Peserta</p>
            <p className="font-medium">{registration.user.name}</p>
            <p className="text-gray-600 text-xs">
              {registration.user.murid.kelas.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Event</p>
            <p className="font-medium">{event.title}</p>
          </div>
        </div>

        {/* Hari/Tanggal & Waktu */}
        <div className="grid grid-cols-2 text-sm mb-6">
          <div>
            <p className="text-gray-500">Hari, Tanggal</p>
            <p className="font-semibold">{tanggalEvent}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Waktu</p>
            <p className="font-semibold">{waktuEvent}</p>
          </div>
        </div>

        {/* Banner Coming Soon */}
        {showComingSoon && !qrCode && (
          <div className="mb-4">
            <img
              src="/images/coming-soon.png"
              alt="Coming Soon"
              className="rounded-lg shadow-md w-full object-cover"
            />
          </div>
        )}

        {/* Jika QR sudah dibuat */}
        {qrCode && (
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-2 border-dashed border-gray-300 mb-2">
                <div dangerouslySetInnerHTML={{ __html: qrCode }} />
              </div>
              <p className="text-sm text-gray-600">
                Scan QR ini saat hadir di event
              </p>
            </div>
          </div>
        )}

        {/* Pesan info */}
        {!qrCode && (
          <p className="text-xs text-gray-500 text-center mb-4">
            {showComingSoon
              ? `QR Code baru tersedia mulai ${startDate.toLocaleDateString(
                  "id-ID",
                  { weekday: "long", day: "2-digit", month: "short" }
                )}`
              : now > endDate
              ? "Event telah berakhir"
              : "Scan QR pas hari H buat buktiin kamu hadir, ya!"}
          </p>
        )}

        {/* Tombol Generate QR */}
        {!qrCode && (
          <button
            onClick={generateQR}
            disabled={!canGenerateQR || isGenerating || now > endDate}
            className={`w-full py-2 mb-3 rounded-lg shadow-sm ${
              canGenerateQR && now <= endDate
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isGenerating ? "Membuat QR Code..." : "Generate QR Code"}
          </button>
        )}

        {/* Tombol Selesai */}
        <button onClick={() => (window.location.href = '/murid/events')}
          
          className="w-full py-2 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-50"
        >
          Selesai
        </button>

        <BottomNavbar />
      </div>
    </div>
  );
}
