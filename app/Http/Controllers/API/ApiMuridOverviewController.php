<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kehadiran;
use App\Models\KehadiranEskul;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ApiMuridOverviewController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $murid = $user->murid; // relasi ke murid
        $type = $request->query('type', 'sekolah'); // default sekolah
        $filter = $request->query('filter', 'bulan_ini'); // default bulan ini
        $eskulId = $request->query('eskul_id'); // opsional

        // Tentukan tanggal filter
        if ($filter === 'bulan_ini') {
            $startDate = Carbon::now()->startOfMonth();
            $endDate   = Carbon::now()->endOfMonth();
        } elseif ($filter === 'bulan_lalu') {
            $startDate = Carbon::now()->subMonth()->startOfMonth();
            $endDate   = Carbon::now()->subMonth()->endOfMonth();
        } else {
            $startDate = null;
            $endDate   = null;
        }

        // Pilih model berdasarkan type
        if ($type === 'eskul') {
            $query = KehadiranEskul::where('user_id', $user->id);

            if ($eskulId) {
                $query->whereHas('absensi', function ($q) use ($eskulId) {
                    $q->where('eskul_id', $eskulId);
                });
            }

        } else {
            // default: sekolah
            if (!$murid) {
                return response()->json([
                    'error' => 'Data murid tidak ditemukan'
                ], 404);
            }

            $query = Kehadiran::where('murid_id', $murid->id);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('tanggal', [$startDate, $endDate]);
        }

        $records = $query->get();

        // === Gunakan kolom sesuai type ===
        if ($type === 'eskul') {
            $field = 'status'; // di kehadiran_eskuls
        } else {
            $field = 'kehadiran'; // di kehadiran (sekolah)
        }

        $total = $records->count();
        $hadir = $records->whereIn($field, ['Hadir', 'terlambat'])->count();
        $tidakHadir = $records->where($field, 'Tidak Hadir')->count();
        $terlambat = $records->where($field, 'terlambat')->count();

        $percentage = $total > 0 ? round(($hadir / $total) * 100, 2) : 0;

        // Predikat sesuai aturan
        if ($percentage < 50) {
            $predikat = "Kurang";
        } elseif ($percentage >= 50 && $percentage <= 60) {
            $predikat = "Cukup";
        } elseif ($percentage >= 61 && $percentage <= 74) {
            $predikat = "Baik";
        } else {
            $predikat = "Sangat Baik";
        }

        return response()->json([
            'type'        => $type,
            'total'       => $total,
            'hadir'       => $hadir,
            'tidak_hadir' => $tidakHadir,
            'terlambat'   => $terlambat,
            'percentage'  => $percentage,
            'predikat'    => $predikat,
        ]);
    }
}
