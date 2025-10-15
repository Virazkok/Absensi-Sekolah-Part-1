<?php

// app/Http/Controllers/Stats/StatsSekolahController.php
namespace App\Http\Controllers\Stats;

use App\Http\Controllers\Controller;
use App\Models\Kehadiran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsSekolahController extends Controller
{
    public function percentage(Request $request)
{
    try {
        $range = $request->query('range', 'monthly');
        $query = Kehadiran::query();

        if ($range === 'daily') {
            $query->whereDate('tanggal', now());
        } elseif ($range === 'monthly') {
            $query->whereMonth('tanggal', now()->month)
                  ->whereYear('tanggal', now()->year);
        } elseif ($range === 'weekly') {
            $query->whereBetween('tanggal', [now()->startOfWeek(), now()->endOfWeek()]);
        }

        $data = $query->select(
                DB::raw('SUM(CASE WHEN kehadiran = "hadir" THEN 1 ELSE 0 END) as hadir'),
                DB::raw('COUNT(*) as total')
            )
            ->first();

        $percentage = $data && $data->total > 0 ? round(($data->hadir / $data->total) * 100, 2) : 0;

        return response()->json(['percentage' => $percentage]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
}


    // Rata-rata bulanan per kelas
    public function average()
    {
        $data = Kehadiran::select(
                DB::raw('MONTH(tanggal) as month'),
                'kelas_id',
                DB::raw('AVG(CASE WHEN kehadiran = "hadir" THEN 1 ELSE 0 END) * 100 as avg_attendance')
            )
            ->groupBy('month', 'kelas_id')
            ->get();

        return response()->json($data);
    }

    // Tren mingguan/bulanan
    public function trend(Request $request)
    {
        $period = $request->query('period', 'monthly'); // weekly or monthly

        if ($period === 'weekly') {
            $data = Kehadiran::select(
                    DB::raw('YEARWEEK(tanggal) as week'),
                    DB::raw('SUM(CASE WHEN kehadiran = "hadir" THEN 1 ELSE 0 END) as hadir'),
                    DB::raw('COUNT(*) as total')
                )
                ->groupBy('week')
                ->get()
                ->map(function ($row) {
                    $row->percentage = $row->total > 0 ? round(($row->hadir / $row->total) * 100, 2) : 0;
                    return $row;
                });
        } else {
            $data = Kehadiran::select(
                    DB::raw('DATE_FORMAT(tanggal, "%Y-%m") as month'),
                    DB::raw('SUM(CASE WHEN kehadiran = "hadir" THEN 1 ELSE 0 END) as hadir'),
                    DB::raw('COUNT(*) as total')
                )
                ->groupBy('month')
                ->get()
                ->map(function ($row) {
                    $row->percentage = $row->total > 0 ? round(($row->hadir / $row->total) * 100, 2) : 0;
                    return $row;
                });
        }

        return response()->json($data);
    }

    // Perbandingan sekolah vs eskul vs event
    public function comparison()
    {
        return response()->json([
            'school' => 80,
            'eskul'  => 70,
            'event'  => 90,
        ]);
    }
}
