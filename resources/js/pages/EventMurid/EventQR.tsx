import { usePage, router } from "@inertiajs/react";
import BottomNavbar from "@/components/Murid/BottomNavbar";

interface Event {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
}

interface Registration {
  id: number;
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
  qr_code?: string;
}

export default function EventQR() {
  const { event, registration, qr_code } = usePage<PageProps>().props;

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

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
    <div className="min-h-screen bg-white px-5 py-6 flex flex-col text-gray-900 pb-20">
      <h1 className="text-lg font-semibold mb-4 text-center">
        QR Code Event
      </h1>

      {/* Profil & Event */}
      <div className="grid grid-cols-2 gap-y-3 text-sm mb-6">
        <div>
          <p className="text-gray-500">Profil Peserta</p>
          <p className="font-semibold">{registration?.user?.name}</p>
          <p className="text-gray-600 text-xs">
            {registration?.user?.murid?.kelas?.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500">Event</p>
          <p className="font-semibold">{event.title}</p>
        </div>

        <div>
          <p className="text-gray-500">Hari, Tanggal</p>
          <p className="font-semibold">{tanggalEvent}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500">Waktu</p>
          <p className="font-semibold">{waktuEvent}</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center mb-6">
        {qr_code ? (
          <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-2 border-dashed border-gray-300 mb-2">
              <div dangerouslySetInnerHTML={{ __html: qr_code }} />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center ">
              Akses QR Code
            </p>
          </div>
        ) : (
          <p className="text-red-500 text-sm">QR Code tidak tersedia.</p>
        )}
      </div>

      {/* Tombol selesai */}
      <button
        onClick={() => (window.location.href = '/murid/events')}
        className="w-full bg-white text-black border border-orange-400 py-2 rounded-lg font-medium shadow-md active:scale-[0.98] transition"
      >
        Selesai
      </button>

      <BottomNavbar />
    </div>
  );
}

