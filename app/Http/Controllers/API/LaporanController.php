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
use \App\Exports\ArrayExport;


class LaporanController extends Controller
{
        public function sekolah(Request $request)
        {
            $range = $request->query('range', 'monthly');
            $kelasId = $request->query('kelas_id', null);
            $start = $request->query('start');
            $end = $request->query('end');

            $query = Kehadiran::with('murid.kelas');

            if ($kelasId) {
                $query->where('kelas_id', $kelasId);    
            }

            if ($range === "custom" && $start && $end) {
                $query->whereBetween('tanggal', [$start, $end]);
            } elseif ($range === "daily") {
                $query->whereDate('tanggal', Carbon::today());
            } elseif ($range === "weekly") {
                $query->whereBetween('tanggal', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
            } else {
                $query->whereMonth('tanggal', Carbon::now()->month)->whereYear('tanggal', Carbon::now()->year);
            }

            $data = $query->get()->groupBy('murid_id')->map(function ($items) {
                $murid = $items->first()->murid;
                $hadir = $items->whereIn('kehadiran', ['Hadir', 'Terlambat'])->count();
                $terlambat = $items->where('kehadiran', 'Terlambat')->count();
                $total = $items->count();
                return [
                    'nama' => $murid->nama,
                    'keterangan' => $murid->kelas->name ?? "-",
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
        $start = $request->query('start');
        $end = $request->query('end');

        $query = KehadiranEskul::with('siswa', 'absensi.eskul');

        if ($eskulId) {
            $query->whereHas('absensi', fn($q) => $q->where('eskul_id', $eskulId));
        }

        if ($range === "custom" && $start && $end) {
            $query->whereBetween('tanggal', [$start, $end]);
        } elseif ($range === "daily") {
            $query->whereDate('tanggal', Carbon::today());
        } elseif ($range === "weekly") {
            $query->whereBetween('tanggal', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } else {
            $query->whereMonth('tanggal', Carbon::now()->month)->whereYear('tanggal', Carbon::now()->year);
        }

        $data = KehadiranEskul::with(['user', 'absensi.eskul'])
    ->when($eskulId, fn($q) => $q->whereHas('absensi', fn($qq) => $qq->where('eskul_id', $eskulId)))
    ->get()
    ->map(fn($item) => [
        'nama'        => $item->user->name,
        'keterangan'  => $item->absensi->eskul->nama ?? '-',
        'hadir'       => $item->status === 'Hadir' ? 1 : 0,
        'tidak_hadir' => $item->status === 'Tidak Hadir' ? 1 : 0,
        'terlambat'   => $item->status === 'Terlambat' ? 1 : 0,
    ]);

        return response()->json($data);
    }

    public function event(Request $request)
    {
        $range = $request->query('range', 'monthly');
        $eventId = $request->query('event_id', null);
        $start = $request->query('start');
        $end = $request->query('end');

        $query = EventKehadiran::with('murid', 'event');

        if ($eventId) {
            $query->where('event_id', $eventId);
        }

        if ($range === "custom" && $start && $end) {
            $query->whereBetween('attended_at', [$start, $end]);
        } elseif ($range === "daily") {
            $query->whereDate('attended_at', Carbon::today());
        } elseif ($range === "weekly") {
            $query->whereBetween('attended_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } else {
            $query->whereMonth('attended_at', Carbon::now()->month)->whereYear('attended_at', Carbon::now()->year);
        }

        $data = $query->get()->groupBy('murid_id')->map(function ($items) {
            $murid = $items->first()->murid;
            $event = $items->first()->event;
            $hadir = $items->count();
            return [
                'nama' => $murid->nama,
                'keterangan' => $event->nama ?? "-",
                'hadir' => $hadir,
                'tidak_hadir' => 0,
                'terlambat' => 0,
            ];
        })->values();

        return response()->json($data);
    }

    public function export(Request $request, $type)
    {
        $format = $request->query('format', 'pdf');
        if ($type === "sekolah") $data = $this->sekolah($request)->getData(true);
        elseif ($type === "eskul") $data = $this->eskul($request)->getData(true);
        else $data = $this->event($request)->getData(true);

        if ($format === "excel") {
            return Excel::download(new ArrayExport($data), "laporan_$type.xlsx");
        }

        $pdf = PDF::loadView('laporan.template', ['data' => $data, 'type' => $type]);
        return $pdf->download("laporan_$type.pdf");
    }       
}
