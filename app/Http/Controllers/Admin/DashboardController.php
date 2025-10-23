<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Event;
use App\Models\Eskul;
use App\Models\Kehadiran;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // -----------------------------
        // 📊 Data dasar
        // -----------------------------
        $total_users = User::count();
        $total_eskul = Eskul::count();

        // -----------------------------
        // 📅 Event (dengan status prioritas)
        // -----------------------------
        $events = Event::orderByRaw("
            CASE 
                WHEN is_published = 1 AND end_date < ? THEN 1                -- Selesai
                WHEN is_published = 0 AND start_date > ? THEN 2              -- Draft
                WHEN is_published = 1 AND start_date > ? THEN 3              -- Published
                WHEN is_published = 1 AND start_date <= ? AND end_date >= ? THEN 4  -- Aktif
                WHEN is_published = 0 AND end_date < ? THEN 5                -- Tidak Aktif
                ELSE 6
            END
        ", [$today, $today, $today, $today, $today, $today])
        ->orderBy('start_date', 'asc')
        ->take(5)
        ->get()
        ->map(function ($event) use ($today) {
            if ($event->is_published) {
                if ($event->end_date < $today) {
                    $event->status_event = 'Selesai';
                } elseif ($event->start_date <= $today && $event->end_date >= $today) {
                    $event->status_event = 'Aktif';
                } else {
                    $event->status_event = 'Published';
                }
            } else {
                if ($event->start_date > $today) {
                    $event->status_event = 'Draft';
                } else {
                    $event->status_event = 'Tidak Aktif';
                }
            }
            return $event;
        });

        $total_events = Event::count();

        // -----------------------------
        // 📆 Hitung hari kerja dalam bulan ini (tanpa Sabtu & Minggu)
        // -----------------------------
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $period = CarbonPeriod::create($startOfMonth, $endOfMonth);
        $total_hari_kerja = collect($period)->filter(fn($d) => !$d->isWeekend())->count();

        // -----------------------------
        // 📈 Rata-rata kehadiran sekolah (bulan ini)
        // -----------------------------
        $total_hadir = Kehadiran::where('kehadiran', 'hadir')
            ->whereBetween('tanggal', [$startOfMonth, $endOfMonth])
            ->count();

        $total_siswa = User::where('role', 'murid')->count();
        $total_kehadiran_ideal = $total_siswa * $total_hari_kerja;

        $attendance_percentage = $total_kehadiran_ideal > 0
            ? round(($total_hadir / $total_kehadiran_ideal) * 100, 2)
            : 0;

        // -----------------------------
        // 🧮 Rekap kehadiran per siswa (Top 3)
        // -----------------------------
        $rekap = Kehadiran::select('murid_id')
            ->selectRaw('SUM(CASE WHEN kehadiran IN ("Hadir", "terlambat") THEN 1 ELSE 0 END) as hadir')
            ->selectRaw('SUM(CASE WHEN kehadiran = "Tidak Hadir" THEN 1 ELSE 0 END) as tidak_hadir')
            ->groupBy('murid_id')
            ->get()
            ->map(function ($r) use ($total_hari_kerja) {
                $hadir = (int)$r->hadir;
                $percent = $total_hari_kerja > 0 ? round(($hadir / $total_hari_kerja) * 100) : 0;

                $user = User::find($r->murid_id);
                return [
                    'id' => $r->murid_id,
                    'name' => $user?->name ?? 'Unknown',
                    'avatar_url' => $user?->avatar ?? '/images/avatar-placeholder.png',
                    'kelas' => is_object($user?->kelas) ? ($user->kelas->name ?? '-') : ($user?->kelas ?? '-'),
                    'total' => "{$hadir}/{$total_hari_kerja}",
                    'persentase' => $percent,
                ];
            })
            ->sortByDesc(fn($x) => $x['persentase'])
            ->values()
            ->take(3);

        // -----------------------------
        // 📋 Data tambahan untuk dashboard
        // -----------------------------
        $users = User::latest()->take(5)->get();
        $eskuls = Eskul::withCount(['siswa as anggota_count'])->latest()->take(5)->get();

        // -----------------------------
        // 📤 Kirim ke Inertia
        // -----------------------------
        return inertia('Admin/AdminDashboard', [
            'total_users' => $total_users,
            'total_events' => $total_events,
            'total_eskul' => $total_eskul,
            'attendance_percentage' => [
                'school' => $attendance_percentage . '%',
                'event' => '0%',
                'eskul' => '0%',
            ],
            'rekap' => $rekap,
            'users' => $users,
            'events' => $events,
            'eskuls' => $eskuls,
        ]);
    }

public function index1() {
    return inertia('dashboard');
}

}

