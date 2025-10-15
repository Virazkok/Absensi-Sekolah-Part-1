<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Event;
use App\Models\Eskul;
use App\Models\Kehadiran;
use App\Models\EventKehadiran;
use App\Models\KehadiranEskul;

class DashboardController extends Controller
{
   public function index()
{
    $totalUsers  = User::count();
    $totalEvents = Event::count();
    $totalEskul  = Eskul::count();

    // ambil user terbaru 5 orang untuk ditampilkan di tabel
    $users = User::select('id', 'name', 'email', 'avatar')
        ->latest()
        ->take(5)
        ->get();

    $events = Event::select('id', 'title', 'start_date', 'end_date')
        ->latest()
        ->take(5)
        ->get();

    $eskuls = Eskul::take(5)->get()->map(function ($eskul) {
        $count = User::where('eskul_siswa1_id', $eskul->id)
            ->orWhere('eskul_siswa2_id', $eskul->id)
            ->orWhere('eskul_siswa3_id', $eskul->id)
            ->count();

        $eskul->anggota_count = $count;
        return $eskul;
    });

    return inertia('Admin/AdminDashboard', [
        "total_users" => $totalUsers,
        "total_events" => $totalEvents,
        "total_eskul" => $totalEskul,
        "users" => $users,
        "events" => $events,
        "eskuls" => $eskuls,
    ]);
}

public function index1() {
    return inertia('dashboard');
}

}

