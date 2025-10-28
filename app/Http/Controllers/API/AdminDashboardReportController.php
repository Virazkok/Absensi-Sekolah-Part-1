<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Murid;
use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use App\Models\EventKehadiran;
use Carbon\Carbon;

class AdminDashboardReportController extends Controller
{
    public function index(Request $request)
{
    $range = $request->query('range', 'bulanan');
    $bulan = (int) $request->query('bulan', Carbon::now()->month);
    $tahun = (int) $request->query('tahun', Carbon::now()->year);
    $semester = (int) $request->query('semester', 1);
    $now = Carbon::now('Asia/Jakarta');

    // === Tentukan rentang tanggal ===
    switch ($range) {
       case 'mingguan':
    $startDate = $request->query('start_date');
    $endDate = $request->query('end_date');

    if ($startDate && $endDate) {
        // jika frontend kirim range manual
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();
    } else {
        // selalu pakai minggu ini (Senin–Jumat minggu berjalan)
        $start = $now->copy()->startOfWeek(Carbon::MONDAY);
        $end = $now->copy()->startOfWeek(Carbon::MONDAY)->addDays(4)->endOfDay();
    }
    break;


        case 'semester':
    $startDate = $request->query('start_date');
    $endDate = $request->query('end_date');

    if ($startDate && $endDate) {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();
    } else {
        if ($semester === 1) {
            // Semester 1 (Ganjil): Juli - Desember pada tahun yang sama
            $start = Carbon::create($tahun, 7, 1)->startOfDay();
            $end = Carbon::create($tahun, 12, 31)->endOfDay();
        } else {
            // Semester 2 (Genap): Januari - Juni tahun berikutnya
            $start = Carbon::create($tahun + 1, 1, 1)->startOfDay();
            $end = Carbon::create($tahun + 1, 6, 30)->endOfDay();
        }
    }
    break;



        default: // bulanan
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            if ($startDate && $endDate) {
                $start = Carbon::parse($startDate)->startOfDay();
                $end = Carbon::parse($endDate)->endOfDay();
            } else {
                $start = Carbon::create($tahun, $bulan, 1)->startOfMonth();
                $end = Carbon::create($tahun, $bulan, 1)->endOfMonth();
            }
            break;
    }

    // === Ambil semua murid (agar yang tidak hadir tetap muncul) ===
    $murids = Murid::with('kelas')->get();

    // === Kehadiran Sekolah ===
    $kehadiranSekolah = Kehadiran::with('murid.kelas')
        ->whereBetween('tanggal', [$start, $end])
        ->get()
        ->groupBy('murid_id')
        ->map(function ($items) {
            $murid = $items->first()->murid;
            $hadir = $items->whereIn('kehadiran', ['Hadir', 'Terlambat'])->count();
            return [
                'murid_id' => $murid->id ?? null,
                'nama' => $murid->nama ?? '-',
                'kelas' => $murid->kelas->name ?? '-',
                'keahlian' => $murid->kelas->kejuruan ?? $murid->keahlian ?? '-',
                'hadir_sekolah' => $hadir,
            ];
        });

    // === Kehadiran Eskul ===
    $kehadiranEskul = KehadiranEskul::with(['user.murid.kelas'])
        ->whereBetween('tanggal', [$start, $end])
        ->get()
        ->groupBy('user_id')
        ->map(function ($items) {
            $user = $items->first()->user;
            $murid = $user->murid;
            $hadir = $items->where('status', 'Hadir')->count();
            return [
                'murid_id' => $murid->id ?? null,
                'nama' => $murid->nama ?? $user->name ?? '-',
                'kelas' => $murid->kelas->name ?? '-',
                'keahlian' => $murid->kelas->kejuruan ?? $murid->keahlian ?? '-',
                'hadir_ekskul' => $hadir,
            ];
        });

    // === Kehadiran Event ===
    $kehadiranEvent = EventKehadiran::with(['murid.kelas'])
        ->whereBetween('attended_at', [$start, $end])
        ->get()
        ->groupBy('murid_id')
        ->map(function ($items) {
            $murid = $items->first()->murid;
            $hadir = $items->count();
            return [
                'murid_id' => $murid->id ?? null,
                'nama' => $murid->nama ?? '-',
                'kelas' => $murid->kelas->name ?? '-',
                'keahlian' => $murid->kelas->kejuruan ?? $murid->keahlian ?? '-',
                'hadir_event' => $hadir,
            ];
        });

    // === Gabungkan semua data ===
    $data = $murids->map(function ($murid, $idx) use ($kehadiranSekolah, $kehadiranEskul, $kehadiranEvent) {
        $id = $murid->id;
        $sekolah = $kehadiranSekolah->get($id, []);
        $eskul = $kehadiranEskul->get($id, []);
        $event = $kehadiranEvent->get($id, []);

        $hadirSekolah = $sekolah['hadir_sekolah'] ?? 0;
        $hadirEskul = $eskul['hadir_ekskul'] ?? 0;
        $hadirEvent = $event['hadir_event'] ?? 0;
        $total = $hadirSekolah + $hadirEskul + $hadirEvent;

        return [
            'no' => $idx + 1,
            'murid_id' => $id,
            'nama' => $murid->nama ?? '-',
            'kelas' => $murid->kelas->name ?? '-',
            'keahlian' => $murid->kelas->kejuruan ?? $murid->keahlian ?? '-',
            'hadir_sekolah' => $hadirSekolah,
            'hadir_ekskul' => $hadirEskul,
            'hadir_event' => $hadirEvent,
            'total' => $total,
            'keterangan' => $total > 0 ? 'Baik' : 'Belum Hadir',
        ];
    });

    return response()->json([
        'range' => $range,
        'periode' => [
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
        ],
        'data' => $data,
    ]);
}

}
