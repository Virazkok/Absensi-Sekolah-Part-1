<?php

namespace App\Http\Controllers\Orangtua;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Kelas;
use App\Models\Eskul;
use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use App\Models\EventKehadiran;
use Illuminate\Support\Facades\Log;

class OrangTuaGuruController extends Controller
{
    
    public function dashboard()
    {
        return Inertia::render('OrangTua/ParentTeacherDashboard');
    }
    public function attendanceHistory(Request $request)
    {
        if ($request->is('api/*')) {
            $type     = $request->query('type', 'sekolah'); 
            $kelasId  = $request->query('kelas_id');
            $search   = $request->query('search', '');
            $page     = max(1, (int)$request->query('page', 1));
            $perPage  = (int)$request->query('per_page', 10);

            
            $mode     = $request->query('mode', null); 
            $week     = (int) $request->query('week', 0);
            $month    = (int) $request->query('month', now()->month);
            $year     = (int) $request->query('year', now()->year);
            $semester = $request->query('semester', null);
            $eskulId  = $request->query('eskul_id', null);

            try {
                switch ($type) {
                    case 'eskul':
    $baseQuery = KehadiranEskul::with(['user.murid.kelas', 'absensi.eskul']);

    if ($eskulId) {
        $baseQuery->whereHas('absensi.eskul', fn($q) => $q->where('id', $eskulId));
    }
    if ($kelasId) {
        $baseQuery->whereHas('user.murid', fn($q) => $q->where('kelas_id', $kelasId));
    }
    if ($search) {
        $baseQuery->whereHas('user.murid', fn($q) => $q->where('nama', 'like', "%{$search}%"));
    }

    $baseQuery = $this->applyDateFilter($baseQuery, $mode, $week, $month, $year, $semester, 'tanggal');
   $grouped = $baseQuery->get()->groupBy('user_id')->map(function ($rows) {
    $murid = $rows->first()->user->murid ?? null;
    return [
        'murid_id'     => $murid?->id,
        'student_name' => $murid?->nama ?? $rows->first()->user->name,
        'nis'          => $murid?->nis, // 🔑 tambahkan ini
        'kelas'        => $murid?->kelas->name ?? null,
        'hadir'        => $rows->where('status', 'Hadir')->count(),
        'absen'        => $rows->where('status', 'Tidak Hadir')->count(),
        'total_hadir'        => $rows->count(),
    ];
})->values();


    $items = $grouped;
    $summary = [
        'hadir' => $baseQuery->clone()->where('status', 'Hadir')->count(),
        'absen' => $baseQuery->clone()->where('status', 'Tidak Hadir')->count(),
        'total' => $baseQuery->count(),
    ];

    return response()->json([
        'success' => true,
        'data'    => $items,
        'meta'    => [
            'total' => $items->count(),
            'per_page' => $items->count(),
            'current_page' => 1,
            'last_page' => 1,
        ],
        'summary' => $summary,
    ]);


    case 'event':
    $baseQuery = EventKehadiran::with(['murid.kelas', 'event']);

    if ($kelasId) {
        $baseQuery->whereHas('murid', fn($q) => $q->where('kelas_id', $kelasId));
    }
    if ($search) {
        $baseQuery->whereHas('murid', fn($q) => $q->where('nama', 'like', "%{$search}%"));
    }

    $baseQuery = $this->applyDateFilter(
        $baseQuery, $mode, $week, $month, $year, $semester, 'attended_at'
    );

    $rows = $baseQuery->get();
foreach ($rows as $row) {
    Log::info("Event debug", [
        'event_id' => $row->event_id,
        'event' => $row->event?->toArray(),
    ]);
}

   $grouped = $baseQuery->get()
    ->groupBy(fn($row) => $row->murid_id . '-' . $row->event_id)
    ->map(function ($rows) {
        $murid = $rows->first()->murid;
        $event = $rows->first()->event;

        return [
            'murid_id'     => $murid?->id,
            'student_name' => $murid?->nama,
            'nis'          => $murid?->nis,
            'kelas'        => $murid?->kelas->name ?? null,
            'event_id'     => $event?->id,
            'nama_event'   => $event?->title ?? '[Tanpa Nama Event]', // ambil title
            'total_hadir'  => $rows->count(),
        ];
    })->values();


    return response()->json([
        'success' => true,
        'data'    => $grouped,
        'summary' => [
            'ikut' => $baseQuery->count(),
        ],
    ]);

case 'sekolah':
default:
    $baseQuery = Kehadiran::with(['murid.kelas', 'kelas']);
    if ($kelasId) {
        $baseQuery->where('kelas_id', $kelasId);
    }
    if ($search) {
        $baseQuery->whereHas('murid', fn($q) => $q->where('nama', 'like', "%{$search}%"));
    }

    $baseQuery = $this->applyDateFilter($baseQuery, $mode, $week, $month, $year, $semester, 'tanggal');


   $grouped = $baseQuery->get()->groupBy('murid_id')->map(function ($rows) {
    $murid = $rows->first()->murid;
    return [
        'murid_id'     => $murid->id,
        'student_name' => $murid->nama,
        'nis'          => $murid->nis, // 🔑 tambahkan ini
        'kelas'        => $murid->kelas->name ?? null,
        'total_hadir'        => $rows->where('kehadiran', 'Hadir')->count(),
        'absen'        => $rows->where('kehadiran', 'Tidak Hadir')->count(),
        'terlambat'    => $rows->where('kehadiran', 'Terlambat')->count(),
    ];
})->values();


    $items = $grouped;
    $summary = [
        'hadir'     => $baseQuery->clone()->where('kehadiran', 'Hadir')->count(),
        'absen'     => $baseQuery->clone()->where('kehadiran', 'Tidak Hadir')->count(),
        'terlambat' => $baseQuery->clone()->where('kehadiran', 'Terlambat')->count(),
    ];

    return response()->json([
        'success' => true,
        'data'    => $items,
        'meta'    => [
            'total' => $items->count(),
            'per_page' => $items->count(),
            'current_page' => 1,
            'last_page' => 1,
        ],
        'summary' => $summary,
    ]);

                }

                
            } catch (\Exception $e) {
                Log::error("attendanceHistory error: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
                return response()->json(['success' => false, 'message' => 'Server error'], 500);
            }
        }
        $kelas = Kelas::all(['id', 'name']);
        $eskul = Eskul::all(['id', 'nama']);

        return Inertia::render('OrangTua/RiwayatOrangTuaGuru', [
            'kelas' => $kelas,
            'eskul' => $eskul,
        ]);
    }
    private function applyDateFilter($query, $mode, $week, $month, $year, $semester, $column = 'tanggal')
    {
        if ($mode === 'weekly') {
            $start = now()->startOfWeek()->addWeeks($week);
            $end   = (clone $start)->endOfWeek();
            $query->whereBetween($column, [$start, $end]);
        } elseif ($mode === 'monthly') {
            $query->whereYear($column, $year)->whereMonth($column, $month);
        } elseif ($mode === 'semester') {
            if ($semester == 1) {
                $query->whereBetween($column, [
                    now()->setDate($year,1,1)->startOfDay(),
                    now()->setDate($year,6,30)->endOfDay()
                ]);
            } elseif ($semester == 2) {
                $query->whereBetween($column, [
                    now()->setDate($year,7,1)->startOfDay(),
                    now()->setDate($year,12,31)->endOfDay()
                ]);
            }
        }
        return $query;
    }

    public function studentList()
    {
        return response()->json(['success' => true, 'message' => 'implement if needed']);
    }
}
