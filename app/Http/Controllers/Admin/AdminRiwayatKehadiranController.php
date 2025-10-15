<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Murid;
use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use Carbon\Carbon;

class AdminRiwayatKehadiranController extends Controller
{
    public function index(Request $request)
    {
        $filter   = $request->query('filter', 'bulan');
        $bulan    = $request->query('bulan', Carbon::now()->month);
        $tahun    = $request->query('tahun', Carbon::now()->year);
        $semester = $request->query('semester', 1);
        $type     = $request->query('type', 'sekolah');
        $eskulId  = $request->query('eskul_id');

        // Tentukan rentang tanggal
        if ($filter === 'bulan') {
            $startDate = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth();
            $endDate   = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth();
        } else {
            if ($semester == 1) {
                $startDate = Carbon::createFromDate($tahun, 7, 1)->startOfMonth();
                $endDate   = Carbon::createFromDate($tahun, 12, 31)->endOfMonth();
            } else {
                $startDate = Carbon::createFromDate($tahun, 1, 1)->startOfMonth();
                $endDate   = Carbon::createFromDate($tahun, 6, 30)->endOfMonth();
            }
        }

        // Hitung jumlah hari aktif (Senin–Jumat)
        $totalHariAktif = 0;
        $current = $startDate->copy();
        while ($current->lte($endDate)) {
            if (!in_array($current->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY])) {
                $totalHariAktif++;
            }
            $current->addDay();
        }

        // Ambil daftar murid
        if ($type === 'eskul' && $eskulId) {
            $muridList = Murid::with('kelas')
                ->whereHas('user', function ($q) use ($eskulId) {
                    $q->where('eskul_siswa1_id', $eskulId)
                      ->orWhere('eskul_siswa2_id', $eskulId)
                      ->orWhere('eskul_siswa3_id', $eskulId);
                })
                ->get();
        } else {
            $muridList = Murid::with('kelas')->get();
        }

        // Mapping data rekap
        $rekap = $muridList->map(function ($murid) use ($startDate, $endDate, $type, $eskulId, $totalHariAktif) {
            if ($type === 'eskul') {
                $kehadiran = KehadiranEskul::where('user_id', $murid->user_id)
                    ->whereHas('absensi', fn($q) => $q->where('eskul_id', $eskulId))
                    ->whereBetween('tanggal', [$startDate, $endDate])
                    ->get();

                $hadir = $kehadiran->whereIn('status', ['Hadir', 'Terlambat'])->count();
            } else {
                $kehadiran = Kehadiran::where('murid_id', $murid->id)
                    ->whereBetween('tanggal', [$startDate, $endDate])
                    ->get();

                $hadir = $kehadiran->whereIn('kehadiran', ['Hadir', 'Terlambat'])->count();
            }

            $persentase = $totalHariAktif > 0 ? round(($hadir / $totalHariAktif) * 100, 2) : 0;

            return [
                'nama'       => $murid->nama ?? '-',
                'kelas'      => $murid->kelas->name ?? '-',
                'keahlian'   => $murid->keahlian ?? '-',
                'total'      => "{$hadir}/{$totalHariAktif}",
                'persentase' => $persentase . "%",
            ];
        });

        return response()->json([
            'data'      => $rekap,
            'filter'    => $filter,
            'bulan'     => $bulan,
            'tahun'     => $tahun,
            'semester'  => $semester,
            'type'      => $type,
            'eskul_id'  => $eskulId,
        ]);
    }
}
