<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Murid;
use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use App\Models\EventKehadiran;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ArrayExport;

class LaporanController extends Controller
{
    public function sekolah(Request $request)
    {
        $range = $request->query('range', 'bulanan');
        $kelasId = $request->query('kelas_id', null);
        $bulan = (int) $request->query('bulan', Carbon::now()->month);
        $tahun = (int) $request->query('tahun', Carbon::now()->year);
        $semester = (int) $request->query('semester', 1);

        $now = Carbon::now('Asia/Jakarta');

        
        switch ($range) {
            case 'mingguan':
                $startDate = $request->query('start_date');
                $endDate = $request->query('end_date');
                if ($startDate && $endDate) {
                    $start = Carbon::parse($startDate)->startOfDay();
                    $end = Carbon::parse($endDate)->endOfDay();
                } else {
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
            
            $start = Carbon::create($tahun, 7, 1)->startOfDay();
            $end = Carbon::create($tahun, 12, 31)->endOfDay();
        } else {
           
            $start = Carbon::create($tahun + 1, 1, 1)->startOfDay();
            $end = Carbon::create($tahun + 1, 6, 30)->endOfDay();
        }
    }
    break;


            default: 
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

        
        $muridQuery = Murid::with('kelas');
        if ($kelasId) $muridQuery->where('kelas_id', $kelasId);
        $murids = $muridQuery->get();

        // === Query Kehadiran Sekolah ===
        $kehadiran = Kehadiran::with('murid.kelas')
            ->whereBetween('tanggal', [$start, $end])
            ->get()
            ->groupBy('murid_id');

        $data = $murids->map(function ($murid, $idx) use ($kehadiran) {
            $items = $kehadiran->get($murid->id, collect());
            $hadir = $items->whereIn('kehadiran', ['Hadir', 'Terlambat'])->count();
            $total = $items->count();

            return [
                'no' => $idx + 1,
                'nama' => $murid->nama ?? '-',
                'kelas' => $murid->kelas->name ?? '-',
                'keahlian' => $murid->kelas->kejuruan ?? $murid->keahlian ?? '-',
                'hadir_sekolah' => $hadir,
                'hadir_ekskul' => 0,
                'hadir_event' => 0,
                'total' => $hadir,
                'keterangan' => $total > 0 ? 'Baik' : 'Belum Hadir',
            ];
        });

        return response()->json([
            'range' => $range,
            'periode' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'data' => $data->values()->toArray(),
        ]);
    }

    public function eskul(Request $request)
    {
        $range = $request->query('range', 'bulanan');
        $eskulId = $request->query('eskul_id', null);
        $bulan = (int) $request->query('bulan', Carbon::now()->month);
        $tahun = (int) $request->query('tahun', Carbon::now()->year);
        $semester = (int) $request->query('semester', 1);

        $now = Carbon::now('Asia/Jakarta');

        switch ($range) {
            case 'mingguan':
                $startDate = $request->query('start_date');
                $endDate = $request->query('end_date');
                if ($startDate && $endDate) {
                    $start = Carbon::parse($startDate)->startOfDay();
                    $end = Carbon::parse($endDate)->endOfDay();
                } else {
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
            // Semester 1: Juli–Desember tahun ini
            $start = Carbon::create($tahun, 7, 1)->startOfDay();
            $end = Carbon::create($tahun, 12, 31)->endOfDay();
        } else {
            // Semester 2: Januari–Juni tahun berikutnya
            $start = Carbon::create($tahun + 1, 1, 1)->startOfDay();
            $end = Carbon::create($tahun + 1, 6, 30)->endOfDay();
        }
    }
    break;

            default:
                $start = Carbon::create($tahun, $bulan, 1)->startOfMonth();
                $end = Carbon::create($tahun, $bulan, 1)->endOfMonth();
                break;
        }

        $query = KehadiranEskul::with(['user.murid.kelas', 'absensi.eskul'])
            ->whereBetween('tanggal', [$start, $end]);

        if ($eskulId) $query->whereHas('absensi', fn($q) => $q->where('eskul_id', $eskulId));

        $data = $query->get()->groupBy('user_id')->map(function ($items, $idx) {
            $user = $items->first()->user;
            $murid = $user->murid;
            $hadir = $items->where('status', 'Hadir')->count();

            return [
                'no' => $idx + 1,
                'nama' => $user->name ?? '-',
                'kelas' => $murid->kelas->name ?? '-',
                'keahlian' => $murid->kelas->kejuruan ?? $murid->keahlian ?? '-',
                'hadir_sekolah' => 0,
                'hadir_ekskul' => $hadir,
                'hadir_event' => 0,
                'total' => $hadir,
                'keterangan' => $hadir > 0 ? 'Baik' : 'Belum Hadir',
            ];
        })->values();

        return response()->json([
            'range' => $range,
            'periode' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'data' => $data->toArray(),
        ]);
    }

    public function event(Request $request)
    {
        $range = $request->query('range', 'bulanan');
        $eventId = $request->query('event_id', null);
        $bulan = (int) $request->query('bulan', Carbon::now()->month);
        $tahun = (int) $request->query('tahun', Carbon::now()->year);
        $semester = (int) $request->query('semester', 1);

        $now = Carbon::now('Asia/Jakarta');

        switch ($range) {
            case 'mingguan':
                $startDate = $request->query('start_date');
                $endDate = $request->query('end_date');
                if ($startDate && $endDate) {
                    $start = Carbon::parse($startDate)->startOfDay();
                    $end = Carbon::parse($endDate)->endOfDay();
                } else {
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
            // Semester 1: Juli–Desember tahun ini
            $start = Carbon::create($tahun, 7, 1)->startOfDay();
            $end = Carbon::create($tahun, 12, 31)->endOfDay();
        } else {
            // Semester 2: Januari–Juni tahun berikutnya
            $start = Carbon::create($tahun + 1, 1, 1)->startOfDay();
            $end = Carbon::create($tahun + 1, 6, 30)->endOfDay();
        }
    }
    break;

            default:
                $start = Carbon::create($tahun, $bulan, 1)->startOfMonth();
                $end = Carbon::create($tahun, $bulan, 1)->endOfMonth();
                break;
        }

        $query = EventKehadiran::with(['murid.kelas', 'event'])
            ->whereBetween('attended_at', [$start, $end]);
        if ($eventId) $query->where('event_id', $eventId);

        $data = $query->get()->groupBy('murid_id')->map(function ($items, $idx) {
            $murid = $items->first()->murid;
            $hadir = $items->count();

            return [
                'no' => $idx + 1,
                'nama' => $murid->nama ?? '-',
                'kelas' => $murid->kelas->name ?? '-',
                'keahlian' => $murid->kelas->kejuruan ?? $murid->keahlian ?? '-',
                'hadir_sekolah' => 0,
                'hadir_ekskul' => 0,
                'hadir_event' => $hadir,
                'total' => $hadir,
                'keterangan' => $hadir > 0 ? 'Baik' : 'Belum Hadir',
            ];
        })->values();

        return response()->json([
            'range' => $range,
            'periode' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'data' => $data->toArray(),
        ]);
    }

    public function export(Request $request, $type)
    {
        $format = $request->query('format', 'pdf');

        if ($type === "sekolah") {
            $response = $this->sekolah($request);
        } elseif ($type === "eskul") {
            $response = $this->eskul($request);
        } else {
            $response = $this->event($request);
        }

        $data = $response instanceof \Illuminate\Http\JsonResponse ? $response->getData(true)['data'] : [];

        if ($format === "excel") {
            return Excel::download(new ArrayExport($data), "laporan_{$type}.xlsx");
        }

        $pdf = Pdf::loadView('laporan.template', [
            'data' => $data,
            'type' => $type
        ]);

        return $pdf->download("laporan_{$type}.pdf");
    }
}
