<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use App\Models\EventKehadiran;
use Carbon\Carbon;

class StatistikController extends Controller
{
    public function __construct()
    {
        // Pastikan Carbon pakai bahasa Indonesia
        Carbon::setLocale('id');
    }

    /**
     * Statistik Sekolah
     */
    public function sekolah(Request $request)
    {
        $range = $request->query('range', 'daily');
        $dayOffset = (int) $request->query('day', 0);
        $weekOffset = (int) $request->query('week', 0);
        $month = $request->query('month', null);
        $year = $request->query('year', null);

        $now = Carbon::now('Asia/Jakarta');

        // DAILY
        if ($range === 'daily') {
            $date = $now->copy()->addDays($dayOffset)->toDateString();
            $total = Kehadiran::whereDate('tanggal', $date)->count();
            $hadir = Kehadiran::whereDate('tanggal', $date)
                ->whereRaw('LOWER(kehadiran) IN ("hadir","terlambat")')
                ->count();

            return response()->json([
                'range' => 'daily',
                'labels' => [Carbon::parse($date)->translatedFormat('l, d M Y')],
                'hadir' => [$hadir],
                'tidak_hadir' => [max(0, $total - $hadir)],
            ]);
        }

        // WEEKLY
        if ($range === 'weekly') {
            $start = $now->copy()->startOfWeek(Carbon::MONDAY)->addWeeks($weekOffset);
            $labels = []; $hadir = []; $tidak_hadir = [];

            for ($i = 0; $i < 5; $i++) {
                $d = $start->copy()->addDays($i);
                $labels[] = $d->translatedFormat('l');
                $total = Kehadiran::whereDate('tanggal', $d->toDateString())->count();
                $h = Kehadiran::whereDate('tanggal', $d->toDateString())
                    ->whereRaw('LOWER(kehadiran) IN ("hadir","terlambat")')
                    ->count();

                $hadir[] = $h;
                $tidak_hadir[] = max(0, $total - $h);
            }

            return response()->json([
                'range' => 'weekly',
                'labels' => $labels,
                'hadir' => $hadir,
                'tidak_hadir' => $tidak_hadir,
            ]);
        }

        // MONTHLY
        $month = $month ? (int)$month : $now->month;
        $year = $year ? (int)$year : $now->year;
        $start = Carbon::create($year, $month, 1, 0, 0, 0, 'Asia/Jakarta');
        $end = $start->copy()->endOfMonth();
        $labels = []; $hadir = []; $tidak_hadir = [];

        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $labels[] = $d->translatedFormat('j M'); // 1 Sep, 2 Sep
            $total = Kehadiran::whereDate('tanggal', $d->toDateString())->count();
            $h = Kehadiran::whereDate('tanggal', $d->toDateString())
                ->whereRaw('LOWER(kehadiran) IN ("hadir","terlambat")')
                ->count();
            $hadir[] = $h;
            $tidak_hadir[] = max(0, $total - $h);
        }

        return response()->json([
            'range' => 'monthly',
            'labels' => $labels,
            'hadir' => $hadir,
            'tidak_hadir' => $tidak_hadir,
        ]);
    }

    /**
     * Statistik Eskul
     */
    public function eskul(Request $request)
    {
        $range = $request->query('range', 'daily');
        $eskulId = $request->query('eskul_id', null);
        $dayOffset = (int) $request->query('day', 0);
        $weekOffset = (int) $request->query('week', 0);
        $month = $request->query('month', null);
        $year = $request->query('year', null);

        $now = Carbon::now('Asia/Jakarta');
        $baseQuery = KehadiranEskul::query();

        if ($eskulId) {
            $baseQuery->whereHas('absensi', function ($q) use ($eskulId) {
                $q->where('eskul_id', $eskulId);
            });
        }

        // DAILY
        if ($range === 'daily') {
            $date = $now->copy()->addDays($dayOffset)->toDateString();
            $total = (clone $baseQuery)->whereDate('tanggal', $date)->count();
            $hadir = (clone $baseQuery)->whereDate('tanggal', $date)
                ->whereRaw('LOWER(status) = "hadir"')->count();

            return response()->json([
                'range' => 'daily',
                'labels' => [Carbon::parse($date)->translatedFormat('l, d M Y')],
                'hadir' => [$hadir],
                'tidak_hadir' => [max(0, $total - $hadir)],
            ]);
        }

        // WEEKLY
        if ($range === 'weekly') {
            $start = $now->copy()->startOfWeek(Carbon::MONDAY)->addWeeks($weekOffset);
            $labels = []; $hadir = []; $tidak_hadir = [];

            for ($i = 0; $i < 5; $i++) {
                $d = $start->copy()->addDays($i);
                $labels[] = $d->translatedFormat('l');
                $total = (clone $baseQuery)->whereDate('tanggal', $d->toDateString())->count();
                $h = (clone $baseQuery)->whereDate('tanggal', $d->toDateString())
                    ->whereRaw('LOWER(status) = "hadir"')->count();

                $hadir[] = $h;
                $tidak_hadir[] = max(0, $total - $h);
            }

            return response()->json([
                'range' => 'weekly',
                'labels' => $labels,
                'hadir' => $hadir,
                'tidak_hadir' => $tidak_hadir,
            ]);
        }

        // MONTHLY
        $month = $month ? (int)$month : $now->month;
        $year = $year ? (int)$year : $now->year;
        $start = Carbon::create($year, $month, 1, 0, 0, 0, 'Asia/Jakarta');
        $end = $start->copy()->endOfMonth();
        $labels = []; $hadir = []; $tidak_hadir = [];

        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $labels[] = $d->translatedFormat('j M');
            $total = (clone $baseQuery)->whereDate('tanggal', $d->toDateString())->count();
            $h = (clone $baseQuery)->whereDate('tanggal', $d->toDateString())
                ->whereRaw('LOWER(status) = "hadir"')->count();
            $hadir[] = $h;
            $tidak_hadir[] = max(0, $total - $h);
        }

        return response()->json([
            'range' => 'monthly',
            'labels' => $labels,
            'hadir' => $hadir,
            'tidak_hadir' => $tidak_hadir,
        ]);
    }

    /**
     * Statistik Event
     */
    public function event(Request $request)
    {
        $range = $request->query('range', 'monthly');
        $dayOffset = (int) $request->query('day', 0);
        $weekOffset = (int) $request->query('week', 0);
        $month = $request->query('month', null);
        $year = $request->query('year', null);

        $now = Carbon::now('Asia/Jakarta');

        // DAILY
        if ($range === 'daily') {
            $date = $now->copy()->addDays($dayOffset)->toDateString();
            $hadir = EventKehadiran::whereDate('attended_at', $date)->count();

            return response()->json([
                'range' => 'daily',
                'labels' => [Carbon::parse($date)->translatedFormat('l, d M Y')],
                'hadir' => [$hadir],
                'tidak_hadir' => [0],
            ]);
        }

        // WEEKLY
        if ($range === 'weekly') {
            $start = $now->copy()->startOfWeek(Carbon::MONDAY)->addWeeks($weekOffset);
            $labels = []; $hadir = []; $tidak_hadir = [];

            for ($i = 0; $i < 5; $i++) {
                $d = $start->copy()->addDays($i);
                $labels[] = $d->translatedFormat('l');
                $h = EventKehadiran::whereDate('attended_at', $d->toDateString())->count();
                $hadir[] = $h;
                $tidak_hadir[] = 0;
            }

            return response()->json([
                'range' => 'weekly',
                'labels' => $labels,
                'hadir' => $hadir,
                'tidak_hadir' => $tidak_hadir,
            ]);
        }

        // MONTHLY
        $month = $month ? (int)$month : $now->month;
        $year = $year ? (int)$year : $now->year;
        $start = Carbon::create($year, $month, 1, 0, 0, 0, 'Asia/Jakarta');
        $end = $start->copy()->endOfMonth();
        $labels = []; $hadir = []; $tidak_hadir = [];

        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $labels[] = $d->translatedFormat('j M');
            $h = EventKehadiran::whereDate('attended_at', $d->toDateString())->count();
            $hadir[] = $h;
            $tidak_hadir[] = 0;
        }

        return response()->json([
            'range' => 'monthly',
            'labels' => $labels,
            'hadir' => $hadir,
            'tidak_hadir' => $tidak_hadir,
        ]);
    }
}
