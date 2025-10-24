<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use App\Models\EventKehadiran;
use Carbon\Carbon;

class AdminDashboardStatistikController extends Controller
{
    public function __construct()
    {
        Carbon::setLocale('id');
    }

    /**
     * GET /api/admin/dashboard/statistik?range=weekly|monthly|semester
     */
    public function index(Request $request)
    {
        $range = $request->query('range', 'weekly');
        $now = Carbon::now('Asia/Jakarta');

        switch ($range) {
            case 'weekly':
                $start = $now->copy()->startOfWeek(Carbon::MONDAY);
                $end = $now->copy()->endOfWeek(Carbon::FRIDAY);
                break;
            case 'monthly':
                $start = $now->copy()->startOfMonth();
                $end = $now->copy()->endOfMonth();
                break;
            case 'semester':
                if ($now->month <= 6) {
                    // Semester 1: Jan - Jun
                    $start = Carbon::create($now->year, 1, 1, 0, 0, 0, 'Asia/Jakarta');
                    $end = Carbon::create($now->year, 6, 30, 23, 59, 59, 'Asia/Jakarta');
                } else {
                    // Semester 2: Jul - Des
                    $start = Carbon::create($now->year, 7, 1, 0, 0, 0, 'Asia/Jakarta');
                    $end = Carbon::create($now->year, 12, 31, 23, 59, 59, 'Asia/Jakarta');
                }
                break;
            default:
                return response()->json(['error' => 'Invalid range'], 400);
        }

        // === Sekolah ===
        $totalSekolah = Kehadiran::whereBetween('tanggal', [$start, $end])->count();
        $hadirSekolah = Kehadiran::whereBetween('tanggal', [$start, $end])
            ->whereRaw('LOWER(kehadiran) IN ("hadir", "terlambat")')
            ->count();
        $persenSekolah = $totalSekolah > 0 ? round(($hadirSekolah / $totalSekolah) * 100, 1) : 0;

        // === Eskul ===
        $totalEskul = KehadiranEskul::whereBetween('tanggal', [$start, $end])->count();
        $hadirEskul = KehadiranEskul::whereBetween('tanggal', [$start, $end])
            ->whereRaw('LOWER(status) = "hadir"')
            ->count();
        $persenEskul = $totalEskul > 0 ? round(($hadirEskul / $totalEskul) * 100, 1) : 0;

        // === Event ===
        $totalEvent = EventKehadiran::whereBetween('attended_at', [$start, $end])->count();
        // EventKehadiran biasanya hanya menyimpan data "hadir"
        $hadirEvent = $totalEvent;
        $persenEvent = $totalEvent > 0 ? round(($hadirEvent / $totalEvent) * 100, 1) : 0;

        return response()->json([
            'range' => $range,
            'sekolah' => $persenSekolah,
            'eskul' => $persenEskul,
            'event' => $persenEvent,
            'periode' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
        ]);
    }
}
