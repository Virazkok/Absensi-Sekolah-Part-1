<?

namespace App\Http\AbsensiEskulController;

use Carbon\Carbon;
use App\Models\AbsensiEskul;
use Inertia\Controller;
use Illuminate\Http\Request;
use App\Models\eskul;

class AbsensiEskulController extends Controller
{
    public function storeSchedule(Request $request, Eskul $eskul)
    {
        $data = $request->validate([
            'tanggal' => 'nullable|date',
            'day_of_week' => 'nullable|integer|min:0|max:6',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'is_recurring' => 'boolean'
        ]);

        $eskul->absensiEskul()->create($data);

        return back()->with('success', 'Jadwal berhasil ditambahkan');
    }

    public function deleteSchedule(AbsensiEskul $schedule)
    {
        $schedule->delete();
        return back()->with('success', 'Jadwal berhasil dihapus');
    }

    public function generateTodayAbsensi()
{
    $today = Carbon::today();
    $dayOfWeek = $today->dayOfWeek; // 0=minggu,1=senin,...6=sabtu

    $jadwalEskul = AbsensiEskul::where('is_recurring', 1)
        ->where('day_of_week', $dayOfWeek)
        ->get();

    foreach ($jadwalEskul as $jadwal) {
        AbsensiEskul::firstOrCreate([
            'eskul_id' => $jadwal->eskul_id,
            'tanggal'  => $today->toDateString(),
        ], [
            'jam_mulai' => $jadwal->jam_mulai,
            'jam_selesai' => $jadwal->jam_selesai,
            'is_recurring' => 0, // tandai ini absensi nyata
        ]);
    }
}
}