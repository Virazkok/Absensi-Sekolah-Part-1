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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // 📊 Data dasar
        $total_users = User::count();
        $total_eskul = Eskul::count();
        $total_events = Event::count();

        // 📅 Event (status prioritas)
        $events = Event::orderByRaw("
            CASE 
                WHEN is_published = 1 AND end_date < ? THEN 1
                WHEN is_published = 0 AND start_date > ? THEN 2
                WHEN is_published = 1 AND start_date > ? THEN 3
                WHEN is_published = 1 AND start_date <= ? AND end_date >= ? THEN 4
                WHEN is_published = 0 AND end_date < ? THEN 5
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
                    $event->status_event = $event->start_date > $today ? 'Draft' : 'Tidak Aktif';
                }
                return $event;
            });

        // 📆 Hitung hari kerja bulan ini
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $period = CarbonPeriod::create($startOfMonth, $endOfMonth);
        $total_hari_kerja = collect($period)->filter(fn($d) => !$d->isWeekend())->count();

        // 📈 Persentase kehadiran sekolah
        $total_hadir = Kehadiran::where('kehadiran', 'hadir')
            ->whereBetween('tanggal', [$startOfMonth, $endOfMonth])
            ->count();

        $total_siswa = User::where('role', 'murid')->count();
        $total_kehadiran_ideal = $total_siswa * $total_hari_kerja;

        $attendance_percentage = $total_kehadiran_ideal > 0
            ? round(($total_hadir / $total_kehadiran_ideal) * 100, 2)
            : 0;

        // 🧮 Rekap kehadiran per siswa (Top 3)
        // 🧮 Rekap kehadiran per siswa (Top 3)
$rekap = Kehadiran::select('murid_id')
    ->selectRaw('SUM(CASE WHEN kehadiran IN ("Hadir", "terlambat") THEN 1 ELSE 0 END) as hadir')
    ->groupBy('murid_id')
    ->get()
    ->map(function ($r) use ($total_hari_kerja) {
        $user = User::find($r->murid_id);
        $hadir = (int) $r->hadir;
        $percent = $total_hari_kerja > 0 ? round(($hadir / $total_hari_kerja) * 100) : 0;

        // ✅ Tentukan avatar hybrid dengan fallback aman
        $avatarUrl = asset('default-avatar.png'); // default dulu

        if ($user) {
            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                $avatarUrl = asset('storage/' . $user->avatar_path);
            
            }
        }

        return [
            'id' => $r->murid_id,
            'nama' => $user?->name ?? 'Unknown',
            'avatar' => $avatarUrl,
            'kelas' => $user?->kelas?->name ?? '-',
            'total' => "{$hadir}/{$total_hari_kerja}",
            'persentase' => $percent,
        ];
    })
    ->sortByDesc(fn($x) => $x['persentase'])
    ->values()
    ->take(3);


        // 👥 User list dengan avatar hybrid
        $users = User::latest()
            ->take(5)
            ->get()
            ->map(function ($u) {
                if ($u->avatar_path && Storage::disk('public')->exists($u->avatar_path)) {
                    $avatarUrl = asset('storage/' . str_replace('public/', '', $u->avatar_path));
                } elseif ($u->avatar && str_starts_with($u->avatar, 'data:image')) {
                    $avatarUrl = $u->avatar;
                } else {
                    $avatarUrl = asset('images/default-avatar.png');
                }

                $u->avatar = $avatarUrl;
                return $u;
            });

        // ⚽ Data eskul
        $eskuls = Eskul::withCount(['siswa as anggota_count'])
            ->latest()
            ->take(5)
            ->get();

        // 📤 Kirim ke Inertia
        Log::info('Avatar URL Sample', [
            'rekap_sample_avatar' => $rekap->first()['avatar'] ?? null
        ]);

        

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
