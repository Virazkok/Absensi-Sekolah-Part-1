<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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

        // Tentukan rentang waktu
       switch ($range) {
    case 'mingguan':
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
        } else {
            // fallback jika tidak dikirim dari frontend
            $start = $now->copy()->startOfWeek(Carbon::MONDAY);
            $end = $now->copy()->endOfWeek(Carbon::FRIDAY);
        }
        break;

    case 'semester':
        if ($semester === 1) {
            $start = Carbon::create($tahun, 1, 1)->startOfDay();
            $end = Carbon::create($tahun, 6, 30)->endOfDay();
        } else {
            $start = Carbon::create($tahun, 7, 1)->startOfDay();
            $end = Carbon::create($tahun, 12, 31)->endOfDay();
        }
        break;

    case 'bulanan':
    default:
        $start = Carbon::create($tahun, $bulan, 1)->startOfMonth();
        $end = Carbon::create($tahun, $bulan, 1)->endOfMonth();
        break;
}

        // === Ambil data kehadiran sekolah ===
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
                    'kejuruan' => $murid->kelas->kejuruan ?? '-',
                    'hadir_sekolah' => $hadir,
                ];
            });

        // === Ambil data kehadiran eskul ===
        $kehadiranEskul = KehadiranEskul::with(['user', 'absensi.eskul'])
            ->whereBetween('tanggal', [$start, $end])
            ->get()
            ->groupBy('user_id')
            ->map(function ($items) {
                $user = $items->first()->user;
                $hadir = $items->where('status', 'Hadir')->count();
                return [
                    'murid_id' => $user->id ?? null,
                    'nama' => $user->name ?? '-',
                    'hadir_ekskul' => $hadir,
                ];
            });

        // === Ambil data event ===
        $kehadiranEvent = EventKehadiran::with(['murid'])
            ->whereBetween('attended_at', [$start, $end])
            ->get()
            ->groupBy('murid_id')
            ->map(function ($items) {
                $murid = $items->first()->murid;
                $hadir = $items->count();
                return [
                    'murid_id' => $murid->id ?? null,
                    'nama' => $murid->nama ?? '-',
                    'hadir_event' => $hadir,
                ];
            });

        // === Gabungkan semua data ===
        $muridIds = collect($kehadiranSekolah->keys())
            ->merge($kehadiranEskul->keys())
            ->merge($kehadiranEvent->keys())
            ->unique();

        $report = $muridIds->map(function ($id, $idx) use ($kehadiranSekolah, $kehadiranEskul, $kehadiranEvent) {
            $sekolah = $kehadiranSekolah->get($id, []);
            $eskul = $kehadiranEskul->get($id, []);
            $event = $kehadiranEvent->get($id, []);

            $nama = $sekolah['nama'] ?? $eskul['nama'] ?? $event['nama'] ?? '-';
            $kelas = $sekolah['kelas'] ?? '-';
            $kejuruan = $sekolah['kejuruan'] ?? '-';
            $hadirSekolah = $sekolah['hadir_sekolah'] ?? 0;
            $hadirEskul = $eskul['hadir_ekskul'] ?? 0;
            $hadirEvent = $event['hadir_event'] ?? 0;
            $total = $hadirSekolah + $hadirEskul + $hadirEvent;

            return [
                'no' => $idx + 1,
                'murid_id' => $id,
                'nama' => $nama,
                'kelas' => $kelas,
                'kejuruan' => $kejuruan,
                'hadir_sekolah' => $hadirSekolah,
                'hadir_ekskul' => $hadirEskul,
                'hadir_event' => $hadirEvent,
                'total' => $total,
                'keterangan' => $total > 0 ? 'Baik' : 'Belum Hadir',
            ];
        })->values();

        return response()->json([
            'range' => $range,
            'periode' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'data' => $report,
        ]);
    }
}
