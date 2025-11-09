<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use App\Models\EventKehadiran;
use App\Models\Event;
use App\Models\EventRegistration;
use Carbon\Carbon;

class StatistikController extends Controller
{
    public function __construct()
    {
        // Pastikan Carbon pakai bahasa Indonesia
        Carbon::setLocale('id');
    }
public function eventSummary(Request $request)
{
    $range = $request->query('range', 'daily');
    $dayOffset = (int) $request->query('day', 0);
    $weekOffset = (int) $request->query('week', 0);
    $month = $request->query('month', null);
    $year = $request->query('year', null);

    $now = Carbon::now('Asia/Jakarta');

  
    if ($range === 'latest') {
        $range = 'daily';
        $dayOffset = 0;
    }

    if ($range === 'daily') {
        $start = $now->copy()->addDays($dayOffset)->startOfDay();
        $end = $now->copy()->addDays($dayOffset)->endOfDay();
    } elseif ($range === 'weekly') {
        $start = $now->copy()->startOfWeek(Carbon::MONDAY)->addWeeks($weekOffset)->startOfDay();
        $end = $start->copy()->addDays(6)->endOfDay(); 
    } else { 
        $m = $month ? (int)$month : $now->month;
        $y = $year ? (int)$year : $now->year;
        $start = Carbon::create($y, $m, 1, 0, 0, 0, 'Asia/Jakarta')->startOfDay();
        $end = $start->copy()->endOfMonth()->endOfDay();
    }
    $events = Event::select('id', 'title')->get();
    $registrations = EventRegistration::query()
        ->whereBetween('created_at', [$start, $end])
        ->groupBy('event_id')
        ->selectRaw('event_id, COUNT(*) as total')
        ->pluck('total', 'event_id');

    // ambil jumlah hadir per event dalam rentang waktu (grouped)
    $hadirs = EventKehadiran::query()
        ->whereBetween('attended_at', [$start, $end])
        ->groupBy('event_id')
        ->selectRaw('event_id, COUNT(*) as total')
        ->pluck('total', 'event_id');

    $labels = [];
    $pendaftar = [];
    $hadir = [];

    foreach ($events as $ev) {
        $labels[] = $ev->title;
        $pendaftar[] = isset($registrations[$ev->id]) ? (int)$registrations[$ev->id] : 0;
        $hadir[] = isset($hadirs[$ev->id]) ? (int)$hadirs[$ev->id] : 0;
    }

    return response()->json([
        'range' => $range,
        'start' => $start->toDateTimeString(),
        'end' => $end->toDateTimeString(),
        'labels' => $labels,
        'pendaftar' => $pendaftar,
        'hadir' => $hadir,
    ]);
}

    public function sekolah(Request $request)
{
    $range = $request->get('range', 'daily');
    $today = now();
    $query = \App\Models\Kehadiran::query();

    if ($range === 'daily') {
        $query->whereDate('created_at', $today);
    } elseif ($range === 'weekly') {
        $query->whereBetween('created_at', [$today->copy()->startOfWeek(), $today->copy()->endOfWeek()]);
    } elseif ($range === 'monthly') {
    $month = (int) $request->query('month', now()->month);
    $year = (int) $request->query('year', now()->year);

    $startOfMonth = Carbon::create($year, $month, 1)->startOfDay();
    $endOfMonth = $startOfMonth->copy()->endOfMonth();
    $records = Kehadiran::whereBetween('tanggal', [$startOfMonth, $endOfMonth])->get();

    $weeks = [];
    $weekRanges = [];
    $cursor = $startOfMonth->copy();

    for ($i = 1; $i <= 4; $i++) {
        $start = $cursor->copy();
        $end = $start->copy()->addDays(4);

        if ($end->gt($endOfMonth)) {
            $end = $endOfMonth->copy();
        }

        $weekRanges["Minggu {$i}"] = [
            'start' => $start,
            'end' => $end,
        ];

        $weeks["Minggu {$i}"] = [
            'hadir' => 0,
            'terlambat' => 0,
            'tidak_hadir' => 0,
        ];
        $cursor = $end->copy()->addDays(3);
        if ($cursor->gt($endOfMonth)) break;
    }
    foreach ($records as $r) {
        $tanggal = Carbon::parse($r->tanggal);
        if ($tanggal->isWeekend()) continue;

        foreach ($weekRanges as $week => $range) {
            if ($tanggal->between($range['start'], $range['end'])) {
                $status = strtolower($r->kehadiran);
                if ($status === 'hadir') {
                    $weeks[$week]['hadir']++;
                } elseif ($status === 'terlambat') {
                    $weeks[$week]['terlambat']++;
                } else {
                    $weeks[$week]['tidak_hadir']++;
                }
            }
        }
    }
    $labels = [];
    foreach ($weekRanges as $week => $range) {
        $labels[] = sprintf(
            "%s (%s - %s)",
            $week,
            $range['start']->format('j M'),
            $range['end']->format('j M')
        );
    }

    return response()->json([
        'range' => 'monthly',
        'labels' => $labels,
        'hadir' => array_column($weeks, 'hadir'),
        'terlambat' => array_column($weeks, 'terlambat'),
        'tidak_hadir' => array_column($weeks, 'tidak_hadir'),
    ]);
}
}
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
