<?php

// app/Http/Controllers/Stats/StatsEventController.php
namespace App\Http\Controllers\Stats;

use App\Http\Controllers\Controller;
use App\Models\EventKehadiran;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class StatsEventController extends Controller
{
    public function percentage(Request $request)
{
    $range = $request->query('range', 'monthly');
    $query = EventKehadiran::query();

    if ($range === 'daily') {
        $query->whereDate('attended_at', now());
    } elseif ($range === 'monthly') {
        $query->whereMonth('attended_at', now()->month)
              ->whereYear('attended_at', now()->year);
    } elseif ($range === 'weekly') {
        $query->whereBetween('attended_at', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    $data = $query->select(
            DB::raw('SUM(CASE WHEN attended_at IS NOT NULL THEN 1 ELSE 0 END) as hadir'),
            DB::raw('COUNT(*) as total')
        )
        ->first();

    $percentage = $data->total > 0 ? round(($data->hadir / $data->total) * 100, 2) : 0;

    return response()->json(['percentage' => $percentage]);
}
    public function trend(Request $request)
    {
        $data = EventKehadiran::select(
                DB::raw('MONTH(attended_at) as month'),
                DB::raw('SUM(CASE WHEN attended_at IS NOT NULL THEN 1 ELSE 0 END) as hadir'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('month')
            ->get();

        return response()->json($data);
    }
}
