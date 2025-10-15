<?php

// app/Http/Controllers/Stats/StatsEskulController.php
namespace App\Http\Controllers\Stats;

use App\Http\Controllers\Controller;
use App\Models\KehadiranEskul;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class StatsEskulController extends Controller
{
    public function percentage(Request $request)
{
    $range = $request->query('range', 'monthly');
    $query = KehadiranEskul::query();

    if ($range === 'daily') {
        $query->whereDate('tanggal', now());
    } elseif ($range === 'monthly') {
        $query->whereMonth('tanggal', now()->month)
              ->whereYear('tanggal', now()->year);
    } elseif ($range === 'weekly') {
        $query->whereBetween('tanggal', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    $data = $query->select(
            DB::raw('SUM(CASE WHEN status = "hadir" THEN 1 ELSE 0 END) as hadir'),
            DB::raw('COUNT(*) as total')
        )
        ->first();

    $percentage = $data->total > 0 ? round(($data->hadir / $data->total) * 100, 2) : 0;

    return response()->json(['percentage' => $percentage]);
}




    public function trend(Request $request)
    {
        $data = KehadiranEskul::select(
                DB::raw('MONTH(tanggal) as month'),
                DB::raw('SUM(CASE WHEN status = "hadir" THEN 1 ELSE 0 END) as hadir'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('month')
            ->get();

        return response()->json($data);
    }
}
