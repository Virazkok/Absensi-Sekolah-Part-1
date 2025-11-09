<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kehadiran;
use Carbon\Carbon;

class KehadiranController extends Controller
{
    public function autoCheckout(Request $request)
    {
        $muridId = $request->murid_id;
        $today = Carbon::today()->toDateString();
        $presensi = Kehadiran::where('murid_id', $muridId)
            ->whereDate('tanggal', $today)
            ->first();

        if (!$presensi) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada data presensi hari ini.'
            ], 404);
        }
        if ($presensi->jam_masuk && !$presensi->jam_keluar) {
            $presensi->jam_keluar = null;
            $presensi->kehadiran = 'Tidak Hadir';
            $presensi->save();

            return response()->json([
                'success' => true,
                'message' => 'Auto-checkout berhasil. Status diubah ke Tidak Hadir.',
                'data' => $presensi
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Tidak ada update. Sudah check-out atau belum check-in.'
        ], 200);
    }
}
