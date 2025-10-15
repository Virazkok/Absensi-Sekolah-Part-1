import { usePage, router } from '@inertiajs/react';
import BottomNavbar from '@/components/Murid/BottomNavbar';
import { ArrowUpRight, ArrowRight } from "lucide-react";

interface Registration {
  user_id: number;
}

interface Event {
  image: any;
  id: number;
  title: string;
  description: string;
  type: 'olahraga' | 'non-olahraga' | 'pemberitahuan';
  start_date: string;
  end_date: string;
  registrations: Registration[];
}

interface PageProps {
  events: Event[];
  auth: { user: { id: number; name: string } };
  [key: string]: any;
}

export default function EventIndex() {
  const { events, auth } = usePage<PageProps>().props;

  const isRegistered = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    return event?.registrations?.some(r => r.user_id === auth.user.id) ?? false;
  };

  const goToDetail = (eventId: number) => {
    router.visit(route('events.event-detail', { id: eventId }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white min-h-screen p-4 text-gray-900 pb-20"> {/* Tambahkan pb-20 untuk padding bottom */}
      <h1 className="text-lg font-semibold mb-4">List Event</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {events.map(event => {
          const now = new Date();
          const start = new Date(event.start_date);
          const end = new Date(event.end_date);

          const alreadyReg = isRegistered(event.id);
          const isEnded = now > end;
          const isOngoing = now >= start && now <= end;

          return (
            <div
              key={event.id}
              className="bg-purple-300 rounded-2xl overflow-hidden shadow p-3"
            >
              {/* Gambar event dengan jarak dari sisi */}
              <div className="w-full aspect-video">
               <img
  src={event.image ? `/storage/${event.image}` : `/default-avatar.png`}
  alt={event.title}
  className="w-full h-full object-cover rounded-t-[20px]"
  onError={(e: any) => (e.target.style.display = 'none')}
/>

              </div>

              <div className="mt-3 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm">{formatDate(event.start_date)}</p>
                </div>

                {/* Tombol Daftar */}
                {!alreadyReg && event.type !== 'pemberitahuan' && !isEnded && (
                  <button
                    onClick={() => goToDetail(event.id)}
                    className="bg-orange-500 p-2 rounded-lg active:scale-[0.98] transition"
                  >
                    <ArrowUpRight className="w-4 h-4 text-black" />
                  </button>
                )}

                {/* Tombol Generate QR (langsung ke EventConfirmation) */}
                {alreadyReg && isOngoing && (
                  <button
                    onClick={() => router.visit(route('events.confirmation', { id: event.id }))}
                    className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-medium active:scale-[0.98] transition"
                  >
                    <span>Generate QR</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                )}
              </div>

              {/* Jika event sudah berakhir */}
              {isEnded && (
                <div className="mt-2">
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                    Event telah berakhir
                  </span>
                </div>
              )}

              {/* Jika sudah daftar tapi event belum mulai */}
              {alreadyReg && !isEnded && !isOngoing && (
                <div className="mt-2">
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                    Terdaftar
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}