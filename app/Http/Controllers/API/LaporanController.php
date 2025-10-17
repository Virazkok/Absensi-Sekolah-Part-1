<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
        $range = $request->query('range', 'monthly');
        $kelasId = $request->query('kelas_id', null);
        $bulan = (int) $request->query('bulan', Carbon::now()->month);
        $tahun = (int) $request->query('tahun', Carbon::now()->year);
        $semester = (int) $request->query('semester', 1);

        $query = Kehadiran::with('murid.kelas');

        if ($kelasId) {
            $query->where('kelas_id', $kelasId);
        }

        if ($range === "semester") {
            // semester 1 => Jan-Jun, semester 2 => Jul-Dec
            if ($semester === 1) {
                $start = Carbon::create($tahun, 1, 1)->startOfDay();
                $end = Carbon::create($tahun, 6, 30)->endOfDay();
            } else {
                $start = Carbon::create($tahun, 7, 1)->startOfDay();
                $end = Carbon::create($tahun, 12, 31)->endOfDay();
            }
            $query->whereBetween('tanggal', [$start, $end]);
        } elseif ($range === "monthly" || $range === "rekap") {
            // monthly (default). For 'rekap' we treat same as monthly here; frontend can choose range accordingly.
            $query->whereMonth('tanggal', $bulan)->whereYear('tanggal', $tahun);
        } elseif ($range === "daily") {
            $query->whereDate('tanggal', Carbon::today());
        } elseif ($range === "weekly") {
            $query->whereBetween('tanggal', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($range === "custom") {
            $start = $request->query('start');
            $end = $request->query('end');
            if ($start && $end) {
                $query->whereBetween('tanggal', [$start, $end]);
            }
        }

        $data = $query->get()->groupBy('murid_id')->map(function ($items) {
            $murid = $items->first()->murid;
            $hadir = $items->whereIn('kehadiran', ['Hadir', 'Terlambat'])->count();
            $terlambat = $items->where('kehadiran', 'Terlambat')->count();
            $total = $items->count();
            return [
                'nama' => $murid->nama ?? $items->first()->nama ?? '-',
                'keterangan' => $murid->kelas->name ?? '-',
                'hadir' => $hadir,
                'tidak_hadir' => $total - $hadir,
                'terlambat' => $terlambat,
            ];
        })->values();

        return response()->json($data);
    }

    public function eskul(Request $request)
    {
        $range = $request->query('range', 'monthly');
        $eskulId = $request->query('eskul_id', null);
        $bulan = (int) $request->query('bulan', Carbon::now()->month);
        $tahun = (int) $request->query('tahun', Carbon::now()->year);
        $semester = (int) $request->query('semester', 1);

        $query = KehadiranEskul::with(['user', 'absensi.eskul']);

        if ($eskulId) {
            $query->whereHas('absensi', fn($q) => $q->where('eskul_id', $eskulId));
        }

        if ($range === "semester") {
            if ($semester === 1) {
                $start = Carbon::create($tahun, 1, 1)->startOfDay();
                $end = Carbon::create($tahun, 6, 30)->endOfDay();
            } else {
                $start = Carbon::create($tahun, 7, 1)->startOfDay();
                $end = Carbon::create($tahun, 12, 31)->endOfDay();
            }
            $query->whereBetween('tanggal', [$start, $end]);
        } elseif ($range === "monthly" || $range === "rekap") {
            $query->whereMonth('tanggal', $bulan)->whereYear('tanggal', $tahun);
        } elseif ($range === "daily") {
            $query->whereDate('tanggal', Carbon::today());
        } elseif ($range === "weekly") {
            $query->whereBetween('tanggal', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($range === "custom") {
            $start = $request->query('start');
            $end = $request->query('end');
            if ($start && $end) {
                $query->whereBetween('tanggal', [$start, $end]);
            }
        }

        $items = $query->get();

        // map to expected shape
        $data = $items->map(function ($item) {
            return [
                'nama' => $item->user->name ?? '-',
                'keterangan' => $item->absensi->eskul->nama ?? '-',
                'hadir' => $item->status === 'Hadir' ? 1 : 0,
                'tidak_hadir' => $item->status === 'Tidak Hadir' ? 1 : 0,
                'terlambat' => $item->status === 'Terlambat' ? 1 : 0,
            ];
        });

        return response()->json($data);
    }

    public function event(Request $request)
    {
        $range = $request->query('range', 'monthly');
        $eventId = $request->query('event_id', null);
        $bulan = (int) $request->query('bulan', Carbon::now()->month);
        $tahun = (int) $request->query('tahun', Carbon::now()->year);
        $semester = (int) $request->query('semester', 1);

        $query = EventKehadiran::with(['murid', 'event']);

        if ($eventId) {
            $query->where('event_id', $eventId);
        }

        if ($range === "semester") {
            if ($semester === 1) {
                $start = Carbon::create($tahun, 1, 1)->startOfDay();
                $end = Carbon::create($tahun, 6, 30)->endOfDay();
            } else {
                $start = Carbon::create($tahun, 7, 1)->startOfDay();
                $end = Carbon::create($tahun, 12, 31)->endOfDay();
            }
            $query->whereBetween('attended_at', [$start, $end]);
        } elseif ($range === "monthly" || $range === "rekap") {
            $query->whereMonth('attended_at', $bulan)->whereYear('attended_at', $tahun);
        } elseif ($range === "daily") {
            $query->whereDate('attended_at', Carbon::today());
        } elseif ($range === "weekly") {
            $query->whereBetween('attended_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($range === "custom") {
            $start = $request->query('start');
            $end = $request->query('end');
            if ($start && $end) {
                $query->whereBetween('attended_at', [$start, $end]);
            }
        }

        $data = $query->get()->groupBy('murid_id')->map(function ($items) {
            $murid = $items->first()->murid;
            $event = $items->first()->event;
            return [
                'nama' => $murid->nama ?? '-',
                'keterangan' => $event->nama ?? '-',
                'hadir' => $items->count(),
                'tidak_hadir' => 0,
                'terlambat' => 0,
            ];
        })->values();

        return response()->json($data);
    }

    /**
     * export route:
     * GET /api/laporan/{type}/export?format=pdf|excel&range=...&bulan=...&tahun=...
     */
    public function export(Request $request, $type)
    {
        $format = $request->query('format', 'pdf');

        // call underlying generator method and get data array
        if ($type === "sekolah") {
            $response = $this->sekolah($request);
            $data = $response instanceof \Illuminate\Http\JsonResponse ? $response->getData(true) : [];
        } elseif ($type === "eskul") {
            $response = $this->eskul($request);
            $data = $response instanceof \Illuminate\Http\JsonResponse ? $response->getData(true) : [];
        } else {
            $response = $this->event($request);
            $data = $response instanceof \Illuminate\Http\JsonResponse ? $response->getData(true) : [];
        }

        // kalau format excel -> gunakan ArrayExport
        if ($format === "excel") {
            return Excel::download(new ArrayExport($data), "laporan_{$type}.xlsx");
        }

        // default PDF
        // pastikan kamu punya view 'laporan.template' atau ubah sesuai view yang ada
        $pdf = Pdf::loadView('laporan.template', ['data' => $data, 'type' => $type]);
        return $pdf->download("laporan_{$type}.pdf");
    }
}
